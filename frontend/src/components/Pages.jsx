import React from "react";
import { fmtDate, fmtTime, shortId } from "../utils";

export function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

// Shared patient-page visual language: botanical hero + pastel summary cards.
export function PatientPageHero({ eyebrow, title, description, action }) {
  return <section className="patient-page-hero">
    <div className="patient-page-hero-copy">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    {action ? <div className="patient-page-hero-action">{action}</div> : null}
  </section>;
}

export function PatientPageStats({ items = [] }) {
  return <section className="patient-page-stats">{items.map((item, index) =>
    <article className={`patient-page-stat ${item.tone || ['green', 'blue', 'gold', 'purple', 'sky'][index % 5]}`} key={item.label}>
      <span className="patient-page-stat-icon" aria-hidden="true">{item.icon || '✦'}</span>
      <span className="patient-page-stat-copy"><b>{item.value}</b><strong>{item.label}</strong>{item.detail ? <small>{item.detail}</small> : null}</span>
    </article>
  )}</section>;
}
export function Dashboard({ user, patients, treatments, scheduled, completed, alerts, onNavigate }) {
  const pending = treatments.filter(t => !["Completed", "Missed"].includes(t.session_status || "Scheduled"));
  const today = new Date().toDateString();
  const todays = scheduled.filter(t => new Date(t.appointment_start).toDateString() === today);
  const metrics = [
    { label: "Total patients", value: patients.length, detail: "Registered in the system", icon: "♧", tone: "mint" },
    { label: "Scheduled sessions", value: scheduled.length, detail: "Appointments with a time", icon: "◷", tone: "blue" },
    { label: "Completed sessions", value: completed.length, detail: "Recorded as complete", icon: "✓", tone: "gold" },
    { label: "Open alerts", value: alerts.length, detail: "Require team review", icon: "⚑", tone: "rose" }
  ];
  return <>
    <div className="welcome-banner"><div><span className="banner-kicker">YOUR CARE WORKSPACE</span><h1>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user.name?.split(" ")[0] || "there"} <span>✦</span></h1><p>Here’s an overview of your Panchakarma care activities.</p></div><div className="banner-art">❧</div></div>
    <div className="metrics-grid">{metrics.map(m => <div className="metric-card" key={m.label}><div className={`metric-icon ${m.tone}`}>{m.icon}</div><div className="metric-label">{m.label}</div><div className="metric-value">{m.value}</div><div className="metric-detail">{m.detail}</div></div>)}</div>
    <div className="dashboard-grid">
      <section className="panel schedule-panel"><div className="panel-header"><div><h2>Upcoming care schedule</h2><p>Appointments from your treatment records</p></div><button className="link-button" onClick={() => onNavigate("schedule")}>Manage schedule →</button></div>
        {scheduled.length === 0 ? <Empty icon="◷" title="No scheduled treatments yet" text="When treatments have appointment times, they will appear here." /> :
          <div className="schedule-list">{scheduled.slice(0, 6).map(t => <div className="schedule-row" key={t.uuid}><div className="time-block"><b>{fmtTime(t.appointment_start)}</b><span>{fmtDate(t.appointment_start)}</span></div><div className="schedule-avatar">{(t.patient_name || "P").slice(0, 1)}</div><div className="schedule-info"><b>{t.p1 || "Panchakarma session"}</b><span>{t.patient_name || "Patient"} · {t.therapist_name || "Therapist not assigned"}</span></div><Status value={t.session_status || "Scheduled"} /></div>)}</div>}
      </section>
      <section className="panel progress-panel"><div className="panel-header"><div><h2>Care progress</h2><p>Recorded session outcomes</p></div><button className="link-button" onClick={() => onNavigate("progress")}>View progress →</button></div>
        <div className="progress-circle-wrap"><div className="progress-circle" style={{ "--progress": `${treatments.length ? Math.round(completed.length / treatments.length * 100) : 0}%` }}><div><strong>{treatments.length ? Math.round(completed.length / treatments.length * 100) : 0}%</strong><span>Completed</span></div></div><div className="progress-legend"><span><i className="dot green" /> Completed <b>{completed.length}</b></span><span><i className="dot blue" /> Scheduled / ongoing <b>{pending.length}</b></span><span><i className="dot rose" /> Alerts <b>{alerts.length}</b></span></div></div>
        <div className="soft-note"><span>✦</span><p>Progress reflects the session status recorded by your care team.</p></div>
      </section>
    </div>
    <div className="quick-actions"><div><div className="eyebrow">QUICK ACTIONS</div><h2>What would you like to do?</h2></div><div className="quick-action-list"><button onClick={() => onNavigate("patients")}><span>♧</span><b>View patients</b><small>Patient records</small></button><button onClick={() => onNavigate("schedule")}><span>▦</span><b>Schedule care</b><small>Resolve time conflicts</small></button><button onClick={() => onNavigate("alerts")}><span>⚑</span><b>Emergency alerts</b><small>Review incidents</small></button></div></div>
  </>;
}
export function Status({ value }) {
  const status = (value || "Scheduled").toLowerCase();
  const cls = status === "completed" ? "success" : status === "ongoing" ? "info" : status === "missed" || status === "interrupted" ? "danger" : status === "open" || status === "critical" ? "danger" : "warning";
  return <span className={`status ${cls}`}>{value || "Scheduled"}</span>;
}
export function Empty({ icon = "✦", title, text }) { return <div className="empty-state"><div>{icon}</div><b>{title}</b><p>{text}</p></div>; }
export function SearchBox({ value, onChange, placeholder = "Search records…" }) { return <div className="search-box"><span>⌕</span><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />{value && <button onClick={() => onChange("")}>×</button>}</div> }
export function Patients({ patients, search, setSearch, onAdd }) {
  return <><PageHeading eyebrow="CARE DIRECTORY" title="Patients" description="View and manage registered patient accounts." action={<button className="primary-btn" onClick={onAdd}>＋ Add patient</button>} />
    <div className="toolbar"><SearchBox value={search} onChange={setSearch} placeholder="Search by patient name, email or ID…" /><span className="results-count">{patients.length} patient{patients.length === 1 ? "" : "s"}</span></div>
    <div className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Patient</th><th>Patient ID</th><th>Email</th><th>Record status</th></tr></thead><tbody>{patients.map(p => <tr key={p.patient_id}><td><div className="person-cell"><div className="table-avatar">{(p.name || "P").slice(0, 1)}</div><b>{p.name}</b></div></td><td><span className="id-text">{shortId(p.patient_id)}</span></td><td>{p.email || "—"}</td><td><Status value="Active" /></td></tr>)}</tbody></table></div>{patients.length === 0 && <Empty icon="♧" title="No patients found" text="Try a different search or add a patient account." />}</div>
  </>;
}
export function Treatments({ treatments, search, setSearch, onSchedule, readOnly = false }) {
  return <div className="patient-subpage">
    <PatientPageHero eyebrow="CARE PLANNING" title="Treatment Plans" description="Review treatment records and schedule or reschedule your sessions." action={<button className="patient-print-button" onClick={() => window.print()}>↓ Print list</button>} />
    <PatientPageStats items={[
      { label: "Total Plans", value: treatments.length, detail: "Prescribed care plans", icon: "▤", tone: "green" },
      { label: "In Progress", value: treatments.filter(t => (t.session_status || "Scheduled").toLowerCase() === "ongoing").length, detail: "Currently underway", icon: "◷", tone: "blue" },
      { label: "Scheduled", value: treatments.filter(t => (t.session_status || "Scheduled").toLowerCase() === "scheduled").length, detail: "Appointments arranged", icon: "✓", tone: "gold" },
      { label: "Upcoming", value: treatments.filter(t => t.appointment_start && new Date(t.appointment_start) > new Date()).length, detail: "Future appointments", icon: "▥", tone: "purple" },
      { label: "Completed", value: treatments.filter(t => (t.session_status || "").toLowerCase() === "completed").length, detail: "Recorded as complete", icon: "◎", tone: "sky" }
    ]} />
    <div className="patient-page-toolbar">
      <SearchBox value={search} onChange={setSearch} placeholder="Search treatment or therapist…" />
      <span>{treatments.length} {treatments.length === 1 ? "treatment record" : "treatment records"}</span>
    </div>
    {treatments.length ? <div className="patient-treatment-grid">
      {treatments.map(t => {
        const procedures = [t.p1, t.p2, t.p3, t.p4, t.p5].filter(Boolean);
        return <article className="patient-card patient-treatment-card" key={t.uuid}>
          <div className="patient-treatment-top"><div className="patient-card-icon"><span>✳</span></div><Status value={t.session_status || "Scheduled"} /></div>
          <div className="patient-treatment-title"><h2>{t.p1 || "Panchakarma treatment"}</h2><p>{t.patient_name || "Your treatment plan"}</p></div>
          <div className="patient-treatment-details">
            <div><small>Duration</small><b>{t.duration_minutes ? `${t.duration_minutes} minutes` : "Not specified"}</b></div>
            <div><small>Appointment</small><b>{fmtDate(t.appointment_start)}</b></div>
            <div><small>Therapist</small><b>{t.therapist_name || "To be assigned"}</b></div>
            <div><small>Priority</small><b>{t.priority ? `${t.priority} / 5` : "Not specified"}</b></div>
          </div>
          {procedures.length > 1 && <div className="patient-procedure-list"><small>Prescribed procedures</small><div>{procedures.map((procedure, i) => <span key={`${t.uuid}-${i}`}>{procedure}</span>)}</div></div>}
          {!readOnly && <button className="patient-outline-action" onClick={() => onSchedule?.(t)}>Schedule / reschedule <span>→</span></button>}
        </article>;
      })}
    </div> : <section className="patient-card patient-page-empty"><div className="patient-empty-icon"><span>✳</span></div><h2>{search ? "No matching treatment plans" : "No treatment records yet"}</h2><p>{search ? "Try a different treatment or therapist keyword." : "Your practitioner-prescribed treatment records will appear here when they are available."}</p></section>}
  </div>;
}

