
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from ortools.sat.python import cp_model


app = FastAPI(
    title="AyurDhara OR-Tools Scheduler",
    version="1.1.0"
)


# --------------------------------------------------
# DATA MODELS
# --------------------------------------------------

class Therapist(BaseModel):
    therapist_id: str
    name: str = ""

    expertise: List[str] = Field(default_factory=list)

    # Monday = 1, Tuesday = 2 ... Sunday = 7
    work_days: List[int] = Field(
        default_factory=lambda: [1, 2, 3, 4, 5, 6]
    )

    workday_start: str = "09:00:00"
    workday_end: str = "17:00:00"


class Booking(BaseModel):
    therapist_id: str
    appointment_start: str
    duration_minutes: int = 60


class ScheduleRequest(BaseModel):
    treatment_name: str

    duration_minutes: int = Field(
        gt=0,
        le=480
    )

    priority: int = Field(
        default=2,
        ge=1,
        le=5
    )

    earliest_start: str
    latest_start: str

    therapists: List[Therapist]

    existing_appointments: List[Booking] = Field(
        default_factory=list
    )

    preferred_therapist_id: Optional[str] = None


# --------------------------------------------------
# HELPER FUNCTIONS
# --------------------------------------------------

def parse_local(value: str) -> datetime:
    """
    Parse timezone-naive local wall-clock timestamps.
    """
    try:
        return datetime.fromisoformat(value)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid datetime: {value}"
        )


def minutes_of_day(value: str) -> int:
    """
    Convert HH:MM or HH:MM:SS into minutes from midnight.
    """
    try:
        parts = value.split(":")

        hour = int(parts[0])
        minute = int(parts[1])

        return hour * 60 + minute

    except (ValueError, IndexError):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid working time: {value}"
        )


def expertise_matches(
    treatment: str,
    expertise: List[str]
) -> bool:

    wanted = treatment.strip().casefold()

    if not wanted:
        return False

    for item in expertise:

        available = item.strip().casefold()

        if not available:
            continue

        if (
            wanted == available
            or wanted in available
            or available in wanted
        ):
            return True

    return False


def ceil_to_15_minutes(dt: datetime) -> datetime:
    """
    Round a datetime UP to the next 15-minute interval.

    Examples:
    10:00 -> 10:00
    10:07 -> 10:15
    10:16 -> 10:30
    10:45 -> 10:45
    """

    dt = dt.replace(second=0, microsecond=0)

    remainder = dt.minute % 15

    if remainder:
        dt += timedelta(minutes=15 - remainder)

    return dt


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():

    return {
        "status": "ok",
        "solver": "Google OR-Tools CP-SAT",
        "version": "1.1.0"
    }


# --------------------------------------------------
# SCHEDULING ENDPOINT
# --------------------------------------------------

