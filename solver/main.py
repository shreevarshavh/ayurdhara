
from datetime import datetime, time, timedelta
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from ortools.sat.python import cp_model

app = FastAPI(title="AyurDhara OR-Tools Scheduler")


class Therapist(BaseModel):
    therapist_id: str
    name: str = ""
    expertise: Any = Field(default_factory=list)
    work_days: list[int] = Field(default_factory=lambda: [1, 2, 3, 4, 5, 6])
    workday_start: str = "09:00"
    workday_end: str = "17:00"


class ExistingAppointment(BaseModel):
    therapist_id: str
    appointment_start: datetime
    duration_minutes: int = 60


class ScheduleRequest(BaseModel):
    treatment_name: str
    duration_minutes: int = Field(default=60, ge=15, le=480)
    priority: int = Field(default=2, ge=1, le=5)
    earliest_start: datetime
    latest_start: datetime
    therapists: list[Therapist]
    existing_appointments: list[ExistingAppointment] = Field(
        default_factory=list
    )


def normalize(value: Any) -> list[str]:
    if value is None:
        return []

    if isinstance(value, str):
        values = [value]
    elif isinstance(value, list):
        values = value
    else:
        values = [str(value)]

    result = []
    for item in values:
        for part in str(item).replace(";", ",").split(","):
            cleaned = " ".join(part.lower().strip().split())
            if cleaned:
                result.append(cleaned)

    return result


def is_qualified(therapist: Therapist, treatment_name: str) -> bool:
    treatment = " ".join(treatment_name.lower().strip().split())
    expertise_items = normalize(therapist.expertise)

    if not treatment:
        return False

    return any(
        treatment == item or treatment in item or item in treatment
        for item in expertise_items
    )


def parse_work_time(value: str) -> time:
    return time.fromisoformat(value)


@app.get("/health")
def health():
    return {"status": "ok", "solver": "Google OR-Tools CP-SAT"}


@app.post("/schedule")
def schedule(request: ScheduleRequest):
    if not request.therapists:
        raise HTTPException(
            status_code=400,
            detail="No therapists supplied."
        )

    earliest = request.earliest_start
    latest = request.latest_start

    if earliest.date() != latest.date():
        raise HTTPException(
            status_code=400,
            detail="Earliest and latest start must be on the same date."
        )

    if latest < earliest:
        raise HTTPException(
            status_code=400,
            detail="latest_start must be at or after earliest_start."
        )

    # Use 15-minute increments relative to midnight.
    day_start = datetime.combine(
        earliest.date(),
        time.min,
        tzinfo=earliest.tzinfo
    )

    earliest_minutes = int(
        (earliest - day_start).total_seconds() // 60
    )
    latest_minutes = int(
        (latest - day_start).total_seconds() // 60
    )

    earliest_slot = (earliest_minutes + 14) // 15
    latest_slot = latest_minutes // 15

    model = cp_model.CpModel()
    choices = []
    choice_details = []

    for therapist_index, therapist in enumerate(request.therapists):
        if not is_qualified(therapist, request.treatment_name):
            continue

        if earliest.isoweekday() not in therapist.work_days:
            continue

        work_start = parse_work_time(therapist.workday_start)
        work_end = parse_work_time(therapist.workday_end)

        work_start_min = work_start.hour * 60 + work_start.minute
        work_end_min = work_end.hour * 60 + work_end.minute

        for slot in range(earliest_slot, latest_slot + 1):
            start_minute = slot * 15
            end_minute = start_minute + request.duration_minutes

            if start_minute < work_start_min:
                continue

            if end_minute > work_end_min:
                continue

            start_dt = day_start + timedelta(minutes=start_minute)
            end_dt = start_dt + timedelta(
                minutes=request.duration_minutes
            )

            conflict = False

            for appointment in request.existing_appointments:
                if appointment.therapist_id != therapist.therapist_id:
                    continue

                existing_start = appointment.appointment_start

                if (start_dt.tzinfo is None) != (
                    existing_start.tzinfo is None
                ):
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "Appointment datetimes must consistently "
                            "include or omit timezone information."
                        )
                    )

                existing_end = existing_start + timedelta(
                    minutes=appointment.duration_minutes
                )

                if start_dt < existing_end and existing_start < end_dt:
                    conflict = True
                    break

            if conflict:
                continue

            choice = model.NewBoolVar(
                f"therapist_{therapist_index}_slot_{slot}"
            )

            choices.append(choice)
            choice_details.append({
                "variable": choice,
                "therapist": therapist,
                "start": start_dt,
                "slot": slot,
                "therapist_index": therapist_index,
            })

    if not choices:
        return {
            "status": "INFEASIBLE",
            "message": (
                "No qualified therapist and appointment slot satisfy "
                "the current constraints."
            ),
        }

    # Exactly one feasible therapist/time combination is selected.
    model.AddExactlyOne(choices)

    # Minimize appointment time; break ties by therapist order.
    model.Minimize(
        sum(
            item["variable"] * (
                item["slot"] * 100 + item["therapist_index"]
            )
            for item in choice_details
        )
    )

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5.0
    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return {
            "status": solver.StatusName(status),
            "message": "The solver could not find a feasible appointment.",
        }

    selected = next(
        item for item in choice_details
        if solver.Value(item["variable"]) == 1
    )

    appointment_start = selected["start"]
    appointment_end = appointment_start + timedelta(
        minutes=request.duration_minutes
    )

    return {
        "status": solver.StatusName(status),
        "therapist_id": selected["therapist"].therapist_id,
        "therapist_name": selected["therapist"].name,
        "treatment_name": request.treatment_name,
        "appointment_start": appointment_start.isoformat(),
        "appointment_end": appointment_end.isoformat(),
        "duration_minutes": request.duration_minutes,
        "priority": request.priority,
        "message": (
            "A feasible appointment was found. "
            "It has not yet been saved to the database."
        ),
    }