export function Sessions({ treatments, notes = {}, setNotes, onUpdate, readOnly = false }) {
  const [draftStatuses, setDraftStatuses] = React.useState({});
  const rows = treatments || [];
  return <div className="patient-subpage">
    <PatientPageHero eyebrow="SESSION DELIVERY" title="Sessions" description="Review your scheduled Panchakarma therapies, appointment details and recorded outcomes." action={<button className="patient-print-button" onClick={() => window.print()}>↓ Print sessions</button>} />
    <PatientPageStats items={[
      { label: "Total Sessions", value: rows.length, detail: "Sessions in your record", icon: "▤", tone: "green" },
      { label: "Scheduled", value: rows.filter(t => (t.session_status || "Scheduled").toLowerCase() === "scheduled").length, detail: "Awaiting appointment", icon: "▦", tone: "blue" },
      { label: "Ongoing", value: rows.filter(t => (t.session_status || "").toLowerCase() === "ongoing").length, detail: "Currently underway", icon: "◷", tone: "gold" },
      { label: "Completed", value: rows.filter(t => (t.session_status || "").toLowerCase() === "completed").length, detail: "Recorded as complete", icon: "✓", tone: "purple" },
      { label: "Other Status", value: rows.filter(t => ["missed", "interrupted"].includes((t.session_status || "").toLowerCase())).length, detail: "Missed or interrupted", icon: "!", tone: "sky" }
    ]} />
    {rows.length ? <div className="patient-card patient-session-table-card"><div className="patient-table-scroll"><table className="patient-data-table"><thead><tr><th>Session / procedure</th><th>When</th><th>Therapist</th><th>Status</th><th>Observation notes</th>{!readOnly && <th>Update</th>}</tr></thead><tbody>
      {rows.map(t => <tr key={t.uuid}>
        <td><div className="patient-table-primary">{t.p1 || "Panchakarma session"}</div><small>{shortId(t.uuid)}</small></td>
        <td><div className="patient-table-primary">{fmtDate(t.appointment_start)}</div><small>{fmtTime(t.appointment_start)}</small></td>
        <td>{t.therapist_name || "Not assigned"}</td>
        <td>{readOnly ? <Status value={t.session_status || "Scheduled"} /> : <select className="patient-table-select" value={draftStatuses[t.uuid] ?? t.session_status ?? "Scheduled"} onChange={e => setDraftStatuses(v => ({ ...v, [t.uuid]: e.target.value }))}><option>Scheduled</option><option>Ongoing</option><option>Completed</option><option>Missed</option><option>Interrupted</option></select>}</td>
        <td>{readOnly ? (t.session_notes || "No observations recorded") : <input className="patient-table-input" value={notes[t.uuid] ?? t.session_notes ?? ""} onChange={e => setNotes?.({ ...notes, [t.uuid]: e.target.value })} placeholder="Add observation…" />}</td>
        {!readOnly && <td><button className="patient-save-button" onClick={() => onUpdate?.(t, draftStatuses[t.uuid] ?? t.session_status ?? "Scheduled")}>Save</button></td>}
      </tr>)}
    </tbody></table></div></div> : <section className="patient-card patient-page-empty"><div className="patient-empty-icon"><span>◷</span></div><h2>No sessions scheduled</h2><p>Your approved therapy appointments and session updates will appear here.</p></section>}
  </div>;
}

