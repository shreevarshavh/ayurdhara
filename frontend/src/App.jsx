
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import api from "./services/api";

import { NAV, fmtDate, fmtTime, shortId, normalizeRole } from "./utils";

import Login from "./components/Login";
import Scheduling from "./components/Scheduling";
import PatientDashboard from "./components/PatientDashboard";
import Modal from "./components/Modal";
import AyurDharaLogo from "./components/AyurDharaLogo";
import {
  Bell,
  LogOut,
  LayoutDashboard,
  UserRound,
  Users as UsersIcon,
  ClipboardList,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  HeartPulse,
  AlertTriangle,
  FileText,
  HelpCircle,
  UserCheck,
  CalendarClock,
  X,
  Sparkles,
  Check,
  AlertCircle
} from "lucide-react";

import {
  Dashboard,
  Patients,
  Treatments,
  Sessions,
  Progress,
  Alerts,
  Reports,
  Notifications,
  Users,
} from "./components/Pages";

function App() {
  // React Router
  const navigate = useNavigate();
  const location = useLocation();

  const page = location.pathname.replace("/", "") || "dashboard";

  const NAV_ICONS = {
    dashboard: LayoutDashboard,
    profile: UserRound,
    patients: UsersIcon,
    treatments: ClipboardList,
    schedule: CalendarClock,
    sessions: CalendarDays,
    progress: ChartNoAxesColumnIncreasing,
    vitals: HeartPulse,
    alerts: AlertTriangle,
    reports: FileText,
    notifications: Bell,
    help: HelpCircle,
    users: UserCheck
  };

  const navigatePage = (nextPage) => {
    navigate(`/${nextPage}`);
    setSearch("");
  };

  // User authentication
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ayurdhara_user") || "null");
    } catch {
      return null;
    }
  });

  console.log("Current logged-in user:", user);

  // Application states
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

  const [scheduleForm, setScheduleForm] = useState({
    therapist_id: "",
    appointment_start: "",
    duration_minutes: 60,
    priority: 2,
  });

  const [patientForm, setPatientForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    role: "therapist",
  });

  const [alertForm, setAlertForm] = useState({
    patient_id: "",
    treatment_uuid: "",
    severity: "High",
    symptoms: "",
  });

  const [sessionNotes, setSessionNotes] = useState({});
  const [sessionStatuses, setSessionStatuses] = useState({});
  const [busy, setBusy] = useState(false);

  // Notifications
  const flash = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 4500);
  };

  // Load application data
  const loadData = useCallback(async () => {
    setLoading(true);

    const results = await Promise.allSettled([
      api("/api/treatment/patients"),
      api("/api/treatment"),
      api("/api/users"),
      api("/api/treatment/therapists"),
      api("/api/treatment/alerts"),
    ]);

    const [p, t, u, th, a] = results;

    if (p.status === "fulfilled")
      setPatients(Array.isArray(p.value) ? p.value : []);

    if (t.status === "fulfilled")
      setTreatments(Array.isArray(t.value) ? t.value : []);

    if (u.status === "fulfilled")
      setUsers(u.value.data || []);

    if (th.status === "fulfilled")
      setTherapists(Array.isArray(th.value) ? th.value : []);

    if (a.status === "fulfilled")
      setAlerts(Array.isArray(a.value) ? a.value : []);

    const failures = results.filter(
      (r) => r.status === "rejected"
    );

    if (failures.length) {
      console.warn(
        "Some AyurDhara data endpoints failed:",
        failures.map((f) => f.reason?.message)
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // Navigation and dashboard calculations
  const visibleNav = NAV.filter(
    (n) => !n.roles || n.roles.includes(normalizeRole(user?.role))
  );

  const scheduled = useMemo(
    () => treatments.filter((t) => t.appointment_start),
    [treatments]
  );

  const completed = useMemo(
    () =>
      treatments.filter(
        (t) => (t.session_status || "Scheduled") === "Completed"
      ),
    [treatments]
  );

  const openAlerts = alerts.filter(
    (a) => a.status !== "Resolved"
  );

  const activeNav = visibleNav.some((n) => n.id === page)
    ? page
    : "dashboard";

  const isPatient =
    String(user?.role || "").toLowerCase() === "patient";

  // Logout
  function logout() {
    localStorage.removeItem("ayurdhara_token");
    localStorage.removeItem("ayurdhara_user");

    setUser(null);
    navigate("/login", { replace: true });
  }

  // Create patient
  async function createPatient(e) {
    e.preventDefault();
    setBusy(true);

    try {
      await api("/api/users", {
        method: "POST",
        body: JSON.stringify({
          ...patientForm,
          role: "patient",
        }),
      });

      setModal("");

      setPatientForm({
        name: "",
        email: "",
        phone_number: "",
        password: "",
      });

      flash("success", "Patient account created.");
      await loadData();
    } catch (err) {
      flash("error", err.message);
    } finally {
      setBusy(false);
    }
  }

  // Create user
  async function createUser(e) {
    e.preventDefault();
    setBusy(true);

    try {
      await api("/api/users", {
        method: "POST",
        body: JSON.stringify(userForm),
      });

      setModal("");

      setUserForm({
        name: "",
        email: "",
        phone_number: "",
        password: "",
        role: "therapist",
      });

      flash("success", "User created successfully.");
      await loadData();
    } catch (err) {
      flash("error", err.message);
    } finally {
      setBusy(false);
    }
  }

  // Schedule treatment
  async function scheduleTreatment(e) {
    e.preventDefault();

    if (!selectedTreatment)
      return flash("error", "Select a treatment first.");

    const treatment = treatments.find(
      (t) => t.uuid === selectedTreatment
    );

    if (!treatment)
      return flash("error", "Treatment record not found.");

    setBusy(true);

    try {
      const result = await api("/api/treatment/schedule", {
        method: "POST",
        body: JSON.stringify({
          uuid: treatment.uuid,
          therapist_id:
            scheduleForm.therapist_id || treatment.therapist_id,
          appointment_start: new Date(
            scheduleForm.appointment_start
          ).toISOString(),
          duration_minutes: Number(
            scheduleForm.duration_minutes
          ),
          priority: Number(scheduleForm.priority),
        }),
      });

      flash("success", result.message || "Schedule updated.");
      await loadData();
    } catch (err) {
      flash("error", err.message);
    } finally {
      setBusy(false);
    }
  }

  // Update session
  async function updateSession(treatment, status) {
    try {
      const result = await api(
        `/api/treatment/${treatment.uuid}/session`,
        {
          method: "PATCH",
          body: JSON.stringify({
            session_status: status,
            session_notes:
              sessionNotes[treatment.uuid] ??
              treatment.session_notes ??
              "",
          }),
        }
      );

      flash("success", result.message || "Session updated.");
      await loadData();
    } catch (err) {
      flash("error", err.message);
    }
  }

  // Create emergency alert
  async function createAlert(e) {
    e.preventDefault();
    setBusy(true);

    try {
      await api("/api/treatment/alerts", {
        method: "POST",
        body: JSON.stringify({
          ...alertForm,
          reported_by: user.user_id,
          patient_id: alertForm.patient_id || null,
          treatment_uuid: alertForm.treatment_uuid || null,
        }),
      });

      setModal("");

      setAlertForm({
        patient_id: "",
        treatment_uuid: "",
        severity: "High",
        symptoms: "",
      });

      flash(
        "success",
        "Emergency alert recorded. The care team can now review it."
      );

      await loadData();
    } catch (err) {
      flash("error", err.message);
    } finally {
      setBusy(false);
    }
  }

  // Update emergency alert
  async function updateAlert(alert, status) {
    try {
      await api(`/api/treatment/alerts/${alert.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      flash(
        "success",
        `Alert marked ${status.toLowerCase()}.`
      );

      await loadData();
    } catch (err) {
      flash("error", err.message);
    }
  }

  // Delete user
  async function deleteUser(id) {
    if (
      !window.confirm(
        "Delete this user? This may be blocked if the user has linked clinical records."
      )
    )
      return;

    try {
      await api(`/api/users/${id}`, {
        method: "DELETE",
      });

      flash("success", "User deleted.");
      await loadData();
    } catch (err) {
      flash("error", err.message);
    }
  }

  // Login routes
  if (!user) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={(loggedInUser) => {
                setUser(loggedInUser);
                navigate("/dashboard", { replace: true });
              }}
            />
          }
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    );
  }

  // Redirect authenticated users away from login
  if (page === "login" || location.pathname === "/") {
    return <Navigate to="/dashboard" replace />;
  }

  // Patient dashboard data
  const patientRecord = isPatient
    ? patients.find(
        (p) =>
          String(p.email || "").toLowerCase() ===
          String(user.email || "").toLowerCase()
      ) || null
    : null;

  const patientTreatments = isPatient
    ? patientRecord
      ? treatments.filter(
          (t) =>
            String(t.patient_id) ===
            String(patientRecord.patient_id)
        )
      : []
    : treatments;

  const patientScheduled = patientTreatments.filter(
    (t) => t.appointment_start
  );

  const patientCompleted = patientTreatments.filter(
    (t) =>
      (t.session_status || "Scheduled").toLowerCase() ===
      "completed"
  );

  const patientAlerts =
    isPatient && patientRecord
      ? alerts.filter(
          (a) =>
            String(a.patient_id || "") ===
            String(patientRecord.patient_id)
        )
      : alerts;

  // Patient dashboard
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
        onSchedule={(t) => {
          setSelectedTreatment(t.uuid);
          navigatePage("schedule");
        }}
        onNavigate={navigatePage}
        onLogout={logout}
        notificationsCount={
          patientAlerts.filter(
            (a) => a.status !== "Resolved"
          ).length
        }
        alerts={patientAlerts}
      />
    );
  }

  // Search filters
  const filteredPatients = patients.filter((p) =>
    `${p.name} ${p.email} ${p.patient_id}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredTreatments = treatments.filter((t) =>
    `${t.patient_name} ${t.therapist_name} ${t.uuid}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Main application
  return (
    <div className="min-h-screen flex">

      {/* Sidebar */}
      <aside className="w-[248px] max-[1200px]:px-[10px] max-[900px]:w-[74px] max-[900px]:p-[17px_8px] max-[600px]:w-[57px] max-[600px]:p-[12px_5px] bg-white border-r border-[#e6ebe4] fixed inset-y-0 left-0 flex flex-col p-[22px_14px_14px] z-10 overflow-y-auto">

        <div className="flex items-center gap-[10px] p-[0_12px_23px] max-[900px]:justify-center max-[900px]:p-[0_0_20px] border-b border-[#edf0eb]">
          <AyurDharaLogo size={32} variant="dark" />

          <div className="max-[900px]:hidden">
            <strong className="block font-['Manrope',sans-serif] text-[14px] tracking-[0.11em] text-[#244b36] font-bold">AYURDHARA</strong>
            <small className="text-[10px] text-[#859287] block mt-[2px]">Panchakarma Care</small>
          </div>
        </div>

        <div className="flex items-center gap-[10px] p-[18px_9px_20px] max-[900px]:justify-center max-[900px]:p-[15px_0] border-b border-[#edf0eb]">
          <div className="w-[34px] h-[34px] grid place-items-center rounded-full bg-[#e4eee3] text-[#2c6946] font-extrabold text-[13px] shrink-0">
            {(user.name || "A").slice(0, 1).toUpperCase()}
          </div>

          <div className="flex flex-1 flex-col gap-[3px] min-w-0 max-[900px]:hidden">
            <b className="text-[12px] whitespace-nowrap overflow-hidden text-ellipsis font-bold">{user.name}</b>
            <span className="text-[10px] capitalize text-[#7d8a80]">{user.role}</span>
          </div>

          <span className="w-[7px] h-[7px] rounded-full bg-[#62a66f] self-start mt-[5px] max-[900px]:hidden" />
        </div>

        {["Overview", "Care", "Coordination", "Administration"].map(
          (group) => {
            const items = visibleNav.filter(
              (n) => n.group === group
            );

            if (!items.length) return null;

            return (
              <div className="pt-[14px] first:pt-[10px]" key={group}>
                <div className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#829184] p-[0_12px] mb-[7px] max-[900px]:hidden">{group}</div>

                {items.map((n) => {
                  const IconComp = NAV_ICONS[n.id] || LayoutDashboard;
                  return (
                    <button
                      key={n.id}
                      className={`w-full flex items-center gap-[10px] max-[900px]:justify-center border-0 rounded-[9px] p-[9px_12px] max-[900px]:p-[11px_6px] text-[12px] font-bold mb-[3px] transition-colors cursor-pointer ${
                        activeNav === n.id ? "bg-[#e4f1e6] text-[#19563f]" : "bg-transparent text-[#4b6154] hover:bg-[#f1f6f0] hover:text-[#19563f]"
                      }`}
                      onClick={() => navigatePage(n.id)}
                    >
                      <span className="w-[20px] grid place-items-center shrink-0">
                        <IconComp size={17} strokeWidth={1.8} />
                      </span>
                      <span className="max-[900px]:hidden">{n.label}</span>

                      {n.id === "alerts" &&
                        openAlerts.length > 0 && (
                          <em className="ml-auto text-[9px] bg-[#d85c54] text-white rounded-[20px] p-[3px_6px] not-italic max-[900px]:hidden">
                            {openAlerts.length}
                          </em>
                        )}
                    </button>
                  );
                })}
              </div>
            );
          }
        )}

        <div className="mt-auto pt-[16px]">
          <div className="bg-[#f4f8f2] border border-[#e7efe4] rounded-[12px] p-[13px] mb-[12px] max-[900px]:hidden">
            <Sparkles size={16} strokeWidth={1.8} className="text-[#588e63]" />
            <b className="block text-[11px] m-[4px_0_2px] font-bold">Care, in balance.</b>
            <p className="text-[10px] text-[#7f8e82] leading-[1.4] m-0">
              Every session is a step toward better wellbeing.
            </p>
          </div>

          <button
            className="w-full flex items-center gap-[10px] max-[900px]:justify-center border-0 rounded-[9px] p-[9px_12px] max-[900px]:p-[11px_6px] text-[12px] font-bold mb-[3px] text-[#b04a44] hover:bg-[#faeae8] transition-colors cursor-pointer"
            onClick={logout}
          >
            <LogOut size={16} strokeWidth={1.8} className="shrink-0" />
            <span className="max-[900px]:hidden">Sign out</span>
          </button>
        </div>

      </aside>

      {/* Main content */}
      <main className="ml-[248px] max-[900px]:ml-[74px] max-[600px]:ml-[57px] flex-1 min-w-0 bg-[#f5f7f3] flex flex-col">

        {/* Topbar */}
        <header className="h-[70px] max-[600px]:h-[58px] bg-white border-b border-[#e6ebe5] flex items-center justify-between px-[32px] max-[1200px]:px-[20px] max-[600px]:px-[13px] sticky top-0 z-[9]">

          <div className="text-[10px] max-[600px]:text-[8px] font-extrabold tracking-[0.14em] text-[#869588] uppercase [&>span]:text-[#b3c1b6] [&>span]:px-[6px] truncate mr-2">
            AYURDHARA <span>/</span>{" "}
            {visibleNav.find((n) => n.id === activeNav)?.label ||
              "Dashboard"}
          </div>

          <div className="flex items-center gap-[14px] max-[600px]:gap-[8px]">

            <div className="text-[10px] text-[#869588] font-bold max-[900px]:hidden">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>

            <button
              className="relative border border-[#e6ebe5] bg-white rounded-[10px] w-[38px] h-[38px] text-[#476a54] grid place-items-center cursor-pointer hover:bg-[#f6f8f5] transition-colors"
              onClick={() => navigatePage("notifications")}
              title="Notifications"
            >
              <Bell size={18} strokeWidth={1.8} />
              {openAlerts.length > 0 && <i className="absolute right-[7px] top-[6px] w-[7px] h-[7px] rounded-full bg-[#c9554d] border border-white" />}
            </button>

            <div className="w-[34px] h-[34px] grid place-items-center rounded-full bg-[#e4eee3] text-[#2c6946] font-extrabold text-[13px] shrink-0">
              {(user.name || "A").slice(0, 1).toUpperCase()}
            </div>

            <div className="flex flex-col gap-[1px] max-[900px]:hidden">
              <b className="text-[11px] font-bold">{user.name}</b>
              <span className="text-[9px] capitalize text-[#7d8a80]">{user.role}</span>
            </div>

          </div>
        </header>

        {/* Page content */}
        <div className="p-[27px_32px] max-[1200px]:p-[22px_20px] max-[600px]:p-[16px_12px] max-[380px]:p-[12px_8px] min-h-[calc(100vh-120px)] max-[600px]:min-h-[calc(100vh-110px)] flex-1 flex flex-col">
          <div key={location.pathname} className="page-transition min-w-0 flex-1 flex flex-col">

          {notice && (
            <div className={`fixed right-[24px] bottom-[24px] z-40 p-[12px_18px] rounded-[10px] flex items-center gap-[10px] text-[12px] font-bold shadow-[0_10px_30px_#08211422] ${notice.type === "success" ? "bg-[#19563f] text-white" : "bg-[#b13b35] text-white"}`}>
              <span className="flex items-center">
                {notice.type === "success" ? <Check size={15} strokeWidth={2.5} /> : <AlertCircle size={15} strokeWidth={2.5} />}
              </span>

              {notice.message}

              <button className="border-0 bg-transparent text-white cursor-pointer ml-[6px] grid place-items-center opacity-85 hover:opacity-100" onClick={() => setNotice(null)} aria-label="Dismiss notice">
                <X size={15} />
              </button>
            </div>
          )}

          {loading && (
            <div className="text-[11px] text-[#6d7f73] flex items-center gap-[8px] mb-[12px]">
              <span className="w-[14px] h-[14px] border-2 border-[#a3bda8] border-t-[#266b4c] rounded-full animate-spin" />
              Syncing your care workspace…
            </div>
          )}

          {/* React Router page routes */}
          <Routes>

            <Route
              path="/dashboard"
              element={
                <Dashboard
                  user={user}
                  patients={patients}
                  treatments={treatments}
                  scheduled={scheduled}
                  completed={completed}
                  alerts={openAlerts}
                  onNavigate={navigatePage}
                />
              }
            />

            <Route
              path="/patients"
              element={
                <Patients
                  patients={filteredPatients}
                  search={search}
                  setSearch={setSearch}
                  onAdd={() => setModal("patient")}
                />
              }
            />

            <Route
              path="/treatments"
              element={
                <Treatments
                  treatments={filteredTreatments}
                  search={search}
                  setSearch={setSearch}
                  onSchedule={(t) => {
                    setSelectedTreatment(t.uuid);

                    setScheduleForm({
                      therapist_id: t.therapist_id || "",
                      appointment_start: t.appointment_start
                        ? new Date(t.appointment_start)
                            .toISOString()
                            .slice(0, 16)
                        : "",
                      duration_minutes: t.duration_minutes || 60,
                      priority: t.priority || 2,
                    });

                    navigatePage("schedule");
                  }}
                />
              }
            />

            <Route
              path="/schedule"
              element={
                <Scheduling
                  treatments={treatments}
                  therapists={therapists}
                  selectedTreatment={selectedTreatment}
                  setSelectedTreatment={setSelectedTreatment}
                  form={scheduleForm}
                  setForm={setScheduleForm}
                  onSubmit={scheduleTreatment}
                  busy={busy}
                />
              }
            />

            <Route
              path="/sessions"
              element={
                <Sessions
                  treatments={scheduled}
                  notes={sessionNotes}
                  setNotes={setSessionNotes}
                  onUpdate={updateSession}
                />
              }
            />

            <Route
              path="/progress"
              element={
                <Progress
                  patients={patients}
                  treatments={treatments}
                  completed={completed}
                />
              }
            />

            <Route
              path="/alerts"
              element={
                <Alerts
                  alerts={alerts}
                  patients={patients}
                  treatments={treatments}
                  form={alertForm}
                  setForm={setAlertForm}
                  onCreate={() => setModal("alert")}
                  onUpdate={updateAlert}
                />
              }
            />

            <Route
              path="/reports"
              element={
                <Reports
                  patients={patients}
                  treatments={treatments}
                  alerts={alerts}
                />
              }
            />

            <Route
              path="/notifications"
              element={
                <Notifications
                  treatments={treatments}
                  alerts={alerts}
                  onNavigate={navigatePage}
                />
              }
            />

            <Route
              path="/users"
              element={
                <Users
                  users={users}
                  onAdd={() => setModal("user")}
                  onDelete={deleteUser}
                />
              }
            />

            <Route
              path="*"
              element={<Navigate to="/dashboard" replace />}
            />

          </Routes>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-[18px_32px] max-[600px]:p-[14px] max-[600px]:text-[9px] border-t border-[#e7ece5] text-[11px] text-[#8a968d] flex items-center gap-[7px] bg-[#f7f9f5] mt-auto">
          <Sparkles size={12} strokeWidth={1.8} className="text-[#649472]" /> AyurDhara <span>·</span>
          Panchakarma care, organized for better healing

          <span className="ml-auto max-[600px]:hidden">
            Built for coordinated care
          </span>
        </footer>

      </main>

      {/* Modals */}
      {modal && (
        <Modal
          title={
            modal === "patient"
              ? "Add patient"
              : modal === "user"
                ? "Add team member"
                : "Record emergency alert"
          }
          onClose={() => setModal("")}
        >

          {/* Patient form */}
          {modal === "patient" && (
            <form
              className="flex flex-col gap-[9px]"
              onSubmit={createPatient}
            >
              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Full name</label>

              <input
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                value={patientForm.name}
                onChange={(e) =>
                  setPatientForm({
                    ...patientForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Email</label>

              <input
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                type="email"
                value={patientForm.email}
                onChange={(e) =>
                  setPatientForm({
                    ...patientForm,
                    email: e.target.value,
                  })
                }
                required
              />

              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Phone number</label>

              <input
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                value={patientForm.phone_number}
                onChange={(e) =>
                  setPatientForm({
                    ...patientForm,
                    phone_number: e.target.value,
                  })
                }
              />

              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Temporary password</label>

              <input
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                type="password"
                minLength="8"
                value={patientForm.password}
                onChange={(e) =>
                  setPatientForm({
                    ...patientForm,
                    password: e.target.value,
                  })
                }
                required
              />

              <p className="text-[10px] text-[#869389] leading-[1.4] m-[4px_0_6px]">
                A patient account and patient record will be
                created in your existing database.
              </p>

              <button
                className="border border-transparent rounded-[9px] p-[10px_14px] text-[12px] font-bold inline-flex items-center justify-center gap-[9px] transition-[transform,background] duration-150 bg-[#19563f] text-white shadow-[0_4px_10px_#19563f16] hover:bg-[#124630] hover:-translate-y-px cursor-pointer w-full disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={busy}
              >
                {busy ? "Saving…" : "Create patient"}
              </button>
            </form>
          )}

          {/* User form */}
          {modal === "user" && (
            <form
              className="flex flex-col gap-[9px]"
              onSubmit={createUser}
            >
              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Full name</label>

              <input
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    name: e.target.value,
                  })
                }
                required
              />

              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Email</label>

              <input
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    email: e.target.value,
                  })
                }
                required
              />

              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Phone number</label>

              <input
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                value={userForm.phone_number}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    phone_number: e.target.value,
                  })
                }
              />

              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Temporary password</label>

              <input
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                type="password"
                minLength="8"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    password: e.target.value,
                  })
                }
                required
              />

              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Role</label>

              <select
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                value={userForm.role}
                onChange={(e) =>
                  setUserForm({
                    ...userForm,
                    role: e.target.value,
                  })
                }
              >
                <option value="doctor">Doctor</option>
                <option value="therapist">Therapist</option>
                <option value="patient">Patient</option>
                <option value="ADMIN">Admin</option>
              </select>

              <p className="text-[10px] text-[#869389] leading-[1.4] m-[4px_0_6px]">
                Only use this admin tool for trusted team
                accounts. New doctor/therapist records may need
                their profile details added separately.
              </p>

              <button
                className="border border-transparent rounded-[9px] p-[10px_14px] text-[12px] font-bold inline-flex items-center justify-center gap-[9px] transition-[transform,background] duration-150 bg-[#19563f] text-white shadow-[0_4px_10px_#19563f16] hover:bg-[#124630] hover:-translate-y-px cursor-pointer w-full disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={busy}
              >
                {busy ? "Saving…" : "Create user"}
              </button>
            </form>
          )}

          {/* Emergency alert form */}
          {modal === "alert" && (
            <form
              className="flex flex-col gap-[9px]"
              onSubmit={createAlert}
            >
              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Patient</label>

              <select
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                value={alertForm.patient_id}
                onChange={(e) =>
                  setAlertForm({
                    ...alertForm,
                    patient_id: e.target.value,
                  })
                }
              >
                <option value="">
                  Select patient (optional)
                </option>

                {patients.map((p) => (
                  <option
                    key={p.patient_id}
                    value={p.patient_id}
                  >
                    {p.name}
                  </option>
                ))}
              </select>

              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Related treatment (optional)</label>

              <select
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                value={alertForm.treatment_uuid}
                onChange={(e) =>
                  setAlertForm({
                    ...alertForm,
                    treatment_uuid: e.target.value,
                  })
                }
              >
                <option value="">No treatment selected</option>

                {treatments.map((t) => (
                  <option key={t.uuid} value={t.uuid}>
                    {t.patient_name || shortId(t.patient_id)}
                    {" · "}
                    {shortId(t.uuid)}
                  </option>
                ))}
              </select>

              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Severity</label>

              <select
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                value={alertForm.severity}
                onChange={(e) =>
                  setAlertForm({
                    ...alertForm,
                    severity: e.target.value,
                  })
                }
              >
                <option>High</option>
                <option>Critical</option>
                <option>Medium</option>
              </select>

              <label className="text-[11px] font-bold text-[#506158] mt-[5px]">Symptoms / observations</label>

              <textarea
                className="border border-[#dfe6df] rounded-[8px] p-[12px_13px] bg-[#fcfdfb] text-[#20372f] outline-none w-full text-[12px] focus:border-[#7ba888] focus:shadow-[0_0_0_3px_#e6f2e8]"
                rows="4"
                value={alertForm.symptoms}
                onChange={(e) =>
                  setAlertForm({
                    ...alertForm,
                    symptoms: e.target.value,
                  })
                }
                required
                placeholder="Describe the reported symptoms…"
              />

              <button
                className="border border-transparent rounded-[9px] p-[10px_14px] text-[12px] font-bold inline-flex items-center justify-center gap-[9px] transition-[transform,background] duration-150 bg-[#19563f] text-white shadow-[0_4px_10px_#19563f16] hover:bg-[#124630] hover:-translate-y-px cursor-pointer w-full disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={busy}
              >
                {busy ? "Saving…" : "Save emergency alert"}
              </button>
            </form>
          )}

        </Modal>
      )}

    </div>
  );
}

export default App;