@app.post("/schedule")
def schedule(payload: ScheduleRequest):

    earliest = parse_local(payload.earliest_start)

    latest = parse_local(payload.latest_start)

    if latest < earliest:

        raise HTTPException(
            status_code=400,
            detail="Latest appointment time is before earliest time"
        )

    # --------------------------------------------------
    # STEP 1: FIND SUITABLE THERAPISTS
    # --------------------------------------------------

    candidates = [
        therapist
        for therapist in payload.therapists
        if expertise_matches(
            payload.treatment_name,
            therapist.expertise
        )
    ]

    if not candidates:

        raise HTTPException(
            status_code=400,
            detail=(
                "No therapist matches this treatment expertise. "
                "Check treatment requirements and therapist expertise."
            )
        )

    # --------------------------------------------------
    # STEP 2: TIME CONVERSION
    # --------------------------------------------------

    day_zero = earliest.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    def to_units(dt: datetime) -> int:

        total_minutes = int(
            (dt - day_zero).total_seconds() // 60
        )

        return total_minutes // 15

    earliest_u = to_units(earliest)

    latest_u = to_units(latest)

    duration_u = (
        payload.duration_minutes + 14
    ) // 15

    # --------------------------------------------------
    # STEP 3: CREATE CP-SAT MODEL
    # --------------------------------------------------

    model = cp_model.CpModel()

    assignments = []
    starts = []
    intervals = []

    preference_penalties = []

    # --------------------------------------------------
    # STEP 4: PROCESS EACH THERAPIST
    # --------------------------------------------------

    for idx, therapist in enumerate(candidates):

        assign = model.new_bool_var(
            f"assign_{idx}"
        )

        start = model.new_int_var(
            earliest_u,
            latest_u,
            f"start_{idx}"
        )

        interval = model.new_optional_fixed_size_interval_var(
            start,
            duration_u,
            assign,
            f"treatment_{idx}"
        )

        assignments.append(assign)
        starts.append(start)
        intervals.append(interval)

        # --------------------------------------------------
        # STEP 5: WORKING DAY AND WORKING HOURS
        # --------------------------------------------------

        allowed_days = set(
            therapist.work_days or [1, 2, 3, 4, 5, 6]
        )

        open_min = minutes_of_day(
            therapist.workday_start
        )

        close_min = minutes_of_day(
            therapist.workday_end
        )

        if close_min <= open_min:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid working hours for therapist "
                    f"{therapist.name}"
                )
            )

        allowed_starts = []

        current = earliest.date()

        last_date = latest.date()

        while current <= last_date:

            # ISO weekday:
            # Monday = 1 ... Sunday = 7

            if current.isoweekday() in allowed_days:

                opening = (
                    datetime.combine(
                        current,
                        datetime.min.time()
                    )
                    + timedelta(minutes=open_min)
                )

                closing = (
                    datetime.combine(
                        current,
                        datetime.min.time()
                    )
                    + timedelta(minutes=close_min)
                )

                first = max(
                    earliest,
                    opening
                )

                last_start = min(
                    latest,
                    closing - timedelta(
                        minutes=payload.duration_minutes
                    )
                )

                # FIX: Always round UP to a valid 15-minute slot.
                cursor = ceil_to_15_minutes(first)

                while cursor <= last_start:

                    allowed_starts.append(
                        to_units(cursor)
                    )

                    cursor += timedelta(minutes=15)

            current += timedelta(days=1)

        # If no working slot exists, therapist cannot be assigned.
        if not allowed_starts:

            model.add(assign == 0)

        else:

            model.add_allowed_assignments(
                [start],
                [(value,) for value in sorted(set(allowed_starts))]
            ).only_enforce_if(assign)

        # --------------------------------------------------
        # STEP 6: EXISTING APPOINTMENTS
        # --------------------------------------------------

        for j, booking in enumerate(
            payload.existing_appointments
        ):

            if (
                str(booking.therapist_id)
                != str(therapist.therapist_id)
            ):
                continue

            booking_start = parse_local(
                booking.appointment_start
            )

            booking_duration = max(
                1,
                (int(booking.duration_minutes) + 14) // 15
            )

            booking_start_u = to_units(
                booking_start
            )

            fixed_interval = (
                model.new_fixed_size_interval_var(
                    booking_start_u,
                    booking_duration,
                    f"existing_{idx}_{j}"
                )
            )

            model.add_no_overlap(
                [interval, fixed_interval]
            )

        # --------------------------------------------------
        # STEP 7: THERAPIST PREFERENCE
        # --------------------------------------------------

        if (
            payload.preferred_therapist_id
            and str(therapist.therapist_id)
            != str(payload.preferred_therapist_id)
        ):

            preference_penalties.append(
                assign * 30
            )

    # --------------------------------------------------
    # STEP 8: EXACTLY ONE THERAPIST
    # --------------------------------------------------

    model.add(
        sum(assignments) == 1
    )

    # --------------------------------------------------
    # STEP 9: OPTIMIZATION OBJECTIVE
    # --------------------------------------------------

    delay_cost = sum(
        (starts[i] - earliest_u) * payload.priority
        for i in range(len(candidates))
    )

    preference_cost = (
        sum(preference_penalties)
        if preference_penalties
        else 0
    )

    model.minimize(
        delay_cost + preference_cost
    )

    # --------------------------------------------------
    # STEP 10: RUN OR-TOOLS
    # --------------------------------------------------

    solver = cp_model.CpSolver()

    solver.parameters.max_time_in_seconds = 8.0

    status = solver.solve(model)

    if status not in (
        cp_model.OPTIMAL,
        cp_model.FEASIBLE
    ):

        raise HTTPException(
            status_code=409,
            detail=(
                "No suitable appointment slot was found "
                "within the supplied date and time window. "
                "Check therapist expertise, working days, "
                "working hours and existing appointments."
            )
        )

    # --------------------------------------------------
    # STEP 11: GET SELECTED THERAPIST
    # --------------------------------------------------

    chosen_idx = next(
        i
        for i, variable in enumerate(assignments)
        if solver.value(variable)
    )

    chosen = candidates[chosen_idx]

    # --------------------------------------------------
    # STEP 12: CALCULATE APPOINTMENT TIME
    # --------------------------------------------------

    start_dt = (
        day_zero
        + timedelta(
            minutes=solver.value(
                starts[chosen_idx]
            ) * 15
        )
    )

    end_dt = (
        start_dt
        + timedelta(
            minutes=payload.duration_minutes
        )
    )

    # --------------------------------------------------
    # STEP 13: RETURN RESULT
    # --------------------------------------------------

    return {
        "status": (
            "OPTIMAL"
            if status == cp_model.OPTIMAL
            else "FEASIBLE"
        ),

        "therapist_id": chosen.therapist_id,

        "therapist_name": chosen.name,

        "appointment_start": start_dt.isoformat(
            timespec="seconds"
        ),

        "appointment_end": end_dt.isoformat(
            timespec="seconds"
        ),

        "duration_minutes": payload.duration_minutes,

        "treatment_name": payload.treatment_name,

        "priority": payload.priority,

        "objective_value": solver.objective_value
    }