export function Progress({ patients, treatments, completed }) {
  const pct = treatments.length ? Math.round(completed.length / treatments.length * 100) : 0;
  const statusNames = ["Scheduled", "Ongoing", "Completed", "Missed", "Interrupted"];
  const statusCounts = statusNames.map(status => ({ status, count: treatments.filter(t => (t.session_status || "Scheduled").toLowerCase() === status.toLowerCase()).length }));
  const patientRows = patients.length ? patients : [];
  return <div className="patient-subpage">
    <PatientPageHero eyebrow="OUTCOME MONITORING" title="Progress Tracking" description="Follow your Panchakarma treatment progress and review completed care activities." action={<button className="patient-print-button" onClick={() => window.print()}>↓ Print summary</button>} />
    <PatientPageStats items={[
      { label: "Treatment Records", value: treatments.length, detail: "Plans in your care record", icon: "▤", tone: "green" },
      { label: "Completed", value: completed.length, detail: "Recorded as complete", icon: "✓", tone: "blue" },
      { label: "In Progress", value: statusCounts.find(x => x.status === "Ongoing")?.count || 0, detail: "Currently underway", icon: "◷", tone: "gold" },
      { label: "Scheduled", value: statusCounts.find(x => x.status === "Scheduled")?.count || 0, detail: "Awaiting session", icon: "▦", tone: "purple" },
      { label: "Overall Progress", value: `${pct}%`, detail: "Based on available records", icon: "↗", tone: "sky" }
    ]} />
    <div className="patient-progress-summary-grid">
      <section className="patient-card patient-progress-overview"><div className="patient-section-kicker">SESSION COMPLETION</div><div className="patient-progress-overview-body"><div className="patient-donut patient-progress-donut" style={{ "--progress": `${pct}%` }}><div><b>{pct}%</b><span>Completed</span></div></div><div className="patient-progress-stats"><div><span>Treatment records</span><b>{treatments.length}</b></div><div><span>Completed sessions</span><b>{completed.length}</b></div><div><span>Remaining records</span><b>{Math.max(0, treatments.length - completed.length)}</b></div></div></div></section>
      <section className="patient-card patient-session-status-card"><h2>Session status</h2><p>Current status of your treatment records</p>{statusCounts.map(item => <div className="patient-status-bar-row" key={item.status}><div><span>{item.status}</span><b>{item.count}</b></div><div><i style={{ width: `${treatments.length ? item.count / treatments.length * 100 : 0}%` }} /></div></div>)}</section>
    </div>
    <section className="patient-card patient-progress-table-card"><div className="patient-card-heading"><div className="patient-card-title"><div className="patient-card-icon"><span>↗</span></div><div><h2>My treatment progress</h2><p>Summary calculated from session statuses recorded by your care team.</p></div></div></div>
      {patientRows.length ? <div className="patient-table-scroll"><table className="patient-data-table"><thead><tr><th>Patient</th><th>Treatment records</th><th>Completed</th><th>Scheduled / ongoing</th><th>Progress</th></tr></thead><tbody>{patientRows.map(p => { const own = treatments.filter(t => String(t.patient_id) === String(p.patient_id)); const done = own.filter(t => (t.session_status || "").toLowerCase() === "completed").length; const value = own.length ? Math.round(done / own.length * 100) : 0; return <tr key={p.patient_id}><td><div className="patient-progress-person"><span>{(p.name || "P").slice(0, 1).toUpperCase()}</span><b>{p.name || "Patient"}</b></div></td><td>{own.length}</td><td>{done}</td><td>{own.filter(t => !["completed", "missed", "interrupted"].includes((t.session_status || "scheduled").toLowerCase())).length}</td><td><div className="patient-mini-progress"><i style={{ width: `${value}%` }} /></div><b className="patient-progress-percent">{value}%</b></td></tr>; })}</tbody></table></div> : <div className="patient-inline-empty">Your progress summary will appear when your care records are available.</div>}
    </section>
    <p className="patient-data-note">Progress is based only on treatment and session status records currently available in your account.</p>
  </div>;
}

