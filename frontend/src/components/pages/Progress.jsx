
import React from "react";

export function Progress({ patients = [], treatments = [], completed }) {
  const rows = treatments || [];

  // Calculate completed records directly from treatment statuses.
  const completedRows = rows.filter(
    t => (t.session_status || "Scheduled").toLowerCase() === "completed"
  );

  const completedCount = completedRows.length;
  const pct = rows.length
    ? Math.round((completedCount / rows.length) * 100)
    : 0;

  const statusNames = [
    "Scheduled",
    "Ongoing",
    "Completed",
    "Missed",
    "Interrupted"
  ];

  const statusCounts = statusNames.map(status => ({
    status,
    count: rows.filter(
      t =>
        (t.session_status || "Scheduled").toLowerCase() ===
        status.toLowerCase()
    ).length
  }));

  const patientRows = patients || [];

  return (
    <div className="patient-subpage">

      {/* Page heading */}
      <section className="patient-page-hero">
        <div className="patient-page-hero-copy">
          <span>OUTCOME MONITORING</span>
          <h1>Progress Tracking</h1>
          <p>
            Follow your Panchakarma treatment progress and review
            completed care activities.
          </p>
        </div>

        <div className="patient-page-hero-action">
          <button
            className="patient-print-button"
            onClick={() => window.print()}
          >
            ↓ Print summary
          </button>
        </div>
      </section>

      {/* Summary cards */}
      <section className="patient-page-stats">
        {[
          {
            label: "Treatment Records",
            value: rows.length,
            detail: "Plans in your care record",
            icon: "▤",
            tone: "green"
          },
          {
            label: "Completed",
            value: completedCount,
            detail: "Recorded as complete",
            icon: "✓",
            tone: "blue"
          },
          {
            label: "In Progress",
            value: statusCounts.find(x => x.status === "Ongoing")?.count || 0,
            detail: "Currently underway",
            icon: "◷",
            tone: "gold"
          },
          {
            label: "Scheduled",
            value: statusCounts.find(x => x.status === "Scheduled")?.count || 0,
            detail: "Awaiting session",
            icon: "▦",
            tone: "purple"
          },
          {
            label: "Overall Progress",
            value: `${pct}%`,
            detail: "Based on available records",
            icon: "↗",
            tone: "sky"
          }
        ].map(item => (
          <article
            className={`patient-page-stat ${item.tone}`}
            key={item.label}
          >
            <span className="patient-page-stat-icon">
              {item.icon}
            </span>

            <span className="patient-page-stat-copy">
              <b>{item.value}</b>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </span>
          </article>
        ))}
      </section>

      {/* Progress overview and status breakdown */}
      <div className="patient-progress-summary-grid">

        <section className="patient-card patient-progress-overview">
          <div className="patient-section-kicker">
            SESSION COMPLETION
          </div>

          <div className="patient-progress-overview-body">
            <div
              className="patient-donut patient-progress-donut"
              style={{ "--progress": `${pct}%` }}
            >
              <div>
                <b>{pct}%</b>
                <span>Completed</span>
              </div>
            </div>

            <div className="patient-progress-stats">
              <div>
                <span>Treatment records</span>
                <b>{rows.length}</b>
              </div>

              <div>
                <span>Completed sessions</span>
                <b>{completedCount}</b>
              </div>

              <div>
                <span>Remaining records</span>
                <b>{Math.max(0, rows.length - completedCount)}</b>
              </div>
            </div>
          </div>
        </section>

        <section className="patient-card patient-session-status-card">
          <h2>Session status</h2>
          <p>Current status of your treatment records</p>

          {statusCounts.map(item => (
            <div
              className="patient-status-bar-row"
              key={item.status}
            >
              <div>
                <span>{item.status}</span>
                <b>{item.count}</b>
              </div>

              <div>
                <i
                  style={{
                    width: `${
                      rows.length
                        ? (item.count / rows.length) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Patient-wise progress */}
      <section className="patient-card patient-progress-table-card">

        <div className="patient-card-heading">
          <div className="patient-card-title">
            <div className="patient-card-icon">
              <span>↗</span>
            </div>

            <div>
              <h2>Patient treatment progress</h2>
              <p>
                Summary calculated from session statuses recorded
                by your care team.
              </p>
            </div>
          </div>
        </div>

        {patientRows.length > 0 ? (
          <div className="patient-table-scroll">
            <table className="patient-data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Treatment records</th>
                  <th>Completed</th>
                  <th>Scheduled / ongoing</th>
                  <th>Progress</th>
                </tr>
              </thead>

              <tbody>
                {patientRows.map(patient => {
                  const own = rows.filter(
                    t =>
                      String(t.patient_id) ===
                      String(patient.patient_id)
                  );

                  const done = own.filter(
                    t =>
                      (t.session_status || "").toLowerCase() ===
                      "completed"
                  ).length;

                  const value = own.length
                    ? Math.round((done / own.length) * 100)
                    : 0;

                  const remaining = own.filter(t =>
                    !["completed", "missed", "interrupted"].includes(
                      (t.session_status || "scheduled").toLowerCase()
                    )
                  ).length;

                  return (
                    <tr key={patient.patient_id}>
                      <td>
                        <div className="patient-progress-person">
                          <span>
                            {(patient.name || "P")
                              .slice(0, 1)
                              .toUpperCase()}
                          </span>
                          <b>{patient.name || "Patient"}</b>
                        </div>
                      </td>

                      <td>{own.length}</td>
                      <td>{done}</td>
                      <td>{remaining}</td>

                      <td>
                        <div className="patient-mini-progress">
                          <i style={{ width: `${value}%` }} />
                        </div>
                        <b className="patient-progress-percent">
                          {value}%
                        </b>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="patient-inline-empty">
            Your progress summary will appear when your care records
            are available.
          </div>
        )}
      </section>

      <p className="patient-data-note">
        Progress is based only on treatment and session status records
        currently available in your account.
      </p>

    </div>
  );
}

export default Progress;
