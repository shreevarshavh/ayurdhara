import React from "react";
import { fmtDate, fmtTime, shortId } from "../utils";
import { PageHeading } from "./Pages";

export default function Scheduling({treatments,therapists,selectedTreatment,setSelectedTreatment,form,setForm,onSubmit,busy}) {
  const selected=treatments.find(t=>t.uuid===selectedTreatment);
  return <><PageHeading eyebrow="CONSTRAINT-BASED PLANNING" title="Scheduling" description="Assign a therapist and use OR-Tools to find a non-overlapping appointment time."/>
    <div className="schedule-layout"><section className="panel schedule-form-panel"><div className="panel-header"><div><h2>Schedule a treatment</h2><p>Changes are saved to the existing treatment record.</p></div><span className="solver-pill"><i/> OR-Tools enabled</span></div>
      <form className="modal-form" onSubmit={onSubmit}>
        <label>Treatment record</label><select value={selectedTreatment} onChange={e=>setSelectedTreatment(e.target.value)} required><option value="">Choose a treatment…</option>{treatments.map(t=><option key={t.uuid} value={t.uuid}>{t.patient_name||shortId(t.patient_id)} · {t.p1||shortId(t.uuid)} · {shortId(t.uuid)}</option>)}</select>
        {selected&&<div className="selected-record"><span>Selected patient</span><b>{selected.patient_name||"Patient"}</b><small>Record: {selected.uuid}</small></div>}
        <label>Therapist</label><select value={form.therapist_id} onChange={e=>setForm({...form,therapist_id:e.target.value})} required><option value="">Choose a therapist…</option>{therapists.map(t=><option key={t.therapist_id} value={t.therapist_id}>{t.name}{t.specialization?` · ${t.specialization}`:""}</option>)}</select>
        <div className="form-two"><div><label>Requested date & time</label><input type="datetime-local" value={form.appointment_start} onChange={e=>setForm({...form,appointment_start:e.target.value})} required/></div><div><label>Duration (minutes)</label><input type="number" min="1" step="5" value={form.duration_minutes} onChange={e=>setForm({...form,duration_minutes:e.target.value})} required/></div></div>
        <label>Doctor priority (1–5)</label><div className="priority-row"><input type="range" min="1" max="5" value={form.priority} onChange={e=>setForm({...form,priority:Number(e.target.value)})}/><b>{form.priority} <small>/ 5</small></b></div>
        <div className="solver-info"><span>✦</span><div><b>Constraint scheduler</b><p>Existing appointments for this therapist are considered. OR-Tools minimizes weighted delay and prevents overlapping sessions.</p></div></div>
        <button className="primary-btn wide" disabled={busy||!treatments.length||!therapists.length}>{busy?"Calculating schedule…":"Calculate & save schedule →"}</button>
      </form>
    </section>
    <aside className="panel schedule-aside"><h2>Scheduling rules</h2><div className="rule"><span>01</span><div><b>No overlap</b><p>A therapist cannot be assigned to two sessions at the same time.</p></div></div><div className="rule"><span>02</span><div><b>Priority-aware</b><p>Higher priority has a larger penalty when the solver moves a requested time.</p></div></div><div className="rule"><span>03</span><div><b>Database transaction</b><p>Updated appointment times are written back to PostgreSQL.</p></div></div><div className="aside-tip">Tip: choose the original requested time. The solver will shift it when it conflicts with another appointment.</div></aside></div>
    <section className="panel upcoming-panel"><div className="panel-header"><div><h2>Current schedule</h2><p>Existing treatment appointment times</p></div></div><div className="table-scroll"><table><thead><tr><th>Patient</th><th>Treatment</th><th>Therapist</th><th>Date</th><th>Time</th><th>Duration</th></tr></thead><tbody>{treatments.filter(t=>t.appointment_start).map(t=><tr key={t.uuid}><td>{t.patient_name||"—"}</td><td>{t.p1||"Treatment"}</td><td>{t.therapist_name||"—"}</td><td>{fmtDate(t.appointment_start)}</td><td>{fmtTime(t.appointment_start)}</td><td>{t.duration_minutes||"—"} min</td></tr>)}</tbody></table></div></section>
  </>;
}
