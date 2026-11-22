import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { fmtDate, fmtTime, shortId } from "../utils";
import { PageHeading } from "./Pages";

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
  const selected = treatments.find((t) => t.uuid === selectedTreatment);
  return (
    <>
      <PageHeading
        eyebrow="CONSTRAINT-BASED PLANNING"
        title="Scheduling"
        description="Assign a therapist and use OR-Tools to find a non-overlapping appointment time."
      />
      <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(250px,0.75fr)] max-[900px]:grid-cols-1 gap-[18px] mb-[19px]">
        <section className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] min-w-0 p-[22px] max-[600px]:p-[15px]">
          <div className="flex items-center justify-between gap-[15px] pb-[17px] max-[600px]:items-start">
            <div>
              <h2 className="font-['Manrope',sans-serif] tracking-[-0.035em] text-[17px] mt-0 mb-[5px]">
                Schedule a treatment
              </h2>
              <p className="text-[#77847c] text-[10px] m-0">
                Changes are saved to the existing treatment record.
              </p>
            </div>
            <span className="text-[9px] bg-[#e8f3e8] text-[#2b6d43] rounded-[20px] p-[7px_9px] flex items-center gap-[6px] whitespace-nowrap font-extrabold">
              <i className="w-[6px] h-[6px] rounded-full bg-[#48a364] not-italic inline-block" />{" "}
              OR-Tools enabled
            </span>
          </div>
          <form className="flex flex-col gap-[9px]" onSubmit={onSubmit}>
            <label className="text-[11px] font-bold text-[#506158] mt-[5px]">
              Treatment record
            </label>
            <select
              className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
              value={selectedTreatment}
              onChange={(e) => setSelectedTreatment(e.target.value)}
              required
            >
              <option value="">Choose a treatment…</option>
              {treatments.map((t) => (
                <option key={t.uuid} value={t.uuid}>
                  {t.patient_name || shortId(t.patient_id)} ·{" "}
                  {t.p1 || shortId(t.uuid)} · {shortId(t.uuid)}
                </option>
              ))}
            </select>
            {selected && (
              <div className="bg-[#f0f6ee] border border-[#e0ebdd] rounded-[8px] p-[10px] flex flex-col gap-[4px]">
                <span className="text-[9px] text-[#7c8d7d]">
                  Selected patient
                </span>
                <b className="text-[12px]">
                  {selected.patient_name || "Patient"}
                </b>
                <small className="text-[9px] text-[#7c8d7d]">
                  Record: {selected.uuid}
                </small>
              </div>
            )}
            <label className="text-[11px] font-bold text-[#506158] mt-[5px]">
              Therapist
            </label>
            <select
              className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
              value={form.therapist_id}
              onChange={(e) =>
                setForm({ ...form, therapist_id: e.target.value })
              }
              required
            >
              <option value="">Choose a therapist…</option>
              {therapists.map((t) => (
                <option key={t.therapist_id} value={t.therapist_id}>
                  {t.name}
                  {t.specialization ? ` · ${t.specialization}` : ""}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-[12px]">
              <div className="min-w-0">
                <label className="text-[11px] font-bold text-[#506158] mt-[5px]">
                  Requested date & time
                </label>
                <input
                  className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                  type="datetime-local"
                  value={form.appointment_start}
                  onChange={(e) =>
                    setForm({ ...form, appointment_start: e.target.value })
                  }
                  required
                />
              </div>
              <div className="min-w-0">
                <label className="text-[11px] font-bold text-[#506158] mt-[5px]">
                  Duration (minutes)
                </label>
                <input
                  className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                  type="number"
                  min="1"
                  step="5"
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm({ ...form, duration_minutes: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <label className="text-[11px] font-bold text-[#506158] mt-[5px]">
              Doctor priority (1–5)
            </label>
            <div className="flex items-center gap-[15px]">
              <input
                className="flex-1 accent-[#19563f]"
                type="range"
                min="1"
                max="5"
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: Number(e.target.value) })
                }
              />
              <b className="text-[13px] text-[#19563f]">
                {form.priority}{" "}
                <small className="text-[9px] text-[#8b968c]">/ 5</small>
              </b>
            </div>
            <div className="flex gap-[10px] p-[12px] bg-[#f5f8f2] rounded-[9px] my-[8px]">
              <Sparkles size={16} className="text-[#5c8a61] shrink-0 mt-[2px]" />
              <div>
                <b className="text-[11px]">Constraint scheduler</b>
                <p className="text-[10px] leading-[1.5] text-[#829085] m-[4px_0_0]">
                  Existing appointments for this therapist are considered.
                  OR-Tools minimizes weighted delay and prevents overlapping
                  sessions.
                </p>
              </div>
            </div>
            <button
              className="border border-transparent rounded-[9px] p-[10px_14px] text-[12px] font-bold inline-flex items-center justify-center gap-[9px] transition-[transform,background] duration-150 bg-[#19563f] text-white shadow-[0_4px_10px_#19563f16] hover:bg-[#124630] hover:-translate-y-px cursor-pointer w-full disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={busy || !treatments.length || !therapists.length}
            >
              {busy ? "Calculating schedule…" : (
                <>
                  Calculate & save schedule <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </section>
        <aside className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] min-w-0 p-[22px] max-[600px]:p-[15px] h-fit">
          <h2 className="font-['Manrope',sans-serif] tracking-[-0.035em] text-[17px] mt-0 mb-[20px]">
            Scheduling rules
          </h2>
          <div className="flex gap-[12px] py-[14px] border-t border-[#edf0ec]">
            <span className="text-[10px] font-extrabold text-[#5e9169]">
              01
            </span>
            <div>
              <b className="text-[11px]">No overlap</b>
              <p className="text-[10px] text-[#869288] leading-[1.5] m-[5px_0_0]">
                A therapist cannot be assigned to two sessions at the same time.
              </p>
            </div>
          </div>
          <div className="flex gap-[12px] py-[14px] border-t border-[#edf0ec]">
            <span className="text-[10px] font-extrabold text-[#5e9169]">
              02
            </span>
            <div>
              <b className="text-[11px]">Priority-aware</b>
              <p className="text-[10px] text-[#869288] leading-[1.5] m-[5px_0_0]">
                Higher priority has a larger penalty when the solver moves a
                requested time.
              </p>
            </div>
          </div>
          <div className="flex gap-[12px] py-[14px] border-t border-[#edf0ec]">
            <span className="text-[10px] font-extrabold text-[#5e9169]">
              03
            </span>
            <div>
              <b className="text-[11px]">Database transaction</b>
              <p className="text-[10px] text-[#869288] leading-[1.5] m-[5px_0_0]">
                Updated appointment times are written back to PostgreSQL.
              </p>
            </div>
          </div>
          <div className="bg-[#f3f5e8] rounded-[8px] p-[12px] text-[#7e845e] text-[10px] leading-[1.5] mt-[10px]">
            Tip: choose the original requested time. The solver will shift it
            when it conflicts with another appointment.
          </div>
        </aside>
      </div>
      <section className="bg-white border border-[#e7ece5] rounded-[13px] shadow-[0_3px_12px_#284c3008] min-w-0 p-[19px] max-[600px]:p-[15px]">
        <div className="flex items-center justify-between gap-[15px] pb-[17px] max-[600px]:items-start">
          <div>
            <h2 className="font-['Manrope',sans-serif] tracking-[-0.035em] text-[17px] mt-0 mb-[5px]">
              Current schedule
            </h2>
            <p className="text-[#77847c] text-[10px] m-0">
              Existing treatment appointment times
            </p>
          </div>
        </div>
        <div className="overflow-auto w-full">
          <table className="border-collapse w-full min-w-[700px] text-left">
            <thead>
              <tr>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Patient
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Treatment
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Therapist
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Date
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Time
                </th>
                <th className="bg-[#f8faf7] text-[9px] uppercase tracking-[0.07em] text-[#879389] font-extrabold p-[13px_17px] border-b border-[#e9eee7] whitespace-nowrap">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {treatments
                .filter((t) => t.appointment_start)
                .map((t) => (
                  <tr key={t.uuid} className="hover:bg-[#fbfcfa]">
                    <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                      {t.patient_name || "—"}
                    </td>
                    <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                      {t.p1 || "Treatment"}
                    </td>
                    <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                      {t.therapist_name || "—"}
                    </td>
                    <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                      {fmtDate(t.appointment_start)}
                    </td>
                    <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                      {fmtTime(t.appointment_start)}
                    </td>
                    <td className="text-[11px] text-[#536157] p-[13px_17px] border-b border-[#eef1ed] align-middle">
                      {t.duration_minutes || "—"} min
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
