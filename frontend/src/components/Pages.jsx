import React from "react";
import { fmtDate, fmtTime, shortId } from "../utils";

export function PageHeading({ action }) {
  if (!action) return null;

  return (
    <div className="page-heading page-heading-actions-only">
      {action}
    </div>
  );
}

export function Dashboard({
  user,
  patients,
  treatments,
  scheduled,
  completed,
  alerts,
  onNavigate
}) {
  const role = String(user?.role || "").toLowerCase();
  const pending = scheduled.filter(t =>
    !["Completed", "Missed"].includes(t.session_status || "Scheduled")
  );

  const today = new Date().toDateString();
  const todays = scheduled.filter(
    t => new Date(t.appointment_start).toDateString() === today
  );

  const isPatient = role === "patient";
  const isTherapist = role === "therapist";
  const isDoctor = role === "doctor" || role === "practitioner";

  const title = isDoctor
    ? "Practitioner Dashboard"
    : isTherapist
      ? "Therapist Dashboard"
      : isPatient
        ? "Patient Dashboard"
        : "Admin Dashboard";

  const metrics = isPatient ? [
    {
      label: "My treatment plans",
      value: treatments.length,
      detail: "Your recorded care plans",
      icon: "♧",
      tone: "mint"
    },
    {
      label: "Upcoming sessions",
      value: scheduled.filter(
        t => new Date(t.appointment_start) >= new Date()
      ).length,
      detail: "Appointments with a time",
      icon: "◷",
      tone: "blue"
    },
    {
      label: "Completed sessions",
      value: completed.length,
      detail: "Sessions recorded as complete",
      icon: "✓",
      tone: "gold"
    },
    {
      label: "Care progress",
      value: `${scheduled.length
        ? Math.round(completed.length / scheduled.length * 100)
        : 0}%`,
      detail: "Based on completed sessions",
      icon: "↗",
      tone: "rose"
    }
  ] : isTherapist ? [
    {
      label: "Treatment Plans",
      value: treatments.length,
      detail: "Treatments assigned to you",
      icon: "♧",
      tone: "mint"
    },
    {
      label: "Today's sessions",
      value: todays.length,
      detail: "Scheduled for today",
      icon: "◷",
      tone: "blue"
    },
    {
      label: "Completed sessions",
      value: completed.length,
      detail: "Sessions recorded as complete",
      icon: "✓",
      tone: "gold"
    },
    {
      label: "Open alerts",
      value: alerts.length,
      detail: "Require care-team review",
      icon: "⚑",
      tone: "rose"
    }
  ] : isDoctor ? [
    {
      label: "Total patients",
      value: patients.length,
      detail: "Patients under centre care",
      icon: "♧",
      tone: "mint"
    },
    {
      label: "Treatment plans",
      value: treatments.length,
      detail: "Recorded treatment plans",
      icon: "✳",
      tone: "blue"
    },
    {
      label: "Upcoming sessions",
      value: pending.length,
      detail: "Sessions awaiting completion",
      icon: "◷",
      tone: "gold"
    },
    {
      label: "Open alerts",
      value: alerts.length,
      detail: "Require clinical review",
      icon: "⚑",
      tone: "rose"
    }
  ] : [
    {
      label: "Total patients",
      value: patients.length,
      detail: "Registered in the system",
      icon: "♧",
      tone: "mint"
    },
    {
      label: "Treatment records",
      value: treatments.length,
      detail: "Recorded in the system",
      icon: "✳",
      tone: "blue"
    },
    {
      label: "Scheduled sessions",
      value: scheduled.length,
      detail: "Appointments with a time",
      icon: "◷",
      tone: "gold"
    },
    {
      label: "Open alerts",
      value: alerts.length,
      detail: "Require team review",
      icon: "⚑",
      tone: "rose"
    }
  ];

  const actions = isPatient ? [
    {
      page: "treatments",
      icon: "✳",
      title: "My treatment plans",
      subtitle: "Review prescribed care"
    },
    {
      page: "sessions",
      icon: "◷",
      title: "My sessions",
      subtitle: "Check session status"
    },
    {
      page: "progress",
      icon: "↗",
      title: "My progress",
      subtitle: "View completed sessions"
    }
  ] : isTherapist ? [
    {
      page: "treatments",
      icon: "✳",
      title: "Treatment Plans",
      subtitle: "Review your assignments"
    },
    {
      page: "sessions",
      icon: "▦",
      title: "My schedule",
      subtitle: "Check assigned appointment times"
    },
    {
      page: "sessions",
      icon: "◷",
      title: "Update sessions",
      subtitle: "Record session status"
    }
  ] : isDoctor ? [
    {
      page: "patients",
      icon: "♧",
      title: "Review patients",
      subtitle: "Open patient records"
    },
    {
      page: "treatments",
      icon: "✳",
      title: "Treatment plans",
      subtitle: "Review prescribed care"
    },
    {
      page: "reports",
      icon: "▤",
      title: "Care reports",
      subtitle: "Review treatment outcomes"
    }
  ] : [
    {
      page: "patients",
      icon: "♧",
      title: "View patients",
      subtitle: "Patient records"
    },
    {
      page: "schedule",
      icon: "▦",
      title: "Manage schedule",
      subtitle: "Review appointments"
    },
    {
      page: "reports",
      icon: "▤",
      title: "Centre reports",
      subtitle: "Review system activity"
    }
  ];

  return (
    <>
      <section className="patient-metrics">
        {metrics.map(m => {
          const tone = m.tone === "mint" ? "green" : m.tone;

          return (
            <article
              className={`patient-metric ${tone}`}
              key={m.label}
            >
              <div className="patient-metric-icon">{m.icon}</div>

              <div className="patient-metric-copy">
                <span>{m.label}</span>
                <b>{m.value}</b>
                <small>{m.detail}</small>
              </div>

              <div className="patient-metric-leaf" aria-hidden="true">
                ✧
              </div>
            </article>
          );
        })}
      </section>

      <section className="patient-middle-grid">
        <article className="patient-card patient-upcoming-card">
          <div className="patient-card-heading">
            <div className="patient-card-title">
              <div className="patient-card-icon">◷</div>

              <div>
                <h2>
                  {isPatient
                    ? "My upcoming sessions"
                    : isTherapist
                      ? "My assigned schedule"
                      : isDoctor
                        ? "Upcoming patient sessions"
                        : "Upcoming care schedule"}
                </h2>

                <p>
                  {isPatient
                    ? "Your appointment details"
                    : isTherapist
                      ? "Treatments assigned to you"
                      : isDoctor
                        ? "Sessions requiring clinical oversight"
                        : "Appointments from treatment records"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigate(
                  isPatient || isTherapist
                    ? "sessions"
                    : isDoctor
                      ? "patients"
                      : "schedule"
                )
              }
            >
              {isPatient
                ? "View sessions"
                : isTherapist
                  ? "View schedule"
                  : isDoctor
                    ? "View patients"
                    : "Manage schedule"} →
            </button>
          </div>

          {scheduled.length === 0 ? (
            <div className="patient-empty-state">
              <div className="patient-empty-icon" aria-hidden="true">
                ◷
              </div>

              <b>
                {isPatient
                  ? "No sessions scheduled yet"
                  : "No scheduled treatments yet"}
              </b>

              <p>
                Scheduled appointments will appear here when they are available.
              </p>
            </div>
          ) : (
            <div className="patient-session-list">
              {scheduled.slice(0, 6).map(t => {
                const date = t.appointment_start
                  ? new Date(t.appointment_start)
                  : null;

                const validDate =
                  date && !Number.isNaN(date.getTime());

                const personName = isPatient
                  ? (t.therapist_name || "Care team")
                  : isTherapist
                    ? (t.patient_name || "Patient")
                    : `${t.patient_name || "Patient"} · ${t.therapist_name || "Therapist not assigned"
                    }`;

                return (
                  <div
                    className="patient-session-row"
                    key={t.session_id || t.uuid}
                  >
                    <div className="patient-date-chip">
                      <b>
                        {validDate
                          ? date.toLocaleDateString("en-IN", {
                            day: "2-digit"
                          })
                          : "—"}
                      </b>

                      <span>
                        {validDate
                          ? date.toLocaleDateString("en-IN", {
                            month: "short"
                          })
                          : "TBD"}
                      </span>
                    </div>

                    <div className="patient-session-name">
                      <b>{t.p1 || "Panchakarma session"}</b>
                      <span>{personName}</span>
                    </div>

                    <div className="patient-session-time">
                      <span>{fmtDate(t.appointment_start)}</span>
                      <span>{fmtTime(t.appointment_start)}</span>
                    </div>

                    <Status value={t.session_status || "Scheduled"} />
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="patient-card patient-progress-card">
          <div className="patient-card-heading">
            <div className="patient-card-title">
              <div className="patient-card-icon">✧</div>

              <div>
                <h2>
                  {isPatient
                    ? "My care progress"
                    : isDoctor
                      ? "Treatment outcomes"
                      : "Session progress"}
                </h2>

                <p>Recorded session outcomes</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigate(
                  isPatient
                    ? "progress"
                    : isDoctor
                      ? "reports"
                      : "sessions"
                )
              }
            >
              View details →
            </button>
          </div>

          <div className="patient-progress-content">
            <div
              className="patient-donut"
              style={{
                "--progress": `${scheduled.length
                  ? Math.round(
                    completed.length / scheduled.length * 100
                  )
                  : 0
                  }%`
              }}
            >
              <div>
                <b>
                  {scheduled.length
                    ? Math.round(
                      completed.length / scheduled.length * 100
                    )
                    : 0}%
                </b>

                <span>Completed</span>
              </div>
            </div>

            <div className="patient-progress-legend">
              <p>
                <i className="green-dot" />
                Completed <b>{completed.length}</b>
              </p>

              <p>
                <i className="blue-dot" />
                Scheduled / ongoing <b>{pending.length}</b>
              </p>

              {!isPatient && (
                <p>
                  <i className="gray-dot" />
                  Open alerts <b>{alerts.length}</b>
                </p>
              )}
            </div>
          </div>

          <div className="patient-progress-note">
            <span aria-hidden="true">✦</span>

            <p>
              {isPatient
                ? "Your progress updates as your care team records completed sessions."
                : isDoctor
                  ? "Review session completion and patient care outcomes."
                  : "Progress reflects the session status recorded by your care team."}
            </p>
          </div>
        </article>
      </section>

      <section className="patient-quick-actions patient-card">
        <div className="patient-quick-intro">
          <div className="patient-card-icon">✧</div>

          <div>
            <h2>Quick Actions</h2>

            <p>
              {isPatient
                ? "Frequently used features for your care"
                : isTherapist
                  ? "Frequently used tools for your daily work"
                  : isDoctor
                    ? "Clinical tools for reviewing and coordinating patient care"
                    : "Quick access to centre management tasks"}
            </p>
          </div>
        </div>

        {actions.slice(0, 3).map((action, index) => {
          const tones = ["green", "blue", "gold"];

          return (
            <button
              className={`patient-quick-action ${tones[index]}`}
              key={`${action.page}-${action.title}`}
              onClick={() => onNavigate(action.page)}
            >
              <span>{action.icon}</span>
              <span>{action.title}</span>
              <span aria-hidden="true">→</span>
            </button>
          );
        })}
      </section>
    </>
  );
}

export function Status({ value }) {
  const status = (value || "Scheduled").toLowerCase();

  const cls =
    status === "completed"
      ? "success"
      : status === "ongoing"
        ? "info"
        : status === "missed" || status === "interrupted"
          ? "danger"
          : status === "open" || status === "critical"
            ? "danger"
            : "warning";

  return (
    <span className={`status ${cls}`}>
      {value || "Scheduled"}
    </span>
  );
}

export function Empty({
  icon = "✦",
  title,
  text
}) {
  return (
    <div className="empty-state">
      <div>{icon}</div>
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder = "Search records…"
}) {
  return (
    <div className="search-box">
      <span>⌕</span>

      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />

      {value && (
        <button onClick={() => onChange("")}>
          ×
        </button>
      )}
    </div>
  );
}

export function Patients({
  patients,
  search,
  setSearch,
  onAdd,
  onSelect
}) {
  return (
    <>
      <PageHeading
        eyebrow="CARE DIRECTORY"
        title="Patients"
        description="View and manage registered patient accounts."
      />

      <div className="toolbar page-toolbar">
        <div className="toolbar-left">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search by patient name, email or ID…"
          />

          <span className="results-count">
            {patients.length} patient{patients.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="toolbar-actions">
          <button className="primary-btn" onClick={onAdd}>
            ＋ Add patient
          </button>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Patient ID</th>
                <th>Email</th>
                <th>Record status</th>
              </tr>
            </thead>

            <tbody>
              {patients.map(p => (
                <tr
                  key={p.patient_id}
                  className="clickable-patient-row"
                  onClick={() => onSelect?.(p)}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter") onSelect?.(p);
                  }}
                >
                  <td>
                    <div className="person-cell">
                      <div className="table-avatar">
                        {(p.name || "P").slice(0, 1)}
                      </div>
                      <b>{p.name}</b>
                    </div>
                  </td>

                  <td>
                    <span className="id-text">
                      {shortId(p.patient_id)}
                    </span>
                  </td>

                  <td>{p.email || "—"}</td>

                  <td>
                    <span className="profile-open-label">
                      View profile →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {patients.length === 0 && (
          <Empty
            icon="♧"
            title="No patients found"
            text="Try a different search or add a patient account."
          />
        )}
      </div>
    </>
  );
}

export function PatientProfile({
  patient,
  onBack,
  onUploadPhoto,
  loading = false
}) {
  if (loading) {
    return (
      <div className="panel patient-profile-panel">
        <Empty
          icon="♙"
          title="Loading patient profile"
          text="Fetching registered details…"
        />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="panel patient-profile-panel">
        <Empty
          icon="♙"
          title="Profile unavailable"
          text="The patient profile could not be loaded."
        />

        <button className="outline-btn" onClick={onBack}>
          ← Back
        </button>
      </div>
    );
  }

  const fields = [
    ["Full name", patient.name],
    ["Email address", patient.email],
    ["Phone number", patient.phone_number],
    [
      "Height",
      patient.height != null
        ? `${patient.height} cm`
        : "Not provided"
    ],
    [
      "Weight",
      patient.weight != null
        ? `${patient.weight} kg`
        : "Not provided"
    ],
    ["Blood group", patient.blood_group],
    ["Address", patient.address],
    ["Patient ID", patient.patient_id],
    [
      "Registered on",
      patient.created_at ? fmtDate(patient.created_at) : "—"
    ]
  ];

  return (
    <>
      <PageHeading
        eyebrow="PATIENT RECORD"
        title="Patient profile"
        description="Registered information and patient photograph."
        action={
          <button className="outline-btn" onClick={onBack}>
            ← Back
          </button>
        }
      />

      <section className="panel patient-profile-panel">
        <div className="patient-profile-hero">
          {patient.profile_photo ? (
            <img
              className="patient-profile-photo"
              src={patient.profile_photo}
              alt={`${patient.name || "Patient"} profile`}
            />
          ) : (
            <div className="patient-profile-photo patient-profile-placeholder">
              {(patient.name || "P").slice(0, 1).toUpperCase()}
            </div>
          )}

          <div>
            <span className="eyebrow">AYURDHARA PATIENT</span>
            <h2>{patient.name || "Patient"}</h2>
            <p>{patient.email || "Email not provided"}</p>

            <span className="status success">Registered</span>

            <div className="profile-photo-control">
              <label
                className="outline-btn"
                htmlFor="patient-profile-photo-upload"
              >
                {patient.profile_photo ? "Change photo" : "Add photo"}
              </label>

              <input
                id="patient-profile-photo-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={e => {
                  const file = e.target.files?.[0];

                  if (file) onUploadPhoto?.(file);

                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>

        <div className="patient-profile-grid">
          {fields.map(([label, value]) => (
            <div className="patient-profile-field" key={label}>
              <span>{label}</span>
              <b>{value || "Not provided"}</b>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function Treatments({
  treatments,
  search,
  setSearch,
  onSchedule,
  onAdd,
  role = "doctor"
}) {
  const title =
    role === "patient"
      ? "My treatment plans"
      : role === "therapist"
        ? "Treatment Plans"
        : "Treatment plans";

  const description =
    role === "patient"
      ? "Review the Panchakarma treatments prescribed for you."
      : role === "therapist"
        ? "Review the treatments assigned to you by the care team."
        : "Review treatment records and schedule or reschedule their sessions.";

  return (
    <>
      <PageHeading
        eyebrow="CARE PLANNING"
        title={title}
        description={description}
      />

      <div className="toolbar page-toolbar">
        <div className="toolbar-left">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search patient or treatment…"
          />

          <span className="results-count">
            {treatments.length} treatment records
          </span>
        </div>

        <div className="toolbar-actions">
          {["doctor", "admin"].includes(role) && (
            <button className="primary-btn" onClick={onAdd}>
              ＋ New treatment plan
            </button>
          )}

          <button
            className="outline-btn"
            onClick={() => window.print()}
          >
            ⤓ Print list
          </button>
        </div>
      </div>

      <div className="treatment-grid">
        {treatments.map(t => (
          <div className="panel treatment-card" key={t.uuid}>
            <div className="treatment-card-top">
              <div className="treatment-icon">✳</div>
              <Status value={t.session_status || "Scheduled"} />
            </div>

            <h3>
              {t.treatment_name || t.p1 || "Panchakarma treatment"}
            </h3>

            <p className="treatment-patient">
              {t.patient_name || "Patient record"}
              <span> · </span>
              {t.patient_id ? shortId(t.patient_id) : ""}
            </p>

            <div className="treatment-detail-grid">
              <div>
                <small>Duration</small>
                <b>
                  {t.duration_minutes
                    ? `${t.duration_minutes} min`
                    : "Not set"}
                </b>
              </div>

              <div>
                <small>Priority</small>
                <b>{t.priority || "—"} / 5</b>
              </div>

              <div>
                <small>Appointment</small>
                <b>{fmtDate(t.appointment_start)}</b>
              </div>

              <div>
                <small>Therapist</small>
                <b>{t.therapist_name || "Unassigned"}</b>
              </div>
            </div>

            <div className="procedure-tags">
              {[t.p2, t.p3, t.p4, t.p5]
                .filter(Boolean)
                .map((p, i) => (
                  <span key={i}>{p}</span>
                ))}
            </div>

            {t.treatment_requirements && (
              <p className="muted treatment-requirements">
                Expertise: {t.treatment_requirements}
              </p>
            )}

            {["doctor", "admin"].includes(role) && (
              <button
                className="outline-btn wide"
                onClick={() => onSchedule(t)}
              >
                ↻ Schedule / reschedule
              </button>
            )}
          </div>
        ))}
      </div>

      {treatments.length === 0 && (
        <div className="panel">
          <Empty
            icon="✳"
            title="No treatment records"
            text="Treatment records from PostgreSQL will appear here when available."
          />
        </div>
      )}
    </>
  );
}

export function Sessions({
  treatments = [],
  notes,
  setNotes,
  outcomes = {},
  setOutcomes,
  statuses = {},
  setStatuses,
  onUpdate,
  readOnly = false,
  role = "doctor"
}) {
  const title = readOnly
    ? "My sessions"
    : role === "therapist"
      ? "Assigned sessions"
      : "Session management";

  const description = readOnly
    ? "View each appointment and its recorded status, notes, and outcome."
    : "Maintain a separate history for every appointment, including status, observations, and outcome.";

  return (
    <>
      <PageHeading
        eyebrow="SESSION DELIVERY"
        title={title}
        description={description}
      />

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Session / procedure</th>
                <th>Patient</th>
                <th>When</th>
                <th>Therapist</th>
                <th>Status</th>
                <th>Observation notes</th>
                <th>Outcome</th>
                <th>Update</th>
              </tr>
            </thead>

            <tbody>
              {treatments.map((t, index) => (
                <tr key={t.session_id ?? t.uuid ?? `${t.treatment_uuid}-${index}`}>
                  <td>
                    <b>
                      {t.treatment_name || t.p1 || "Panchakarma session"}
                    </b>

                    <small className="cell-sub">
                      Session #{t.session_id}
                    </small>

                    <small className="cell-sub">
                      Plan {shortId(t.treatment_uuid)}
                    </small>
                  </td>

                  <td>{t.patient_name || "—"}</td>

                  <td>
                    {fmtDate(t.appointment_start)}

                    <small className="cell-sub">
                      {fmtTime(t.appointment_start)} · {t.duration_minutes || 60} min
                    </small>
                  </td>

                  <td>{t.therapist_name || "—"}</td>

                  <td>
                    {readOnly ? (
                      <Status value={t.session_status || "Scheduled"} />
                    ) : (
                      <select
                        className="inline-select"
                        value={
                          statuses[t.session_id] ||
                          t.session_status ||
                          "Scheduled"
                        }
                        onChange={e =>
                          setStatuses({
                            ...statuses,
                            [t.session_id]: e.target.value
                          })
                        }
                      >
                        <option>Scheduled</option>
                        <option>Ongoing</option>
                        <option>Completed</option>
                        <option>Missed</option>
                        <option>Interrupted</option>
                      </select>
                    )}
                  </td>

                  <td>
                    {readOnly
                      ? (t.session_notes || "—")
                      : (
                        <input
                          className="notes-input"
                          value={
                            notes[t.session_id] ??
                            t.session_notes ??
                            ""
                          }
                          onChange={e =>
                            setNotes({
                              ...notes,
                              [t.session_id]: e.target.value
                            })
                          }
                          placeholder="Add observation…"
                        />
                      )}
                  </td>

                  <td>
                    {readOnly
                      ? (t.outcome || "—")
                      : (
                        <input
                          className="notes-input"
                          value={
                            outcomes[t.session_id] ??
                            t.outcome ??
                            ""
                          }
                          onChange={e =>
                            setOutcomes({
                              ...outcomes,
                              [t.session_id]: e.target.value
                            })
                          }
                          placeholder="Record outcome…"
                        />
                      )}
                  </td>

                  <td>
                    {readOnly
                      ? "View only"
                      : (
                        <button
                          className="small-btn"
                          onClick={() =>
                            onUpdate(
                              t,
                              statuses[t.session_id] ||
                              t.session_status ||
                              "Scheduled"
                            )
                          }
                        >
                          Save
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {treatments.length === 0 && (
          <Empty
            icon="◷"
            title="No session history yet"
            text="Each scheduled appointment will appear here as its own session record."
          />
        )}
      </div>
    </>
  );
}

export function Progress({
  patients,
  sessions = [],
  completed = []
}) {
  const pct = sessions.length
    ? Math.round(completed.length / sessions.length * 100)
    : 0;

  const statusCounts = [
    "Scheduled",
    "Ongoing",
    "Completed",
    "Missed",
    "Interrupted"
  ].map(status => ({
    status,
    count: sessions.filter(
      s => (s.session_status || "Scheduled") === status
    ).length
  }));

  return (
    <>
      <PageHeading
        eyebrow="OUTCOME MONITORING"
        title="Progress tracking"
        description="Track completed appointments and review each patient's session history."
      />

      <div className="toolbar page-toolbar page-toolbar-actions-only">
        <div className="toolbar-actions">
          <button
            className="outline-btn"
            onClick={() => window.print()}
          >
            ⤓ Print summary
          </button>
        </div>
      </div>

      <div className="progress-top-grid">
        <div className="panel completion-panel">
          <div className="eyebrow">SESSION COMPLETION</div>

          <div className="completion-content">
            <div
              className="big-progress-circle"
              style={{ "--progress": `${pct}%` }}
            >
              <div>
                <b>{pct}%</b>
                <small>completed</small>
              </div>
            </div>

            <div className="completion-stats">
              <div>
                <span>Patients</span>
                <b>{patients.length}</b>
              </div>

              <div>
                <span>Session records</span>
                <b>{sessions.length}</b>
              </div>

              <div>
                <span>Completed</span>
                <b>{completed.length}</b>
              </div>
            </div>
          </div>
        </div>

        <div className="panel status-breakdown">
          <h2>Session status</h2>

          {statusCounts.map(s => (
            <div className="bar-row" key={s.status}>
              <div>
                <span>{s.status}</span>
                <b>{s.count}</b>
              </div>

              <div className="bar-track">
                <span
                  style={{
                    width: `${sessions.length
                      ? s.count / sessions.length * 100
                      : 0
                      }%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel table-panel">
        <div className="panel-header">
          <div>
            <h2>Patient treatment progress</h2>
            <p>
              Progress is calculated from individual session records,
              not treatment-plan count.
            </p>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Session records</th>
                <th>Completed</th>
                <th>In progress / scheduled</th>
                <th>Progress</th>
              </tr>
            </thead>

            <tbody>
              {patients.map(p => {
                const pt = sessions.filter(
                  s => String(s.patient_id) === String(p.patient_id)
                );

                const done = pt.filter(
                  s => s.session_status === "Completed"
                ).length;

                const progress = pt.length
                  ? Math.round(done / pt.length * 100)
                  : 0;

                return (
                  <tr key={p.patient_id}>
                    <td>
                      <div className="person-cell">
                        <div className="table-avatar">
                          {(p.name || "P").slice(0, 1)}
                        </div>

                        <b>{p.name}</b>
                      </div>
                    </td>

                    <td>{pt.length}</td>
                    <td>{done}</td>
                    <td>{pt.length - done}</td>

                    <td>
                      <div className="mini-progress">
                        <span style={{ width: `${progress}%` }} />
                      </div>

                      <small>{progress}%</small>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function Alerts({
  alerts,
  patients,
  treatments,
  onCreate,
  onUpdate
}) {
  return (
    <>
      <PageHeading
        eyebrow="PATIENT SAFETY"
        title="Emergency alerts"
        description="Record incidents and follow their status through resolution."
      />

      <div className="toolbar page-toolbar page-toolbar-actions-only">
        <div className="toolbar-actions">
          <button className="danger-btn" onClick={onCreate}>
            ＋ Record alert
          </button>
        </div>
      </div>

      <div className="alert-summary">
        <div className="panel alert-summary-card">
          <span className="alert-icon">⚑</span>
          <div>
            <small>Open / acknowledged</small>
            <b>
              {alerts.filter(a => a.status !== "Resolved").length}
            </b>
          </div>
        </div>

        <div className="panel alert-summary-card">
          <span className="alert-icon amber">◷</span>
          <div>
            <small>Critical / high severity</small>
            <b>
              {
                alerts.filter(
                  a =>
                    ["High", "Critical"].includes(a.severity) &&
                    a.status !== "Resolved"
                ).length
              }
            </b>
          </div>
        </div>

        <div className="panel alert-summary-card">
          <span className="alert-icon green">✓</span>
          <div>
            <small>Resolved incidents</small>
            <b>
              {alerts.filter(a => a.status === "Resolved").length}
            </b>
          </div>
        </div>
      </div>

      <div className="alerts-list">
        {alerts.map(a => (
          <div className="panel alert-card" key={a.id}>
            <div className="alert-card-mark">⚑</div>

            <div className="alert-card-content">
              <div className="alert-card-title">
                <div>
                  <span
                    className={`severity ${String(a.severity).toLowerCase()}`}
                  >
                    {a.severity} priority
                  </span>

                  <h3>
                    {a.patient_name || "Unlinked patient alert"}
                  </h3>
                </div>

                <Status value={a.status} />
              </div>

              <p>{a.symptoms}</p>

              <div className="alert-meta">
                <span>
                  Reported {fmtDate(a.created_at)} · {fmtTime(a.created_at)}
                </span>

                <span>
                  By {a.reporter_name || "Care team"}
                </span>
              </div>
            </div>

            <div className="alert-actions">
              {a.status === "Open" && (
                <button
                  className="outline-btn"
                  onClick={() => onUpdate(a, "Acknowledged")}
                >
                  Acknowledge
                </button>
              )}

              {a.status !== "Resolved" && (
                <button
                  className="primary-btn"
                  onClick={() => onUpdate(a, "Resolved")}
                >
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="panel">
          <Empty
            icon="✓"
            title="No emergency alerts"
            text="New incidents recorded by the care team will appear here."
          />
        </div>
      )}
    </>
  );
}

export function Reports({
  patients,
  treatments,
  alerts
}) {
  const exportCsv = () => {
    const rows = [
      [
        "Patient",
        "Treatment",
        "Therapist",
        "Appointment",
        "Duration minutes",
        "Priority",
        "Status"
      ],
      ...treatments.map(t => [
        t.patient_name || "",
        t.p1 || "",
        t.therapist_name || "",
        t.appointment_start || "",
        t.duration_minutes || "",
        t.priority || "",
        t.session_status || "Scheduled"
      ])
    ];

    const csv = rows
      .map(r =>
        r.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")
      )
      .join("\r\n");

    const a = document.createElement("a");

    a.href = URL.createObjectURL(
      new Blob([csv], {
        type: "text/csv;charset=utf-8;"
      })
    );

    a.download = "ayurdhara-treatment-report.csv";
    a.click();

    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageHeading
        eyebrow="CARE INSIGHTS"
        title="Reports"
        description="Export the current treatment schedule and review summary indicators."
      />

      <div className="toolbar page-toolbar page-toolbar-actions-only">
        <div className="toolbar-actions">
          <button className="primary-btn" onClick={exportCsv}>
            ↓ Export CSV
          </button>
        </div>
      </div>

      <div className="metrics-grid report-metrics">
        <div className="metric-card">
          <div className="metric-icon mint">♧</div>
          <div className="metric-label">Patients</div>
          <div className="metric-value">{patients.length}</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon blue">▦</div>
          <div className="metric-label">Treatment records</div>
          <div className="metric-value">{treatments.length}</div>
        </div>

        <div className="metric-card">
          <div className="metric-icon gold">✓</div>
          <div className="metric-label">Completed sessions</div>
          <div className="metric-value">
            {treatments.filter(
              t => t.session_status === "Completed"
            ).length}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon rose">⚑</div>
          <div className="metric-label">Emergency alerts</div>
          <div className="metric-value">{alerts.length}</div>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="panel-header">
          <div>
            <h2>Treatment report preview</h2>
            <p>
              Export includes only records currently returned by the backend.
            </p>
          </div>

          <button className="link-button" onClick={exportCsv}>
            Download CSV →
          </button>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Treatment</th>
                <th>Therapist</th>
                <th>Appointment</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {treatments.map(t => (
                <tr key={t.uuid}>
                  <td>{t.patient_name || "—"}</td>
                  <td>{t.p1 || "Treatment"}</td>
                  <td>{t.therapist_name || "—"}</td>
                  <td>
                    {fmtDate(t.appointment_start)}{" "}
                    {fmtTime(t.appointment_start)}
                  </td>
                  <td>
                    <Status value={t.session_status || "Scheduled"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function Notifications({
  treatments = [],
  alerts = [],
  onNavigate,
  role = "doctor"
}) {
  const userRole = String(role || "").toLowerCase();

  const alertItems = alerts.map(a => ({
    id: `a${a.id}`,
    kind: "Emergency alert",
    tone: "rose",
    icon: "⚑",
    title: `${a.patient_name || "Patient"} · ${a.severity} alert`,
    detail: a.symptoms,
    date: a.created_at,
    action: "alerts"
  }));

  let treatmentItems = [];
  if (userRole === "therapist") {
    // Therapists see pending treatments that need scheduling + confirmed appointments
    treatmentItems = treatments.map((t) => {
      const isAwaiting = !t.appointment_start || t.session_status === "Awaiting Therapist Scheduling";
      return {
        id: `t${t.uuid}`,
        kind: isAwaiting ? "Action Required" : "Scheduled session",
        tone: isAwaiting ? "amber" : "blue",
        icon: isAwaiting ? "⚡" : "◷",
        title: isAwaiting
          ? `New Assignment · ${t.treatment_name || t.p1 || "Panchakarma"} (Priority ${t.priority || 3}/5)`
          : `Confirmed Session · ${t.patient_name || "Patient"} · ${t.treatment_name || t.p1}`,
        detail: isAwaiting
          ? `Patient: ${t.patient_name || "Patient"} · ${t.duration_minutes || 60} min · Needs your appointment confirmation`
          : `${fmtDate(t.appointment_start)} at ${fmtTime(t.appointment_start)} · ${t.duration_minutes || 60} min`,
        date: t.appointment_start || new Date().toISOString(),
        action: "treatments"
      };
    });
  } else if (userRole === "patient") {
    // Patients ONLY see confirmed appointments (never unconfirmed/awaiting scheduling)
    treatmentItems = treatments
      .filter((t) => t.appointment_start && t.session_status !== "Awaiting Therapist Scheduling")
      .map((t) => ({
        id: `t${t.uuid}`,
        kind: "Confirmed Appointment",
        tone: "mint",
        icon: "✓",
        title: `Appointment Confirmed · ${t.treatment_name || t.p1 || "Panchakarma"}`,
        detail: `${fmtDate(t.appointment_start)} at ${fmtTime(t.appointment_start)} · Therapist: ${t.therapist_name || "Assigned"} (${t.duration_minutes || 60} min)`,
        date: t.appointment_start,
        action: "sessions"
      }));
  } else {
    // Doctor or Admin
    treatmentItems = treatments.map((t) => {
      const isAwaiting = !t.appointment_start || t.session_status === "Awaiting Therapist Scheduling";
      return {
        id: `t${t.uuid}`,
        kind: isAwaiting ? "Awaiting Therapist Schedule" : "Confirmed Appointment",
        tone: isAwaiting ? "amber" : "blue",
        icon: isAwaiting ? "◷" : "✓",
        title: `${t.patient_name || "Patient"} · ${t.treatment_name || t.p1}`,
        detail: isAwaiting
          ? `Assigned to ${t.therapist_name || "Therapist"} · Awaiting therapist scheduling`
          : `${fmtDate(t.appointment_start)} at ${fmtTime(t.appointment_start)} · Therapist: ${t.therapist_name || "Assigned"}`,
        date: t.appointment_start || new Date().toISOString(),
        action: "treatments"
      };
    });
  }

  const items = [...alertItems, ...treatmentItems].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <>
      <PageHeading
        eyebrow="CARE TEAM UPDATES"
        title="Notifications"
        description="Recent appointment and incident updates generated from your records."
      />

      <div className="panel notifications-list">
        {items.map(item => (
          <button
            className="notification-row"
            key={item.id}
            onClick={() => onNavigate(item.action)}
          >
            <div className={`notification-icon ${item.tone || "blue"}`}>
              {item.icon || "◷"}
            </div>

            <div className="notification-body">
              <b>{item.title}</b>
              <p>{item.detail}</p>
              <small>
                {fmtDate(item.date)} · {fmtTime(item.date)}
              </small>
            </div>

            <span className="notification-type">
              {item.kind}
            </span>

            <span className="notification-arrow">→</span>
          </button>
        ))}

        {items.length === 0 && (
          <Empty
            icon="♧"
            title="You're all caught up"
            text="Appointment and emergency updates will appear here."
          />
        )}
      </div>
    </>
  );
}

export function Doctors({
  doctors = [],
  onSelect
}) {
  return (
    <div>
      <h2>Doctors</h2>
      <p>View registered doctor profiles.</p>

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Degree</th>
                <th>Specialization</th>
                <th>License</th>
                <th>Status</th>
                <th>Profile</th>
              </tr>
            </thead>

            <tbody>
              {doctors.map(doctor => (
                <tr key={doctor.doctor_id}>
                  <td>
                    <div className="person-cell">
                      {doctor.profile_photo ? (
                        <img
                          className="table-avatar"
                          src={doctor.profile_photo}
                          alt={doctor.name || "Doctor"}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="table-avatar">
                          {(doctor.name || "D").slice(0, 1).toUpperCase()}
                        </div>
                      )}

                      <b>{doctor.name || "Doctor"}</b>
                    </div>
                  </td>

                  <td>{doctor.email || "—"}</td>
                  <td>{doctor.phone_number || "—"}</td>
                  <td>{doctor.degree || "—"}</td>
                  <td>{doctor.specialization || "—"}</td>
                  <td>{doctor.license_number || "—"}</td>
                  <td>{doctor.approval_status || "—"}</td>

                  <td>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => onSelect?.(doctor)}
                    >
                      View profile →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {doctors.length === 0 && <p>No doctors found.</p>}
      </div>
    </div>
  );
}

export function Therapists({
  therapists = [],
  onSelect
}) {
  return (
    <div>
      <h2>Therapists</h2>
      <p>View registered therapist profiles.</p>

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Therapist</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Profile</th>
              </tr>
            </thead>

            <tbody>
              {therapists.map(therapist => (
                <tr key={therapist.therapist_id}>
                  <td>
                    <div className="person-cell">
                      {therapist.profile_photo ? (
                        <img
                          className="table-avatar"
                          src={therapist.profile_photo}
                          alt={therapist.name || "Therapist"}
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="table-avatar">
                          {(therapist.name || "T").slice(0, 1).toUpperCase()}
                        </div>
                      )}

                      <b>{therapist.name || "Therapist"}</b>
                    </div>
                  </td>

                  <td>{therapist.email || "—"}</td>
                  <td>{therapist.phone_number || "—"}</td>
                  <td>{therapist.specialization || "—"}</td>

                  <td>
                    {therapist.experience_years ?? "—"}
                    {therapist.experience_years != null ? " years" : ""}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => onSelect?.(therapist)}
                    >
                      View profile →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {therapists.length === 0 && <p>No therapists found.</p>}
      </div>
    </div>
  );
}

export function Users({
  users,
  onAdd,
  onDelete,
  onSelect
}) {
  return (
    <>
      <PageHeading
        eyebrow="ADMINISTRATION"
        title="User management"
        description="View user accounts and manage access to the care workspace."
      />

      <div className="toolbar page-toolbar">
        <div className="toolbar-left">
          <span className="results-count">
            {users.length} user accounts
          </span>

          <span className="muted">
            Account deletion may be blocked by linked clinical records.
          </span>
        </div>

        <div className="toolbar-actions">
          <button className="primary-btn" onClick={onAdd}>
            ＋ Add user
          </button>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map(u => (
                <tr key={u.user_id}>
                  <td>
                    <div className="person-cell">
                      <div className="table-avatar">
                        {(u.name || "U").slice(0, 1).toUpperCase()}
                      </div>

                      <button
                        type="button"
                        className="link-button"
                        onClick={() => onSelect?.(u)}
                        title={`View ${u.name || "user"} details`}
                      >
                        {u.name}
                      </button>
                    </div>
                  </td>

                  <td>
                    <span className="role-chip">{u.role}</span>
                  </td>

                  <td>{u.email}</td>
                  <td>{u.phone_number || "—"}</td>
                  <td>{fmtDate(u.created_at)}</td>

                  <td>
                    <button
                      className="danger-link"
                      onClick={() => onDelete(u.user_id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <Empty
            icon="♧"
            title="No users found"
            text="Add a user to get started."
          />
        )}
      </div>
    </>
  );
}

export function HelpFAQs() {
  const faqs = [
    {
      question: "How can I view my treatment plan?",
      answer:
        "Open the Treatments section to view your prescribed Panchakarma treatments."
    },
    {
      question: "How can I check my appointments?",
      answer:
        "Open the Sessions section to view your scheduled and completed sessions."
    },
    {
      question: "How can I track my progress?",
      answer:
        "Open the Progress section to review your treatment progress and completed sessions."
    },
    {
      question: "Who should I contact if I have a problem?",
      answer:
        "Contact your doctor or the AyurDhara administrator for assistance."
    }
  ];

  return (
    <div className="panel">
      <h2>Help & FAQs</h2>
      <p>Frequently asked questions about your AyurDhara account.</p>

      {faqs.map((faq, index) => (
        <div
          key={index}
          style={{
            padding: "14px 0",
            borderBottom: "1px solid #e5e7eb"
          }}
        >
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
    </div>
  );
}

export function VitalsSymptoms() {
  return (
    <div className="panel">
      <h2>Vitals & Symptoms</h2>
      <p>View your recorded health details and symptoms.</p>
      <p>
        Your doctor can help update or review your health information
        during your consultation.
      </p>
    </div>
  );
}