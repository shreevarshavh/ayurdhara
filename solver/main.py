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
    # ISO weekday: Monday=1 ... Sunday=7
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
    existing_appointments: list[ExistingAppointment] = Field(default_factory=list)


def normalize(value: Any) -> list[str]:
    if value is None:
        return []

    values = value if isinstance(value, list) else [value]
    result = []

    for item in values:
        cleaned = " ".join(str(item).lower().strip().split())

        if cleaned:
            result.append(cleaned)

    return result


def is_qualified(therapist: Therapist, treatment_name: str) -> bool:
    treatment = " ".join(
        treatment_name.lower().strip().split()
    )

    if not treatment:
        return False

    # Extract the primary therapy name.
    primary_treatment = treatment.split(",")[0].strip()

    expertise_list = normalize(therapist.expertise)
    specialization = " ".join(
        str(getattr(therapist, "specialization", "")).lower().split()
    )

    for expertise in expertise_list:
        primary_expertise = expertise.split(",")[0].strip()

        if (
            treatment == expertise
            or primary_treatment == primary_expertise
            or treatment == primary_expertise
            or primary_treatment == expertise
        ):
            return True

    return False


def parse_work_time(value: str) -> time:
    try:
        return time.fromisoformat(value)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid therapist working time: {value}"
        )


def ceil_to_five_minutes(value: datetime) -> datetime:
    value = value.replace(second=0, microsecond=0)
    remainder = value.minute % 5
    if remainder:
        value += timedelta(minutes=5 - remainder)
    return value


@app.get("/health")
def health():
    return {"status": "ok", "solver": "Google OR-Tools CP-SAT"}


@app.post("/schedule")
def schedule(request: ScheduleRequest):
    if not request.therapists:
        raise HTTPException(status_code=400, detail="No therapists supplied.")

    earliest = request.earliest_start
    latest = request.latest_start

    if latest < earliest:
        raise HTTPException(
            status_code=400,
            detail="latest_start must be at or after earliest_start."
        )

    if request.duration_minutes < 15 or request.duration_minutes % 5 != 0:
        raise HTTPException(
            status_code=400,
            detail="Treatment duration must be at least 15 minutes and in multiples of 5."
        )

    # Ensure all timestamps use the same timezone convention.
    for booking in request.existing_appointments:
        if (booking.appointment_start.tzinfo is None) != (earliest.tzinfo is None):
            raise HTTPException(
                status_code=400,
                detail="Appointment datetimes must consistently include or omit timezone information."
            )

    model = cp_model.CpModel()
    choices = []
    details = []

    for therapist_index, therapist in enumerate(request.therapists):
        if not is_qualified(therapist, request.treatment_name):
            continue

        allowed_days = set(therapist.work_days or [1, 2, 3, 4, 5, 6])
        opening_time = parse_work_time(therapist.workday_start)
        closing_time = parse_work_time(therapist.workday_end)

        opening_minutes = opening_time.hour * 60 + opening_time.minute
        closing_minutes = closing_time.hour * 60 + closing_time.minute

        if closing_minutes <= opening_minutes:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid working hours for therapist {therapist.name}."
            )

        day = earliest.date()
        while day <= latest.date():
            if day.isoweekday() in allowed_days:
                opening = datetime.combine(day, opening_time, tzinfo=earliest.tzinfo)
                closing = datetime.combine(day, closing_time, tzinfo=earliest.tzinfo)

                first_start = ceil_to_five_minutes(max(earliest, opening))
                last_start = min(
                    latest,
                    closing - timedelta(minutes=request.duration_minutes)
                )

                candidate = first_start
                while candidate <= last_start:
                    candidate_end = candidate + timedelta(
                        minutes=request.duration_minutes
                    )

                    # Reject candidates that overlap any existing booking
                    # belonging to this therapist.
                    has_conflict = False
                    for booking in request.existing_appointments:
                        if str(booking.therapist_id) != str(therapist.therapist_id):
                            continue
                        booking_end = booking.appointment_start + timedelta(
                            minutes=booking.duration_minutes
                        )
                        if candidate < booking_end and booking.appointment_start < candidate_end:
                            has_conflict = True
                            break

                    if not has_conflict:
                        variable = model.NewBoolVar(
                            f"t{therapist_index}_{candidate.strftime('%Y%m%d_%H%M')}"
                        )
                        choices.append(variable)
                        # Prefer the earliest available appointment. Therapist
                        # index is only a deterministic tie-breaker.
                        minutes_from_start = int(
                            (candidate - earliest).total_seconds() // 60
                        )
                        details.append({
                            "variable": variable,
                            "therapist": therapist,
                            "start": candidate,
                            "score": minutes_from_start * 100 + therapist_index
                        })

                    candidate += timedelta(minutes=5)

            day += timedelta(days=1)

    if not choices:
        return {
            "status": "INFEASIBLE",
            "message": (
                "No suitable slot was found in the supplied date range. "
                "Check therapist expertise, working days, working hours, "
                "and existing appointments."
            )
        }

    model.AddExactlyOne(choices)
    model.Minimize(sum(
        item["variable"] * item["score"] for item in details
    ))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 8.0
    status = solver.Solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return {
            "status": solver.StatusName(status),
            "message": "The solver could not find a feasible appointment."
        }

    selected = next(
        item for item in details if solver.Value(item["variable"]) == 1
    )
    start = selected["start"]
    end = start + timedelta(minutes=request.duration_minutes)

    return {
        "status": solver.StatusName(status),
        "therapist_id": selected["therapist"].therapist_id,
        "therapist_name": selected["therapist"].name,
        "treatment_name": request.treatment_name,
        "appointment_start": start.isoformat(timespec="seconds"),
        "appointment_end": end.isoformat(timespec="seconds"),
        "duration_minutes": request.duration_minutes,
        "priority": request.priority,
        "message": "A feasible appointment was found. It has not yet been saved to the database."
    }
