import React from "react";
import { fmtDate, fmtTime, shortId } from "../utils";
import { PageHeading } from "./Pages";

export default function Scheduling({ treatments, therapists, selectedTreatment, setSelectedTreatment, form, setForm, onSubmit, busy }) {
  const selected = treatments.find(t => t.uuid === selectedTreatment);
  return <><PageHeading eyebrow="CONSTRAINT-BASED PLANNING" title="Scheduling" description="Match therapist expertise and find an available time without moving existing appointments." />
    <div className="schedule-layout"><section className="panel schedule-form-panel"><div className="panel-header"><div><h2>Schedule a treatment</h2><p>Existing appointments are preserved; the engine selects a feasible slot.</p></div><span className="solver-pill"><i /> Constraint engine</span></div>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>Treatment record</label><select value={selectedTreatment} onChange={e => {
          const val = e.target.value;
          setSelectedTreatment(val);
          const matched = treatments.find(t => t.uuid === val);
          if (matched) {
            setForm(prev => ({
              ...prev,
              therapist_id: matched.therapist_id || prev.therapist_id,
              duration_minutes: matched.duration_minutes || prev.duration_minutes || 60,
              priority: matched.priority || prev.priority || 3
            }));
          }
        }} required><option value="">Choose a treatment…</option>{treatments.map(t => <option key={t.uuid} value={t.uuid}>{t.patient_name || shortId(t.patient_id)} · {t.treatment_name || t.p1 || "Panchakarma"} {(!t.appointment_start || t.session_status === 'Awaiting Therapist Scheduling') ? "· [Awaiting Schedule]" : `· [${fmtDate(t.appointment_start)}]`}</option>)}</select>
        {selected && <div className="selected-record"><span>Selected patient: <b>{selected.patient_name || "Patient"}</b></span><span> · Procedure: <b>{selected.treatment_name || selected.p1 || "Panchakarma"}</b></span><span> · Priority: <b>{selected.priority || 3}/5</b></span><span> · Duration: <b>{selected.duration_minutes || 60} min</b></span><small style={{ display: "block", marginTop: "4px", color: "var(--muted)" }}>Status: {selected.session_status || "Awaiting Therapist Scheduling"} · Record: {shortId(selected.uuid)}</small></div>}
        <label>Preferred therapist (optional)</label><select value={form.therapist_id} onChange={e => setForm({ ...form, therapist_id: e.target.value })}><option value="">Auto-assign by expertise and availability…</option>{therapists.map(t => <option key={t.therapist_id} value={t.therapist_id}>{t.name}{t.specialization ? ` · ${t.specialization}` : ""}</option>)}</select>
        <div className="form-two"><div><label>Requested date & time</label><input type="datetime-local" value={form.appointment_start} onChange={e => setForm({ ...form, appointment_start: e.target.value })} required /></div><div><label>Duration (minutes)</label><input type="number" min="1" step="5" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: e.target.value })} required /></div></div>
        <label>Doctor priority (1–5)</label><div className="priority-row"><input type="range" min="1" max="5" value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) })} /><b>{form.priority} <small>/ 5</small></b></div>
        <div className="solver-info"><span>✦</span><div><b>Constraint scheduler</b><p>Therapist expertise, configured work days/hours, session duration and existing bookings are checked. High-priority requests are considered first when choosing among feasible options.</p></div></div>
        <button className="primary-btn wide" disabled={busy || !treatments.length || !therapists.length}>{busy ? "Calculating schedule…" : "Calculate & save schedule →"}</button>
      </form>
    </section>
      <aside className="panel schedule-aside"><h2>Scheduling rules</h2><div className="rule"><span>01</span><div><b>No overlap</b><p>A therapist cannot be assigned to two sessions at the same time.</p></div></div><div className="rule"><span>02</span><div><b>Priority-aware</b><p>High-priority requests prefer the earliest feasible slot; routine care is balanced across therapist workload.</p></div></div><div className="rule"><span>03</span><div><b>Database transaction</b><p>Updated appointment times are written back to PostgreSQL.</p></div></div><div className="aside-tip">Tip: choose the preferred time. The constraint engine will find the next feasible slot when needed.</div></aside></div>
    <section className="panel upcoming-panel"><div className="panel-header"><div><h2>Current schedule</h2><p>Existing treatment appointment times</p></div></div><div className="table-scroll"><table><thead><tr><th>Patient</th><th>Treatment</th><th>Therapist</th><th>Date</th><th>Time</th><th>Duration</th></tr></thead><tbody>{treatments.filter(t => t.appointment_start).map(t => <tr key={t.uuid}><td>{t.patient_name || "—"}</td><td>{t.p1 || "Treatment"}</td><td>{t.therapist_name || "—"}</td><td>{fmtDate(t.appointment_start)}</td><td>{fmtTime(t.appointment_start)}</td><td>{t.duration_minutes || "—"} min</td></tr>)}</tbody></table></div></section>
  </>;
}