export function Alerts({ alerts, patients, treatments, onCreate, onUpdate }) {
  return <><PageHeading eyebrow="PATIENT SAFETY" title="Emergency alerts" description="Record incidents and follow their status through resolution." action={<button className="danger-btn" onClick={onCreate}>＋ Record alert</button>} />
    <div className="alert-summary"><div className="panel alert-summary-card"><span className="alert-icon">⚑</span><div><small>Open / acknowledged</small><b>{alerts.filter(a => a.status !== "Resolved").length}</b></div></div><div className="panel alert-summary-card"><span className="alert-icon amber">◷</span><div><small>Critical / high severity</small><b>{alerts.filter(a => ["High", "Critical"].includes(a.severity) && a.status !== "Resolved").length}</b></div></div><div className="panel alert-summary-card"><span className="alert-icon green">✓</span><div><small>Resolved incidents</small><b>{alerts.filter(a => a.status === "Resolved").length}</b></div></div></div>
    <div className="alerts-list">{alerts.map(a => <div className="panel alert-card" key={a.id}><div className="alert-card-mark">⚑</div><div className="alert-card-content"><div className="alert-card-title"><div><span className={`severity ${String(a.severity).toLowerCase()}`}>{a.severity} priority</span><h3>{a.patient_name || "Unlinked patient alert"}</h3></div><Status value={a.status} /></div><p>{a.symptoms}</p><div className="alert-meta"><span>Reported {fmtDate(a.created_at)} · {fmtTime(a.created_at)}</span><span>By {a.reporter_name || "Care team"}</span></div></div><div className="alert-actions">{a.status === "Open" && <button className="outline-btn" onClick={() => onUpdate(a, "Acknowledged")}>Acknowledge</button>}{a.status !== "Resolved" && <button className="primary-btn" onClick={() => onUpdate(a, "Resolved")}>Resolve</button>}</div></div>)}</div>
    {alerts.length === 0 && <div className="panel"><Empty icon="✓" title="No emergency alerts" text="New incidents recorded by the care team will appear here." /></div>}
  </>;
}
export function Reports({ patients, treatments, alerts }) {
  const exportCsv = () => { const rows = [["Patient", "Treatment", "Therapist", "Appointment", "Duration minutes", "Priority", "Status"], ...treatments.map(t => [t.patient_name || "", t.p1 || "", t.therapist_name || "", t.appointment_start || "", t.duration_minutes || "", t.priority || "", t.session_status || "Scheduled"])]; const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\r\n"); const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" })); a.download = "ayurdhara-treatment-report.csv"; a.click(); URL.revokeObjectURL(a.href); };
  return <><PageHeading eyebrow="CARE INSIGHTS" title="Reports" description="Export the current treatment schedule and review summary indicators." action={<button className="primary-btn" onClick={exportCsv}>↓ Export CSV</button>} /><div className="metrics-grid report-metrics"><div className="metric-card"><div className="metric-icon mint">♧</div><div className="metric-label">Patients</div><div className="metric-value">{patients.length}</div></div><div className="metric-card"><div className="metric-icon blue">▦</div><div className="metric-label">Treatment records</div><div className="metric-value">{treatments.length}</div></div><div className="metric-card"><div className="metric-icon gold">✓</div><div className="metric-label">Completed sessions</div><div className="metric-value">{treatments.filter(t => t.session_status === "Completed").length}</div></div><div className="metric-card"><div className="metric-icon rose">⚑</div><div className="metric-label">Emergency alerts</div><div className="metric-value">{alerts.length}</div></div></div><div className="panel table-panel"><div className="panel-header"><div><h2>Treatment report preview</h2><p>Export includes only records currently returned by the backend.</p></div><button className="link-button" onClick={exportCsv}>Download CSV →</button></div><div className="table-scroll"><table><thead><tr><th>Patient</th><th>Treatment</th><th>Therapist</th><th>Appointment</th><th>Status</th></tr></thead><tbody>{treatments.map(t => <tr key={t.uuid}><td>{t.patient_name || "—"}</td><td>{t.p1 || "Treatment"}</td><td>{t.therapist_name || "—"}</td><td>{fmtDate(t.appointment_start)} {fmtTime(t.appointment_start)}</td><td><Status value={t.session_status || "Scheduled"} /></td></tr>)}</tbody></table></div></div></>;
}
export function Notifications({ treatments, alerts, onNavigate }) {
  const alertItems = alerts.map(a => ({ id: `a${a.id}`, kind: "Emergency alert", title: `${a.severity || "Priority"} alert`, detail: a.symptoms || "An emergency alert was recorded for your care record.", date: a.created_at, action: "notifications" }));
  const treatmentItems = treatments.filter(t => t.appointment_start).map(t => ({ id: `t${t.uuid}`, kind: "Scheduled session", title: t.p1 || "Panchakarma session", detail: `${fmtDate(t.appointment_start)} at ${fmtTime(t.appointment_start)} · ${t.therapist_name || "Therapist not assigned"}`, date: t.appointment_start, action: "sessions" }));
  const items = [...alertItems, ...treatmentItems].sort((a, b) => new Date(b.date) - new Date(a.date));
  return <div className="patient-subpage">
    <PatientPageHero eyebrow="CARE TEAM UPDATES" title="Notifications" description="Stay updated with appointment reminders and care-team notifications related to your records." />
    <PatientPageStats items={[
      { label: "Total Updates", value: items.length, detail: "Available notifications", icon: "♧", tone: "green" },
      { label: "Appointments", value: treatmentItems.length, detail: "Scheduled care updates", icon: "▦", tone: "blue" },
      { label: "Care Alerts", value: alertItems.length, detail: "Alerts in your record", icon: "!", tone: "gold" },
      { label: "Latest Update", value: items.length ? fmtDate(items[0].date) : "—", detail: "Most recent activity", icon: "◷", tone: "purple" }
    ]} />
    <section className="patient-card patient-notifications-card">
      {items.length ? items.map(item => <button className="patient-notification-row" key={item.id} onClick={() => onNavigate(item.action)}>
        <span className={`patient-notification-icon ${item.kind === "Emergency alert" ? "alert" : "session"}`}>{item.kind === "Emergency alert" ? "!" : "◷"}</span>
        <span className="patient-notification-copy"><b>{item.title}</b><span>{item.detail}</span><small>{fmtDate(item.date)} · {fmtTime(item.date)}</small></span>
        <span className="patient-notification-kind">{item.kind}</span><span className="patient-notification-arrow">→</span>
      </button>) : <div className="patient-page-empty"><div className="patient-empty-icon"><span>♧</span></div><h2>You're all caught up</h2><p>Appointment and care updates will appear here when available.</p></div>}
    </section>
  </div>;
}


export function VitalsSymptoms({ vitals = [], symptoms = [] }) {
  const hasRecords = (vitals?.length || 0) > 0 || (symptoms?.length || 0) > 0;

  return (
    <div className="patient-subpage">
      <PatientPageHero eyebrow="WELLNESS MONITORING" title="Vitals & Symptoms" description="Review health observations and wellness measurements recorded by your Ayurvedic care team." />
      <PatientPageStats items={[
        { label: "Vital Records", value: vitals.length, detail: "Measurements recorded", icon: "♥", tone: "green" },
        { label: "Symptom Entries", value: symptoms.length, detail: "Observations recorded", icon: "✚", tone: "blue" },
        { label: "Total Observations", value: vitals.length + symptoms.length, detail: "Available in your record", icon: "▤", tone: "gold" },
        { label: "Record Status", value: hasRecords ? "Available" : "No records", detail: "Based on linked entries", icon: "◎", tone: "purple" }
      ]} />

      <div className="patient-vitals-intro-grid">
        <article className="patient-card patient-vitals-intro-card">
          <div className="patient-vitals-symbol">♥</div>
          <div>
            <span className="patient-section-kicker">YOUR WELLNESS RECORD</span>
            <h2>Vitals and symptoms</h2>
            <p>Measurements and observations recorded during your Panchakarma care can be reviewed here.</p>
          </div>
        </article>
        <article className="patient-card patient-vitals-note-card">
          <span className="patient-section-kicker">CARE REMINDER</span>
          <h2>Keep your care team informed</h2>
          <p>Share any new or worsening symptoms directly with your practitioner. This page displays recorded observations; it does not provide a diagnosis.</p>
        </article>
      </div>

      {hasRecords ? (
        <div className="patient-card patient-vitals-record-card">
          <div className="patient-card-heading">
            <div className="patient-card-title"><div className="patient-card-icon"><span>♥</span></div><div><h2>Recorded observations</h2><p>Entries available in your care record.</p></div></div>
          </div>
          <div className="patient-inline-empty">Vitals and symptom records are available, but the current application does not yet provide a display format for these entries.</div>
        </div>
      ) : (
        <section className="patient-card patient-page-empty patient-vitals-empty">
          <div className="patient-empty-icon"><span>♥</span></div>
          <h2>No vitals or symptoms recorded yet</h2>
          <p>When your practitioner or therapist records observations, they will appear here. No health measurements are currently available in your account.</p>
        </section>
      )}
    </div>
  );
}

export function HelpFAQs() {
  const faqs = [
    { q: "Where can I view my prescribed treatment plan?", a: "Open Treatment Plans from the My Care section. Your prescribed procedures, appointment details, duration and assigned therapist appear when those records are available." },
    { q: "Where can I check my upcoming therapy sessions?", a: "Open Sessions to review scheduled appointments, their timing, therapist details and any observations recorded by the care team." },
    { q: "How is my treatment progress calculated?", a: "Progress is calculated from treatment and session status records available in your account. It reflects the records entered by your care team." },
    { q: "Where can I see my vitals and symptoms?", a: "Open Vitals & Symptoms. This page will show observations when they have been recorded and made available in your patient record." },
    { q: "What should I do if I experience a concerning reaction?", a: "Contact your practitioner or the clinic staff immediately. Do not rely on this portal for emergency assistance." },
    { q: "Why is my page showing no records?", a: "Some sections remain empty until the clinic records and links the relevant treatment, appointment or observation details to your patient account. Contact your care team if you think information is missing." }
  ];

  return (
    <div className="patient-subpage">
      <PatientPageHero eyebrow="PATIENT SUPPORT" title="Help & FAQs" description="Find answers and helpful guidance for using your AyurDhara patient workspace." />
      <PatientPageStats items={[
        { label: "Common Questions", value: faqs.length, detail: "Answers in this section", icon: "?", tone: "green" },
        { label: "Treatment Plans", value: "Guide", detail: "Understand prescribed care", icon: "▤", tone: "blue" },
        { label: "Sessions", value: "Guide", detail: "Appointments and updates", icon: "▦", tone: "gold" },
        { label: "Patient Support", value: "Care team", detail: "Clinic assistance", icon: "♡", tone: "purple" }
      ]} />
      <section className="patient-card patient-help-welcome">
        <div className="patient-help-mark">?</div>
        <div><span className="patient-section-kicker">HERE TO HELP</span><h2>How can we help you?</h2><p>Browse answers to common questions about your treatment plans, sessions and care records.</p></div>
      </section>
      <section className="patient-help-faq-section">
        <div className="patient-help-section-heading"><span className="patient-section-kicker">COMMON QUESTIONS</span><h2>Frequently asked questions</h2></div>
        <div className="patient-help-faq-list">
          {faqs.map((item, index) => (
            <details className="patient-card patient-help-faq" key={item.q} open={index === 0}>
              <summary><span>{item.q}</span><b aria-hidden="true">＋</b></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="patient-card patient-help-contact">
        <div><span className="patient-section-kicker">NEED MORE HELP?</span><h2>Contact your care team</h2><p>For appointment changes, missing records or questions about your treatment, please contact your Ayurvedic practitioner or clinic staff.</p></div>
      </section>
    </div>
  );
}

export function Users({ users, onAdd, onDelete }) {
  return <><PageHeading eyebrow="ADMINISTRATION" title="User management" description="View user accounts and manage access to the care workspace." action={<button className="primary-btn" onClick={onAdd}>＋ Add user</button>} /><div className="toolbar"><span className="results-count">{users.length} user accounts</span><span className="muted">Account deletion may be blocked by linked clinical records.</span></div><div className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th>Created</th><th>Actions</th></tr></thead><tbody>{users.map(u => <tr key={u.user_id}><td><div className="person-cell"><div className="table-avatar">{(u.name || "U").slice(0, 1)}</div><b>{u.name}</b></div></td><td><span className="role-chip">{u.role}</span></td><td>{u.email}</td><td>{u.phone_number || "—"}</td><td>{fmtDate(u.created_at)}</td><td><button className="danger-link" onClick={() => onDelete(u.user_id)}>Delete</button></td></tr>)}</tbody></table></div></div></>;
}
