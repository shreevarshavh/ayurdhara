import React from "react";
import { Sparkles, ArrowRight, CalendarDays, Clock, Printer } from "lucide-react";
import { fmtDate, fmtTime, shortId } from "../utils";

export default function Scheduling({
  treatments,
  therapists,
  selectedTreatment,
  setSelectedTreatment,
  form,
  setForm,
  onSubmit,
  busy,
}) {
  const selected = treatments.find(
    (t) => t.uuid === selectedTreatment
  );

  const inputClass =
    "w-full min-w-0 rounded-xl border border-[#dfe8dc] bg-[#fcfdfb] px-4 py-3.5 text-sm text-[#244735] outline-none transition focus:border-[#83a88b] focus:ring-4 focus:ring-[#e9f2e8]";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#405c49]";

  return (
    <div className="flex flex-col gap-6">

      {/* MAIN SCHEDULING AREA */}
      <div className="grid grid-cols-[minmax(0,1.55fr)_minmax(280px,0.95fr)] items-start gap-6 max-[950px]:grid-cols-1">

        {/* SCHEDULE FORM */}
        <section className="min-w-0 rounded-[18px] border border-[#e5ebe2] bg-white p-7 shadow-[0_4px_18px_rgba(35,73,45,0.045)] max-[600px]:p-5">

          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="m-0 font-['Playfair_Display',Georgia,serif] text-2xl font-bold text-[#194b35]">
                Schedule a treatment
              </h2>

              <p className="mt-2 text-sm text-[#839087]">
                Changes are saved to the existing treatment record.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-5">

            {/* TREATMENT */}
            <div>
              <label className={labelClass}>
                Treatment record
              </label>

              <select
                className={inputClass}
                value={selectedTreatment}
                onChange={(e) => {
                  const val = e.target.value;

                  setSelectedTreatment(val);

                  const matched = treatments.find(
                    (t) => t.uuid === val
                  );

                  if (matched) {
                    setForm((prev) => ({
                      ...prev,
                      therapist_id:
                        matched.therapist_id ||
                        prev.therapist_id,
                      duration_minutes:
                        matched.duration_minutes ||
                        prev.duration_minutes ||
                        60,
                      priority:
                        matched.priority ||
                        prev.priority ||
                        3,
                    }));
                  }
                }}
                required
              >
                <option value="">
                  Choose a treatment...
                </option>

                {treatments.map((t) => (
                  <option key={t.uuid} value={t.uuid}>
                    {t.patient_name || shortId(t.patient_id)}
                    {" | "}
                    {t.p1 || "Treatment"}
                    {" | "}
                    {shortId(t.uuid)}
                  </option>
                ))}
              </select>

              {selected && (
                <div className="mt-3 rounded-xl border border-[#e2ebdd] bg-[#f5f8f1] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#829281]">
                    Selected patient
                  </span>

                  <p className="mb-1 mt-2 text-sm font-bold text-[#24563b]">
                    {selected.patient_name || "Patient"}
                  </p>

                  <p className="m-0 break-all text-xs text-[#879489]">
                    Record: {selected.uuid}
                  </p>
                </div>
              )}
            </div>

            {/* THERAPIST */}
            <div>
              <label className={labelClass}>
                Therapist
              </label>

              <select
                className={inputClass}
                value={form.therapist_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    therapist_id: e.target.value,
                  })
                }
              >
                <option value="">
                  Auto-assign by expertise and availability...
                </option>

                {therapists.map((t) => (
                  <option
                    key={t.therapist_id}
                    value={t.therapist_id}
                  >
                    {t.name}
                    {t.specialization
                      ? ` | ${t.specialization}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* DATE AND DURATION */}
            <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">

              <div className="min-w-0">
                <label className={labelClass}>
                  Requested date & time
                </label>

                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#819482]"
                  />

                  <input
                    className={`${inputClass} pr-11`}
                    type="datetime-local"
                    value={form.appointment_start}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        appointment_start: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className={labelClass}>
                  Duration (minutes)
                </label>

                <div className="relative">
                  <Clock
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#819482]"
                  />

                  <input
                    className={`${inputClass} pr-11`}
                    type="number"
                    min="1"
                    step="5"
                    value={form.duration_minutes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        duration_minutes: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {/* PRIORITY */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-[#405c49]">
                  Doctor priority (1-5)
                </label>

                <span className="rounded-lg bg-[#edf5e9] px-3 py-1 text-sm font-bold text-[#19563f]">
                  {form.priority} / 5
                </span>
              </div>

              <input
                className="w-full cursor-pointer accent-[#19563f]"
                type="range"
                min="1"
                max="5"
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: Number(e.target.value),
                  })
                }
              />

              <div className="mt-2 flex justify-between text-xs text-[#98a398]">
                <span>Normal priority</span>
                <span>Highest priority</span>
              </div>
            </div>

            {/* OR-TOOLS INFORMATION */}
            <div className="flex gap-3 rounded-xl border border-[#e5eddf] bg-[#f5f8f1] p-4">
              <Sparkles
                size={20}
                className="mt-0.5 shrink-0 text-[#63916a]"
              />

              <div>
                <h3 className="m-0 text-sm font-bold text-[#28583c]">
                  Constraint-based scheduler
                </h3>

                <p className="mb-0 mt-1 text-xs leading-relaxed text-[#788879]">
                  Existing appointments for the selected therapist
                  are considered. OR-Tools minimizes weighted
                  delay and prevents overlapping sessions.
                </p>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={
                busy ||
                !treatments.length ||
                !therapists.length
              }
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#19563f] px-5 py-4 text-sm font-bold text-white shadow-[0_5px_14px_rgba(25,86,63,0.15)] transition hover:-translate-y-0.5 hover:bg-[#124630] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                "Calculating schedule..."
              ) : (
                <>
                  Calculate & save schedule
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        </section>

        {/* SCHEDULING RULES */}
        <aside className="h-fit rounded-[18px] border border-[#e5ebe2] bg-white p-7 shadow-[0_4px_18px_rgba(35,73,45,0.045)] max-[600px]:p-5">

          <h2 className="mb-6 mt-0 font-['Playfair_Display',Georgia,serif] text-2xl font-bold text-[#194b35]">
            Scheduling rules
          </h2>

          {[
            {
              number: "01",
              title: "No overlap",
              description:
                "A therapist cannot be assigned to two sessions at the same time.",
            },
            {
              number: "02",
              title: "Priority-aware",
              description:
                "Higher priority has a larger penalty when the solver moves a requested time.",
            },
            {
              number: "03",
              title: "Database transaction",
              description:
                "Updated appointment times are written back to PostgreSQL.",
            },
          ].map((rule) => (
            <div
              key={rule.number}
              className="flex gap-4 border-t border-[#edf0e9] py-5"
            >
              <span className="text-xs font-extrabold text-[#6b9971]">
                {rule.number}
              </span>

              <div>
                <h3 className="m-0 text-sm font-bold text-[#315a40]">
                  {rule.title}
                </h3>

                <p className="mb-0 mt-2 text-xs leading-relaxed text-[#829087]">
                  {rule.description}
                </p>
              </div>
            </div>
          ))}

          <div className="mt-4 rounded-xl bg-[#f3f5e9] p-4 text-xs leading-relaxed text-[#78815f]">
            <b className="text-[#557044]">Scheduling tip:</b>{" "}
            Choose the original requested time. The solver will
            shift it when it conflicts with another appointment.
          </div>
        </aside>
      </div>

      {/* CURRENT SCHEDULE */}
      <section className="min-w-0 rounded-[18px] border border-[#e5ebe2] bg-white p-7 shadow-[0_4px_18px_rgba(35,73,45,0.045)] max-[600px]:p-5">

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="m-0 font-['Playfair_Display',Georgia,serif] text-2xl font-bold text-[#194b35]">
              Current schedule
            </h2>

            <p className="mb-0 mt-2 text-sm text-[#829087]">
              Existing treatment appointment times
            </p>
          </div>

          <span className="rounded-full bg-[#edf5e9] px-3 py-2 text-xs font-semibold text-[#47764e]">
            {treatments.filter((t) => t.appointment_start).length} scheduled
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">

            <thead>
              <tr>
                {[
                  "Patient",
                  "Treatment",
                  "Therapist",
                  "Date",
                  "Time",
                  "Duration",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="whitespace-nowrap border-b border-[#e8eee5] bg-[#f7f9f5] px-4 py-4 text-[11px] font-extrabold uppercase tracking-wider text-[#829087]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {treatments
                .filter((t) => t.appointment_start)
                .map((t) => (
                  <tr
                    key={t.uuid}
                    className="transition hover:bg-[#f8faf6]"
                  >
                    <td className="border-b border-[#edf1eb] px-4 py-4 text-sm text-[#526659]">
                      {t.patient_name || "—"}
                    </td>

                    <td className="border-b border-[#edf1eb] px-4 py-4 text-sm text-[#526659]">
                      {t.p1 || "Treatment"}
                    </td>

                    <td className="border-b border-[#edf1eb] px-4 py-4 text-sm text-[#526659]">
                      {t.therapist_name || "—"}
                    </td>

                    <td className="border-b border-[#edf1eb] px-4 py-4 text-sm text-[#526659]">
                      {fmtDate(t.appointment_start)}
                    </td>

                    <td className="border-b border-[#edf1eb] px-4 py-4 text-sm text-[#526659]">
                      {fmtTime(t.appointment_start)}
                    </td>

                    <td className="border-b border-[#edf1eb] px-4 py-4 text-sm text-[#526659]">
                      {t.duration_minutes || "—"} min
                    </td>
                  </tr>
                ))}

              {treatments.filter((t) => t.appointment_start).length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-12 text-center text-sm text-[#8b978c]"
                  >
                    No scheduled treatments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}