
import sys
import json
from datetime import datetime, timezone

from ortools.sat.python import cp_model


def parse_datetime(value):
    # PostgreSQL timestamps are normally returned with a timezone.
    value = value.replace("Z", "+00:00")
    dt = datetime.fromisoformat(value)

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    return dt.astimezone(timezone.utc)


def main():
    appointments = json.load(sys.stdin)

    if not appointments:
        print(json.dumps([]))
        return

    # Convert requested appointment times into integer minutes.
    requested_times = [
        int(parse_datetime(item["appointment_start"]).timestamp() // 60)
        for item in appointments
    ]

    # Use the earliest requested appointment as the reference point.
    base_minute = min(requested_times)

    requested_offsets = [
        value - base_minute for value in requested_times
    ]

    durations = [int(item["duration_minutes"]) for item in appointments]
    priorities = [int(item["priority"]) for item in appointments]

    if any(duration <= 0 for duration in durations):
        raise ValueError("Treatment duration must be positive")

    if any(priority < 1 or priority > 5 for priority in priorities):
        raise ValueError("Priority must be between 1 and 5")

    # Allow appointments to be moved forward by up to seven days.
    horizon = max(requested_offsets) + 7 * 24 * 60

    model = cp_model.CpModel()

    starts = []
    intervals = []
    delays = []

    for i, item in enumerate(appointments):
        start = model.new_int_var(
            requested_offsets[i],
            horizon,
            f"start_{i}"
        )

        interval = model.new_fixed_size_interval_var(
            start,
            durations[i],
            f"treatment_{i}"
        )

        delay = model.new_int_var(
            0,
            horizon,
            f"delay_{i}"
        )

        model.add(delay == start - requested_offsets[i])

        starts.append(start)
        intervals.append(interval)
        delays.append(delay)

    # A therapist cannot perform two treatments at the same time.
    model.add_no_overlap(intervals)

    # Higher priority (5) receives a larger penalty for being delayed.
    model.minimize(
        sum(delays[i] * priorities[i] for i in range(len(appointments)))
    )

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 10.0

    status = solver.solve(model)

    if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        raise RuntimeError("No feasible schedule found")

    result = []

    for i, item in enumerate(appointments):
        start_minute = base_minute + solver.value(starts[i])

        start_time = datetime.fromtimestamp(
            start_minute * 60, tz=timezone.utc
        )

        end_time = datetime.fromtimestamp(
            (start_minute + durations[i]) * 60,
            tz=timezone.utc
        )

        result.append({
            "uuid": item["uuid"],
            "appointment_start": start_time.isoformat().replace("+00:00", "Z"),
            "appointment_end": end_time.isoformat().replace("+00:00", "Z")
        })

    print(json.dumps(result))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
