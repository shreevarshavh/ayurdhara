import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "./services/api";
import { NAV, fmtDate, fmtTime, shortId } from "./utils";
import Login from "./components/Login";
import Scheduling from "./components/Scheduling";
import PatientDashboard from "./components/PatientDashboard";

import Modal from "./components/Modal";
import {
  Dashboard, Patients, Treatments, Sessions, Progress, Alerts,
  Reports, Notifications, Users
} from "./components/Pages";

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ayurdhara_user") || "null"); } catch { return null; }
  });
  const [page, setPage] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [users, setUsers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState("");
  const [selectedTreatment, setSelectedTreatment] = useState("");
  const [scheduleForm, setScheduleForm] = useState({ therapist_id: "", appointment_start: "", duration_minutes: 60, priority: 2 });
  const [patientForm, setPatientForm] = useState({ name: "", email: "", phone_number: "", password: "" });
  const [userForm, setUserForm] = useState({ name: "", email: "", phone_number: "", password: "", role: "therapist" });
  const [alertForm, setAlertForm] = useState({ patient_id: "", treatment_uuid: "", severity: "High", symptoms: "" });
  const [sessionNotes, setSessionNotes] = useState({});
  const [sessionStatuses, setSessionStatuses] = useState({});
  const [busy, setBusy] = useState(false);

  const flash = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 4500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      api("/api/treatment/patients"),
      api("/api/treatment"),
      api("/api/users"),
      api("/api/treatment/therapists"),
      api("/api/treatment/alerts")
    ]);
    const [p, t, u, th, a] = results;
    if (p.status === "fulfilled") setPatients(Array.isArray(p.value) ? p.value : []);
    if (t.status === "fulfilled") setTreatments(Array.isArray(t.value) ? t.value : []);
    if (u.status === "fulfilled") setUsers(u.value.data || []);
    if (th.status === "fulfilled") setTherapists(Array.isArray(th.value) ? th.value : []);
    if (a.status === "fulfilled") setAlerts(Array.isArray(a.value) ? a.value : []);
    const failures = results.filter(r => r.status === "rejected");
    if (failures.length) console.warn("Some AyurDhara data endpoints failed:", failures.map(f => f.reason?.message));
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  const visibleNav = NAV.filter(n => !n.roles || n.roles.includes(user?.role));
  const scheduled = useMemo(() => treatments.filter(t => t.appointment_start), [treatments]);
  const completed = useMemo(() => treatments.filter(t => (t.session_status || "Scheduled") === "Completed"), [treatments]);
  const openAlerts = alerts.filter(a => a.status !== "Resolved");
  const activeNav = visibleNav.some(n => n.id === page) ? page : "dashboard";
  const isPatient = String(user?.role || "").toLowerCase() === "patient";

  function logout() {
    localStorage.removeItem("ayurdhara_token");
    localStorage.removeItem("ayurdhara_user");
    setUser(null);
    setPage("dashboard");
  }

  async function createPatient(e) {
    e.preventDefault(); setBusy(true);
    try {
      await api("/api/users", { method: "POST", body: JSON.stringify({ ...patientForm, role: "patient" }) });
      setModal(""); setPatientForm({ name: "", email: "", phone_number: "", password: "" });
      flash("success", "Patient account created."); await loadData();
    } catch (err) { flash("error", err.message); }
    finally { setBusy(false); }
  }

  async function createUser(e) {
    e.preventDefault(); setBusy(true);
    try {
      await api("/api/users", { method: "POST", body: JSON.stringify(userForm) });
      setModal(""); setUserForm({ name: "", email: "", phone_number: "", password: "", role: "therapist" });
      flash("success", "User created successfully."); await loadData();
    } catch (err) { flash("error", err.message); }
    finally { setBusy(false); }
  }

  async function scheduleTreatment(e) {
    e.preventDefault();
    if (!selectedTreatment) return flash("error", "Select a treatment first.");
    const treatment = treatments.find(t => t.uuid === selectedTreatment);
    if (!treatment) return flash("error", "Treatment record not found.");
    setBusy(true);
    try {
      const result = await api("/api/treatment/schedule", {
        method: "POST",
        body: JSON.stringify({
          uuid: treatment.uuid,
          therapist_id: scheduleForm.therapist_id || treatment.therapist_id,
          appointment_start: new Date(scheduleForm.appointment_start).toISOString(),
          duration_minutes: Number(scheduleForm.duration_minutes),
          priority: Number(scheduleForm.priority)
        })
      });
      flash("success", result.message || "Schedule updated.");
      await loadData();
    } catch (err) { flash("error", err.message); }
    finally { setBusy(false); }
  }

  async function updateSession(treatment, status) {
    try {
      const result = await api(`/api/treatment/${treatment.uuid}/session`, {
        method: "PATCH",
        body: JSON.stringify({ session_status: status, session_notes: sessionNotes[treatment.uuid] ?? treatment.session_notes ?? "" })
      });
      flash("success", result.message || "Session updated.");
      await loadData();
    } catch (err) { flash("error", err.message); }
  }

  async function createAlert(e) {
    e.preventDefault(); setBusy(true);
    try {
      await api("/api/treatment/alerts", {
        method: "POST",
        body: JSON.stringify({ ...alertForm, reported_by: user.user_id, patient_id: alertForm.patient_id || null, treatment_uuid: alertForm.treatment_uuid || null })
      });
      setModal(""); setAlertForm({ patient_id: "", treatment_uuid: "", severity: "High", symptoms: "" });
      flash("success", "Emergency alert recorded. The care team can now review it."); await loadData();
    } catch (err) { flash("error", err.message); }
    finally { setBusy(false); }
  }

  async function updateAlert(alert, status) {
    try {
      await api(`/api/treatment/alerts/${alert.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      flash("success", `Alert marked ${status.toLowerCase()}.`); await loadData();
    } catch (err) { flash("error", err.message); }
  }

  async function deleteUser(id) {
    if (!window.confirm("Delete this user? This may be blocked if the user has linked clinical records.")) return;
    try { await api(`/api/users/${id}`, { method: "DELETE" }); flash("success", "User deleted."); await loadData(); }
    catch (err) { flash("error", err.message); }
  }

  if (!user) return <Login onLogin={setUser} />;

  const patientRecord = isPatient
    ? (patients.find(p => String(p.email || "").toLowerCase() === String(user.email || "").toLowerCase()) || null)
    : null;
  const patientTreatments = isPatient
    ? (patientRecord ? treatments.filter(t => String(t.patient_id) === String(patientRecord.patient_id)) : [])
    : treatments;
  const patientScheduled = patientTreatments.filter(t => t.appointment_start);
  const patientCompleted = patientTreatments.filter(t => (t.session_status || "Scheduled").toLowerCase() === "completed");
  const patientAlerts = isPatient && patientRecord
    ? alerts.filter(a => String(a.patient_id || "") === String(patientRecord.patient_id))
    : alerts;

  if (isPatient) {
    return (
      <PatientDashboard
        user={user}
        patients={patientRecord ? [patientRecord] : []}
        treatments={patientTreatments}
        scheduled={patientScheduled}
        completed={patientCompleted}
        page={activeNav}
        search={search}
        setSearch={setSearch}
        sessionNotes={sessionNotes}
        setSessionNotes={setSessionNotes}
        onUpdateSession={updateSession}
        onSchedule={t => { setSelectedTreatment(t.uuid); setPage("schedule"); }}
        onNavigate={nextPage => { setPage(nextPage); setSearch(""); }}
        onLogout={logout}
        notificationsCount={patientAlerts.filter(a => a.status !== "Resolved").length}
        alerts={patientAlerts}
      />
    );
  }

  const filteredPatients = patients.filter(p => `${p.name} ${p.email} ${p.patient_id}`.toLowerCase().includes(search.toLowerCase()));
  const filteredTreatments = treatments.filter(t => `${t.patient_name} ${t.therapist_name} ${t.uuid}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-symbol">✺</div><div><strong>AYURDHARA</strong><small>Panchakarma Care</small></div>
      </div>
      <div className="side-user"><div className="avatar">{(user.name || "A").slice(0, 1).toUpperCase()}</div><div className="side-user-text"><b>{user.name}</b><span>{user.role}</span></div><span className="online-dot" /></div>
      {["Overview", "Care", "Coordination", "Administration"].map(group => {
        const items = visibleNav.filter(n => n.group === group);
        if (!items.length) return null;
        return <div className="nav-group" key={group}><div className="nav-heading">{group}</div>{items.map(n =>
          <button key={n.id} className={`nav-item ${activeNav === n.id ? "active" : ""}`} onClick={() => { setPage(n.id); setSearch(""); }}>
            <span className="nav-icon">{n.icon}</span><span>{n.label}</span>{n.id === "alerts" && openAlerts.length > 0 && <em className="nav-count">{openAlerts.length}</em>}
          </button>
        )}</div>;
      })}
      <div className="sidebar-bottom">
        <div className="wellness-card"><span>✦</span><b>Care, in balance.</b><p>Every session is a step toward better wellbeing.</p></div>
        <button className="nav-item logout" onClick={logout}><span className="nav-icon">↪</span> Sign out</button>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div className="crumb">AYURDHARA <span>/</span> {visibleNav.find(n => n.id === activeNav)?.label || "Dashboard"}</div>
        <div className="topbar-right"><div className="today">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</div><button className="icon-button" onClick={() => setPage("notifications")} title="Notifications">♧{openAlerts.length > 0 && <i />}</button><div className="top-avatar">{(user.name || "A").slice(0, 1).toUpperCase()}</div><div className="top-username"><b>{user.name}</b><span>{user.role}</span></div></div>
      </header>
      <div className="page-content">
        {notice && <div className={`toast ${notice.type}`}><span>{notice.type === "success" ? "✓" : "!"}</span>{notice.message}<button onClick={() => setNotice(null)}>×</button></div>}
        {loading && <div className="loading-line"><span /> Syncing your care workspace…</div>}
        {activeNav === "dashboard" && <Dashboard user={user} patients={patients} treatments={treatments} scheduled={scheduled} completed={completed} alerts={openAlerts} onNavigate={setPage} />}
        {activeNav === "patients" && <Patients patients={filteredPatients} search={search} setSearch={setSearch} onAdd={() => setModal("patient")} />}
        {activeNav === "treatments" && <Treatments treatments={filteredTreatments} search={search} setSearch={setSearch} onSchedule={t => { setSelectedTreatment(t.uuid); setScheduleForm({ therapist_id: t.therapist_id || "", appointment_start: t.appointment_start ? new Date(t.appointment_start).toISOString().slice(0, 16) : "", duration_minutes: t.duration_minutes || 60, priority: t.priority || 2 }); setPage("schedule"); }} />}
        {activeNav === "schedule" && <Scheduling treatments={treatments} therapists={therapists} selectedTreatment={selectedTreatment} setSelectedTreatment={setSelectedTreatment} form={scheduleForm} setForm={setScheduleForm} onSubmit={scheduleTreatment} busy={busy} />}
        {activeNav === "sessions" && <Sessions treatments={scheduled} notes={sessionNotes} setNotes={setSessionNotes} onUpdate={updateSession} />}
        {activeNav === "progress" && <Progress patients={patients} treatments={treatments} completed={completed} />}
        {activeNav === "alerts" && <Alerts alerts={alerts} patients={patients} treatments={treatments} form={alertForm} setForm={setAlertForm} onCreate={() => setModal("alert")} onUpdate={updateAlert} />}
        {activeNav === "reports" && <Reports patients={patients} treatments={treatments} alerts={alerts} />}
        {activeNav === "notifications" && <Notifications treatments={treatments} alerts={alerts} onNavigate={setPage} />}
        {activeNav === "users" && <Users users={users} onAdd={() => setModal("user")} onDelete={deleteUser} />}
      </div>
      <footer className="app-footer"><span>✦</span> AyurDhara <span>·</span> Panchakarma care, organized for better healing <span className="footer-right">Built for coordinated care</span></footer>
    </main>

    {modal && <Modal title={modal === "patient" ? "Add patient" : modal === "user" ? "Add team member" : "Record emergency alert"} onClose={() => setModal("")}>
      {modal === "patient" && <form className="modal-form" onSubmit={createPatient}>
        <label>Full name</label><input value={patientForm.name} onChange={e => setPatientForm({ ...patientForm, name: e.target.value })} required />
        <label>Email</label><input type="email" value={patientForm.email} onChange={e => setPatientForm({ ...patientForm, email: e.target.value })} required />
        <label>Phone number</label><input value={patientForm.phone_number} onChange={e => setPatientForm({ ...patientForm, phone_number: e.target.value })} />
        <label>Temporary password</label><input type="password" minLength="8" value={patientForm.password} onChange={e => setPatientForm({ ...patientForm, password: e.target.value })} required />
        <p className="form-hint">A patient account and patient record will be created in your existing database.</p>
        <button className="primary-btn wide" disabled={busy}>{busy ? "Saving…" : "Create patient"}</button>
      </form>}
      {modal === "user" && <form className="modal-form" onSubmit={createUser}>
        <label>Full name</label><input value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
        <label>Email</label><input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
        <label>Phone number</label><input value={userForm.phone_number} onChange={e => setUserForm({ ...userForm, phone_number: e.target.value })} />
        <label>Temporary password</label><input type="password" minLength="8" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required />
        <label>Role</label><select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}><option value="doctor">Doctor</option><option value="therapist">Therapist</option><option value="patient">Patient</option><option value="admin">Admin</option></select>
        <p className="form-hint">Only use this admin tool for trusted team accounts. New doctor/therapist records may need their profile details added separately.</p>
        <button className="primary-btn wide" disabled={busy}>{busy ? "Saving…" : "Create user"}</button>
      </form>}
      {modal === "alert" && <form className="modal-form" onSubmit={createAlert}>
        <label>Patient</label><select value={alertForm.patient_id} onChange={e => setAlertForm({ ...alertForm, patient_id: e.target.value })}><option value="">Select patient (optional)</option>{patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.name}</option>)}</select>
        <label>Related treatment (optional)</label><select value={alertForm.treatment_uuid} onChange={e => setAlertForm({ ...alertForm, treatment_uuid: e.target.value })}><option value="">No treatment selected</option>{treatments.map(t => <option key={t.uuid} value={t.uuid}>{t.patient_name || shortId(t.patient_id)} · {shortId(t.uuid)}</option>)}</select>
        <label>Severity</label><select value={alertForm.severity} onChange={e => setAlertForm({ ...alertForm, severity: e.target.value })}><option>High</option><option>Critical</option><option>Medium</option></select>
        <label>Symptoms / observations</label><textarea rows="4" value={alertForm.symptoms} onChange={e => setAlertForm({ ...alertForm, symptoms: e.target.value })} required placeholder="Describe the reported symptoms…" />
        <button className="primary-btn wide" disabled={busy}>{busy ? "Saving…" : "Save emergency alert"}</button>
      </form>}
    </Modal>}
  </div>;
}

export default App;
