import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./styles/therapist-theme.css";
import DashboardLayout from "./components/layout/DashboardLayout";
import api from "./services/api";
import { fmtDate, fmtTime, shortId } from "./utils";
import { getRolePageIds, normalizeRole } from "./config/navigation";
import Login from "./components/Login";
import Scheduling from "./components/Scheduling";
import PatientDashboard from "./components/PatientDashboard";
import Modal from "./components/Modal";
import "./styles/ui-consistency.css";

import {
  Dashboard,
  Patients,
  Treatments,
  Sessions,
  Progress,
  Alerts,
  Reports,
  Notifications,
  Users
} from "./components/Pages";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ayurdhara_user") || "null");
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [users, setUsers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [doctors, setDoctors] = useState([]);
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
    priority: 2
  });

  // Treatment plan form
  const [treatmentForm, setTreatmentForm] = useState({
    patient_id: "",
    treatment_name: "",
    treatment_requirements: "",
    duration_minutes: 60,
    priority: 2,
    doctor_id: ""
  });

  const [patientForm, setPatientForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: ""
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    role: "therapist"
  });

  const [alertForm, setAlertForm] = useState({
    patient_id: "",
    treatment_uuid: "",
    severity: "High",
    symptoms: ""
  });

  const [sessionNotes, setSessionNotes] = useState({});
  const [sessionStatuses, setSessionStatuses] = useState({});
  const [busy, setBusy] = useState(false);

  const flash = (type, message) => {
    setNotice({ type, message });
  };

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = useCallback(async () => {
    setLoading(true);

    const currentRole = normalizeRole(user?.role);
    const isPatientUser = currentRole === "patient";
    const isDoctorOrAdmin = ["doctor", "admin"].includes(currentRole);
    const isAdmin = currentRole === "admin";

    // Request only endpoints permitted for the signed-in role.
    const requests = [
      isPatientUser
        ? api("/api/treatment/patients/me")
        : isDoctorOrAdmin
          ? api("/api/treatment/patients")
          : Promise.resolve([]),
      api("/api/treatment"),
      isAdmin ? api("/api/users") : Promise.resolve({ data: [] }),
      isDoctorOrAdmin
        ? api("/api/treatment/therapists")
        : Promise.resolve([]),
      ["doctor", "therapist", "admin"].includes(currentRole)
        ? api("/api/treatment/alerts")
        : Promise.resolve([]),
      isDoctorOrAdmin
        ? api("/api/treatment/doctors")
        : Promise.resolve([])
    ];

    try {
      const [patientResult, treatmentResult, userResult, therapistResult, alertResult, doctorResult] =
        await Promise.allSettled(requests);

      if (patientResult.status === "fulfilled") {
        const value = patientResult.value;
        setPatients(Array.isArray(value) ? value : value ? [value] : []);
      } else {
        setPatients([]);
      }

      if (treatmentResult.status === "fulfilled") {
        setTreatments(
          Array.isArray(treatmentResult.value) ? treatmentResult.value : []
        );
      }

      if (userResult.status === "fulfilled") {
        setUsers(userResult.value?.data || []);
      }

      if (therapistResult.status === "fulfilled") {
        setTherapists(
          Array.isArray(therapistResult.value) ? therapistResult.value : []
        );
      }

      if (alertResult.status === "fulfilled") {
        setAlerts(Array.isArray(alertResult.value) ? alertResult.value : []);
      } else {
        setAlerts([]);
      }

      if (doctorResult.status === "fulfilled") {
        setDoctors(Array.isArray(doctorResult.value) ? doctorResult.value : []);
      }

      const failures = [
        patientResult,
        treatmentResult,
        userResult,
        therapistResult,
        alertResult,
        doctorResult
      ].filter(result => result.status === "rejected");

      if (failures.length) {
        console.warn(
          "Some AyurDhara data endpoints failed:",
          failures.map(result => result.reason?.message)
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // =====================================================
  // ROLE MANAGEMENT
  // =====================================================

  const roleKey = normalizeRole(user?.role);
  const allowedPageIds = [
    ...getRolePageIds(roleKey),
    ...(roleKey === "doctor" ? ["schedule"] : [])
  ];

  const activeNav = allowedPageIds.includes(page)
    ? page
    : "dashboard";

  const isPatient = roleKey === "patient";

  // =====================================================
  // DASHBOARD CALCULATIONS
  // =====================================================

  const scheduled = useMemo(
    () => treatments.filter(treatment => treatment.appointment_start),
    [treatments]
  );

  const completed = useMemo(
    () =>
      treatments.filter(
        treatment =>
          (treatment.session_status || "Scheduled") === "Completed"
      ),
    [treatments]
  );

  const openAlerts = alerts.filter(
    alert => alert.status !== "Resolved"
  );

  // =====================================================
  // LOGOUT
  // =====================================================

  function logout() {
    localStorage.removeItem("ayurdhara_token");
    localStorage.removeItem("ayurdhara_user");

    setUser(null);
    setPage("dashboard");
  }

  // =====================================================
  // CREATE PATIENT
  // =====================================================

  async function createPatient(event) {
    event.preventDefault();
    setBusy(true);

    try {
      await api("/api/users", {
        method: "POST",
        body: JSON.stringify({
          ...patientForm,
          role: "patient"
        })
      });

      setModal("");

      setPatientForm({
        name: "",
        email: "",
        phone_number: "",
        password: ""
      });

      flash("success", "Patient account created.");

      await loadData();
    } catch (error) {
      flash("error", error.message);
    } finally {
      setBusy(false);
    }
  }

  // =====================================================
  // CREATE TREATMENT PLAN
  // =====================================================

  async function createTreatmentPlan(event) {
    event.preventDefault();

    const duration = Number(treatmentForm.duration_minutes);
    const priority = Number(treatmentForm.priority);

    if (!treatmentForm.patient_id) {
      flash("error", "Please select a patient.");
      return;
    }

    if (!treatmentForm.treatment_name.trim()) {
      flash("error", "Please select a treatment.");
      return;
    }

    if (
      !Number.isInteger(duration) ||
      duration < 15 ||
      duration > 480
    ) {
      flash(
        "error",
        "Treatment duration must be between 15 and 480 minutes."
      );
      return;
    }

    if (
      !Number.isInteger(priority) ||
      priority < 1 ||
      priority > 5
    ) {
      flash("error", "Priority must be between 1 and 5.");
      return;
    }

    const isAdmin = roleKey === "admin";

    if (isAdmin && !treatmentForm.doctor_id) {
      flash(
        "error",
        "Choose the doctor responsible for this treatment."
      );
      return;
    }

    setBusy(true);

    try {
      const payload = {
        patient_id: treatmentForm.patient_id,
        treatment_name: treatmentForm.treatment_name,
        treatment_requirements:
          treatmentForm.treatment_requirements,
        duration_minutes: duration,
        priority
      };

      // Admin selects the responsible doctor.
      // Doctor is assigned automatically by the backend.
      if (isAdmin) {
        payload.doctor_id = treatmentForm.doctor_id;
      }

      const result = await api("/api/treatment/plans", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setModal("");

      setTreatmentForm({
        patient_id: "",
        treatment_name: "",
        treatment_requirements: "",
        duration_minutes: 60,
        priority: 2,
        doctor_id: ""
      });

      flash(
        "success",
        result.message || "Treatment plan created successfully."
      );

      await loadData();
    } catch (error) {
      console.error("Create treatment plan error:", error);

      flash(
        "error",
        error.message || "Failed to create treatment plan."
      );
    } finally {
      setBusy(false);
    }
  }

  // =====================================================
  // CREATE USER
  // =====================================================

  async function createUser(event) {
    event.preventDefault();
    setBusy(true);

    try {
      await api("/api/users", {
        method: "POST",
        body: JSON.stringify(userForm)
      });

      setModal("");

      setUserForm({
        name: "",
        email: "",
        phone_number: "",
        password: "",
        role: "therapist"
      });

      flash("success", "User created successfully.");

      await loadData();
    } catch (error) {
      flash("error", error.message);
    } finally {
      setBusy(false);
    }
  }

  // =====================================================
  // SCHEDULE TREATMENT
  // =====================================================


  async function scheduleTreatment(e) {
    e.preventDefault();

    if (!selectedTreatment) {
      return flash("error", "Select a treatment first.");
    }

    const treatment = treatments.find(
      t => t.uuid === selectedTreatment
    );

    if (!treatment) {
      return flash("error", "Treatment record not found.");
    }

    setBusy(true);

    try {
      const requestedDate = new Date(scheduleForm.appointment_start);

      const result = await api("/api/treatment/schedule", {
        method: "POST",
        body: JSON.stringify({
          uuid: treatment.uuid,
          therapist_id: scheduleForm.therapist_id || treatment.therapist_id,
          appointment_start: requestedDate.toISOString(),
          duration_minutes: Number(scheduleForm.duration_minutes),
          priority: Number(scheduleForm.priority)
        })
      });

      // The backend returns schedule as an array.
      const assigned = Array.isArray(result.schedule)
        ? result.schedule[0]
        : result.schedule;

      if (!assigned) {
        throw new Error("Appointment was saved, but scheduling details were not returned.");
      }

      const formatDate = value =>
        new Date(value).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });

      const formatTime = value =>
        new Date(value).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });

      const wasAdjusted = assigned.auto_adjusted;

      setNotice({
        type: "success",
        message: wasAdjusted
          ? "Your requested time was unavailable. AyurDhara automatically selected another feasible time."
          : "Your requested appointment time was successfully confirmed.",
        details: [
          {
            label: "Patient",
            value: treatment.patient_name || "Patient"
          },
          {
            label: "Treatment",
            value: treatment.treatment_name || treatment.p1 || "Panchakarma treatment"
          },
          {
            label: "Assigned therapist",
            value: assigned.therapist_name || "Not available"
          },
          {
            label: "Requested time",
            value: `${formatDate(requestedDate)} · ${formatTime(requestedDate)}`
          },
          {
            label: "Confirmed time",
            value: `${formatDate(assigned.appointment_start)} · ${formatTime(assigned.appointment_start)}`
          },
          {
            label: "Scheduling status",
            value: wasAdjusted ? "Automatically adjusted" : "Confirmed as requested"
          }
        ]
      });

      await loadData();

    } catch (error) {
      flash("error", error.message);
    } finally {
      setBusy(false);
    }
  }


  // =====================================================
  // UPDATE SESSION
  // =====================================================

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
              ""
          })
        }
      );

      flash(
        "success",
        result.message || "Session updated."
      );

      await loadData();
    } catch (error) {
      flash("error", error.message);
    }
  }

  // =====================================================
  // CREATE EMERGENCY ALERT
  // =====================================================

  async function createAlert(event) {
    event.preventDefault();
    setBusy(true);

    try {
      await api("/api/treatment/alerts", {
        method: "POST",
        body: JSON.stringify({
          ...alertForm,
          reported_by: user.user_id,
          patient_id: alertForm.patient_id || null,
          treatment_uuid: alertForm.treatment_uuid || null
        })
      });

      setModal("");

      setAlertForm({
        patient_id: "",
        treatment_uuid: "",
        severity: "High",
        symptoms: ""
      });

      flash(
        "success",
        "Emergency alert recorded. The care team can now review it."
      );

      await loadData();
    } catch (error) {
      flash("error", error.message);
    } finally {
      setBusy(false);
    }
  }

  // =====================================================
  // UPDATE ALERT
  // =====================================================

  async function updateAlert(alert, status) {
    try {
      await api(`/api/treatment/alerts/${alert.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });

      flash(
        "success",
        `Alert marked ${status.toLowerCase()}.`
      );

      await loadData();
    } catch (error) {
      flash("error", error.message);
    }
  }

  // =====================================================
  // DELETE USER
  // =====================================================

  async function deleteUser(id) {
    if (
      !window.confirm(
        "Delete this user? This may be blocked if the user has linked clinical records."
      )
    ) {
      return;
    }

    try {
      await api(`/api/users/${id}`, {
        method: "DELETE"
      });

      flash("success", "User deleted.");

      await loadData();
    } catch (error) {
      flash("error", error.message);
    }
  }

  // =====================================================
  // LOGIN
  // =====================================================

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // =====================================================
  // PATIENT DATA
  // =====================================================

  const patientRecord = isPatient
    ? patients.find(
      patient =>
        String(patient.email || "").toLowerCase() ===
        String(user.email || "").toLowerCase()
    ) || null
    : null;

  const patientTreatments = isPatient
    ? patientRecord
      ? treatments.filter(
        treatment =>
          String(treatment.patient_id) ===
          String(patientRecord.patient_id)
      )
      : []
    : treatments;

  const patientScheduled = patientTreatments.filter(
    treatment => treatment.appointment_start
  );

  const patientCompleted = patientTreatments.filter(
    treatment =>
      (treatment.session_status || "Scheduled").toLowerCase() ===
      "completed"
  );

  const patientAlerts =
    isPatient && patientRecord
      ? alerts.filter(
        alert =>
          String(alert.patient_id || "") ===
          String(patientRecord.patient_id)
      )
      : alerts;

  // =====================================================
  // PATIENT DASHBOARD
  // =====================================================

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
        onSchedule={treatment => {
          setSelectedTreatment(treatment.uuid);
          setPage("schedule");
        }}
        onNavigate={nextPage => {
          setPage(nextPage);
          setSearch("");
        }}
        onLogout={logout}
        notificationsCount={
          patientAlerts.filter(
            alert => alert.status !== "Resolved"
          ).length
        }
        alerts={patientAlerts}
      />
    );
  }

  // =====================================================
  // FILTERED DATA
  // =====================================================

  const filteredPatients = patients.filter(patient =>
    `${patient.name} ${patient.email} ${patient.patient_id}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredTreatments = treatments.filter(treatment =>
    `${treatment.patient_name} ${treatment.therapist_name} ${treatment.uuid}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  return (
    <DashboardLayout
      user={user}
      role={user.role}
      page={activeNav}
      onNavigate={nextPage => {
        setPage(nextPage);
        setSearch("");
      }}
      onLogout={logout}
      notificationsCount={openAlerts.length}
    >

      {/* ================= NOTIFICATION POPUP ================= */}

      {notice && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(20, 35, 27, 0.6)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              background: "#ffffff",
              borderRadius: "22px",
              padding: "36px",
              textAlign: "center",
              boxShadow: "0 20px 70px rgba(0,0,0,0.2)"
            }}
          >

            {/* SUCCESS / ERROR ICON */}

            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background:
                  notice.type === "success" ? "#e6f4e9" : "#fdebea",
                color:
                  notice.type === "success" ? "#278653" : "#d94848",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                margin: "0 auto 22px"
              }}
            >
              {notice.type === "success" ? "✓" : "!"}
            </div>

            {/* POPUP HEADING */}

            <h2
              style={{
                fontSize: "23px",
                color: "#244b38",
                margin: "0 0 12px"
              }}
            >
              {notice.type === "success"
                ? "Appointment Scheduled!"
                : "Scheduling Failed"}
            </h2>

            {/* POPUP MESSAGE */}

            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.7",
                color: "#718078",
                margin: "0 0 22px",
                overflowWrap: "anywhere"
              }}
            >
              {notice.message}
            </p>

            {/* APPOINTMENT DETAILS */}

            {notice.details && (
              <div
                style={{
                  background: "#f5f8f4",
                  borderRadius: "12px",
                  padding: "16px",
                  textAlign: "left"
                }}
              >
                {notice.details.map((item, index) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "15px",
                      padding: "10px 0",
                      borderBottom:
                        index === notice.details.length - 1
                          ? "none"
                          : "1px solid #e3ebe3"
                    }}
                  >
                    <span
                      style={{
                        color: "#718078",
                        fontSize: "13px",
                        flex: "1"
                      }}
                    >
                      {item.label}
                    </span>

                    <strong
                      style={{
                        color: "#244b38",
                        fontSize: "13px",
                        textAlign: "right",
                        flex: "1"
                      }}
                    >
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            {/* OK BUTTON */}

            <button
              onClick={() => setNotice(null)}
              style={{
                width: "100%",
                marginTop: "26px",
                padding: "14px",
                border: "none",
                borderRadius: "10px",
                background:
                  notice.type === "success" ? "#285c40" : "#c94b46",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              OK
            </button>

          </div>
        </div>
      )}

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="loading-line">
          <span />
          Syncing your care workspace…
        </div>
      )}



      {/* DASHBOARD */}

      {
        activeNav === "dashboard" && (
          <Dashboard
            user={user}
            patients={patients}
            treatments={treatments}
            scheduled={scheduled}
            completed={completed}
            alerts={openAlerts}
            onNavigate={setPage}
          />
        )
      }

      {/* PATIENTS */}

      {
        activeNav === "patients" && (
          <Patients
            patients={filteredPatients}
            search={search}
            setSearch={setSearch}
            onAdd={() => setModal("patient")}
          />
        )
      }

      {/* TREATMENT PLANS */}

      {
        activeNav === "treatments" && (
          <Treatments
            treatments={filteredTreatments}
            search={search}
            setSearch={setSearch}
            role={roleKey}

            // Connect New Treatment Plan button
            onAdd={() => setModal("treatment")}

            onSchedule={treatment => {
              setSelectedTreatment(treatment.uuid);

              setScheduleForm({
                therapist_id:
                  treatment.therapist_id || "",

                appointment_start: treatment.appointment_start
                  ? new Date(treatment.appointment_start)
                    .toISOString()
                    .slice(0, 16)
                  : "",

                duration_minutes:
                  treatment.duration_minutes || 60,

                priority: treatment.priority || 2
              });

              setPage("schedule");
            }}
          />
        )
      }

      {/* SCHEDULING */}

      {
        activeNav === "schedule" && (
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
        )
      }

      {/* SESSIONS */}

      {
        activeNav === "sessions" && (
          <Sessions
            treatments={scheduled}
            notes={sessionNotes}
            setNotes={setSessionNotes}
            onUpdate={updateSession}
          />
        )
      }

      {/* PROGRESS */}

      {
        activeNav === "progress" && (
          <Progress
            patients={patients}
            treatments={treatments}
            completed={completed}
          />
        )
      }

      {/* ALERTS */}

      {
        activeNav === "alerts" && (
          <Alerts
            alerts={alerts}
            patients={patients}
            treatments={treatments}
            form={alertForm}
            setForm={setAlertForm}
            onCreate={() => setModal("alert")}
            onUpdate={updateAlert}
          />
        )
      }

      {/* REPORTS */}

      {
        activeNav === "reports" && (
          <Reports
            patients={patients}
            treatments={treatments}
            alerts={alerts}
          />
        )
      }

      {/* NOTIFICATIONS */}

      {
        activeNav === "notifications" && (
          <Notifications
            treatments={treatments}
            alerts={alerts}
            onNavigate={setPage}
          />
        )
      }

      {/* USERS */}

      {
        activeNav === "users" && (
          <Users
            users={users}
            onAdd={() => setModal("user")}
            onDelete={deleteUser}
          />
        )
      }

      {/* FOOTER */}

      <footer className="app-footer">
        <span>✦</span> AyurDhara
        <span>·</span>
        Panchakarma care, organized for better healing

        <span className="footer-right">
          Built for coordinated care
        </span>
      </footer>

      {/* =================================================
          MODALS
      ================================================= */}

      {
        modal && (
          <Modal
            title={
              modal === "patient"
                ? "Add patient"
                : modal === "user"
                  ? "Add team member"
                  : modal === "treatment"
                    ? "Create treatment plan"
                    : "Record emergency alert"
            }
            onClose={() => setModal("")}
          >

            {/* ===============================================
              CREATE TREATMENT PLAN FORM
          =============================================== */}

            {modal === "treatment" && (
              <form
                className="modal-form"
                onSubmit={createTreatmentPlan}
              >
                <label>Patient</label>

                <select
                  value={treatmentForm.patient_id}
                  onChange={event =>
                    setTreatmentForm({
                      ...treatmentForm,
                      patient_id: event.target.value
                    })
                  }
                  required
                >
                  <option value="">
                    Select patient
                  </option>

                  {patients.map(patient => (
                    <option
                      key={patient.patient_id}
                      value={patient.patient_id}
                    >
                      {patient.name} — {patient.email}
                    </option>
                  ))}
                </select>

                <label>Treatment name</label>

                <select
                  value={treatmentForm.treatment_name}
                  onChange={event =>
                    setTreatmentForm({
                      ...treatmentForm,
                      treatment_name: event.target.value
                    })
                  }
                  required
                >
                  <option value="">
                    Select treatment
                  </option>

                  {[
                    "Abhyanga",
                    "Shirodhara",
                    "Swedana",
                    "Basti",
                    "Virechana",
                    "Vamana",
                    "Nasya",
                    "Udvartana",
                    "Pizhichil",
                    "Kizhi"
                  ].map(name => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>

                <label>Required therapist expertise</label>

                <input
                  type="text"
                  value={treatmentForm.treatment_requirements}
                  onChange={event =>
                    setTreatmentForm({
                      ...treatmentForm,
                      treatment_requirements: event.target.value
                    })
                  }
                  placeholder="Example: Abhyanga"
                />

                <label>Duration (minutes)</label>

                <input
                  type="number"
                  min="15"
                  max="480"
                  step="1"
                  value={treatmentForm.duration_minutes}
                  onChange={event =>
                    setTreatmentForm({
                      ...treatmentForm,
                      duration_minutes: event.target.value
                    })
                  }
                  required
                />

                <label>Priority</label>

                <select
                  value={treatmentForm.priority}
                  onChange={event =>
                    setTreatmentForm({
                      ...treatmentForm,
                      priority: event.target.value
                    })
                  }
                >
                  <option value="1">1 — Low</option>
                  <option value="2">2 — Normal</option>
                  <option value="3">3 — Medium</option>
                  <option value="4">4 — High</option>
                  <option value="5">5 — Critical</option>
                </select>

                {/* ADMIN SELECTS RESPONSIBLE DOCTOR */}

                {roleKey === "admin" && (
                  <>
                    <label>Responsible doctor</label>

                    <select
                      value={treatmentForm.doctor_id}
                      onChange={event =>
                        setTreatmentForm({
                          ...treatmentForm,
                          doctor_id: event.target.value
                        })
                      }
                      required
                    >
                      <option value="">
                        Select doctor
                      </option>

                      {doctors.map(doctor => (
                        <option
                          key={doctor.doctor_id}
                          value={doctor.doctor_id}
                        >
                          {doctor.name} — {doctor.email}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {patients.length === 0 && (
                  <p className="form-hint">
                    No patient records found. Create a patient record first.
                  </p>
                )}

                {roleKey === "admin" && doctors.length === 0 && (
                  <p className="form-hint">
                    No doctor profiles found. Register a doctor profile first.
                  </p>
                )}

                <button
                  type="submit"
                  className="primary-btn wide"
                  disabled={
                    busy ||
                    patients.length === 0 ||
                    (roleKey === "admin" && doctors.length === 0)
                  }
                >
                  {busy
                    ? "Creating…"
                    : "Create treatment plan"}
                </button>
              </form>
            )}

            {/* ===============================================
              ADD PATIENT FORM
          =============================================== */}

            {modal === "patient" && (
              <form
                className="modal-form"
                onSubmit={createPatient}
              >
                <label>Full name</label>

                <input
                  value={patientForm.name}
                  onChange={event =>
                    setPatientForm({
                      ...patientForm,
                      name: event.target.value
                    })
                  }
                  required
                />

                <label>Email</label>

                <input
                  type="email"
                  value={patientForm.email}
                  onChange={event =>
                    setPatientForm({
                      ...patientForm,
                      email: event.target.value
                    })
                  }
                  required
                />

                <label>Phone number</label>

                <input
                  value={patientForm.phone_number}
                  onChange={event =>
                    setPatientForm({
                      ...patientForm,
                      phone_number: event.target.value
                    })
                  }
                />

                <label>Temporary password</label>

                <input
                  type="password"
                  minLength="8"
                  value={patientForm.password}
                  onChange={event =>
                    setPatientForm({
                      ...patientForm,
                      password: event.target.value
                    })
                  }
                  required
                />

                <p className="form-hint">
                  A patient account and patient record will be created in your
                  existing database.
                </p>

                <button
                  className="primary-btn wide"
                  disabled={busy}
                >
                  {busy ? "Saving…" : "Create patient"}
                </button>
              </form>
            )}

            {/* ===============================================
              ADD USER FORM
          =============================================== */}

            {modal === "user" && (
              <form
                className="modal-form"
                onSubmit={createUser}
              >
                <label>Full name</label>

                <input
                  value={userForm.name}
                  onChange={event =>
                    setUserForm({
                      ...userForm,
                      name: event.target.value
                    })
                  }
                  required
                />

                <label>Email</label>

                <input
                  type="email"
                  value={userForm.email}
                  onChange={event =>
                    setUserForm({
                      ...userForm,
                      email: event.target.value
                    })
                  }
                  required
                />

                <label>Phone number</label>

                <input
                  value={userForm.phone_number}
                  onChange={event =>
                    setUserForm({
                      ...userForm,
                      phone_number: event.target.value
                    })
                  }
                />

                <label>Temporary password</label>

                <input
                  type="password"
                  minLength="8"
                  value={userForm.password}
                  onChange={event =>
                    setUserForm({
                      ...userForm,
                      password: event.target.value
                    })
                  }
                  required
                />

                <label>Role</label>

                <select
                  value={userForm.role}
                  onChange={event =>
                    setUserForm({
                      ...userForm,
                      role: event.target.value
                    })
                  }
                >
                  <option value="doctor">Doctor</option>
                  <option value="therapist">Therapist</option>
                  <option value="patient">Patient</option>
                  <option value="admin">Admin</option>
                </select>

                <p className="form-hint">
                  Only use this admin tool for trusted team accounts. New
                  doctor/therapist records may need their profile details
                  added separately.
                </p>

                <button
                  className="primary-btn wide"
                  disabled={busy}
                >
                  {busy ? "Saving…" : "Create user"}
                </button>
              </form>
            )}

            {/* ===============================================
              EMERGENCY ALERT FORM
          =============================================== */}

            {modal === "alert" && (
              <form
                className="modal-form"
                onSubmit={createAlert}
              >
                <label>Patient</label>

                <select
                  value={alertForm.patient_id}
                  onChange={event =>
                    setAlertForm({
                      ...alertForm,
                      patient_id: event.target.value
                    })
                  }
                >
                  <option value="">
                    Select patient (optional)
                  </option>

                  {patients.map(patient => (
                    <option
                      key={patient.patient_id}
                      value={patient.patient_id}
                    >
                      {patient.name}
                    </option>
                  ))}
                </select>

                <label>Related treatment (optional)</label>

                <select
                  value={alertForm.treatment_uuid}
                  onChange={event =>
                    setAlertForm({
                      ...alertForm,
                      treatment_uuid: event.target.value
                    })
                  }
                >
                  <option value="">
                    No treatment selected
                  </option>

                  {treatments.map(treatment => (
                    <option
                      key={treatment.uuid}
                      value={treatment.uuid}
                    >
                      {treatment.patient_name ||
                        shortId(treatment.patient_id)}
                      {" · "}
                      {shortId(treatment.uuid)}
                    </option>
                  ))}
                </select>

                <label>Severity</label>

                <select
                  value={alertForm.severity}
                  onChange={event =>
                    setAlertForm({
                      ...alertForm,
                      severity: event.target.value
                    })
                  }
                >
                  <option>High</option>
                  <option>Critical</option>
                  <option>Medium</option>
                </select>

                <label>Symptoms / observations</label>

                <textarea
                  rows="4"
                  value={alertForm.symptoms}
                  onChange={event =>
                    setAlertForm({
                      ...alertForm,
                      symptoms: event.target.value
                    })
                  }
                  required
                  placeholder="Describe the reported symptoms…"
                />

                <button
                  className="primary-btn wide"
                  disabled={busy}
                >
                  {busy
                    ? "Saving…"
                    : "Save emergency alert"}
                </button>
              </form>
            )}
          </Modal>
        )
      }
    </DashboardLayout >
  );
}

export default App;