import React, { useMemo, useState } from "react";
import {
    ArrowRight, Bell, CalendarDays, Check, ChevronDown, Clock3,
    HeartPulse, Home, LogOut, Menu, Plus, UserRound, X,
    ChartNoAxesColumnIncreasing, Info, ClipboardList
} from "lucide-react";
import "../styles/patient-dashboard.css";
import AyurDharaIcon from "./AyurDharaIcons";
import { Treatments, Sessions, Progress, Notifications, VitalsSymptoms, HelpFAQs } from "./Pages";

const asDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
    const date = asDate(value);
    return date
        ? date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
        : "Date to be confirmed";
};

const formatTime = (value) => {
    const date = asDate(value);
    return date
        ? date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        })
        : "";
};

const titleCase = (value = "") =>
    String(value).replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function PatientDashboard({
    user,
    patients = [],
    treatments = [],
    scheduled = [],
    completed = [],
    onNavigate = () => { },
    onLogout = () => { },
    notificationsCount = 0,
    alerts = [],
    doshaAssessment = null,
    treatmentPlan = null,
    onRequestSession,
    page = "dashboard",
    search = "",
    setSearch = () => { },
    sessionNotes = {},
    setSessionNotes = () => { },
    onUpdateSession = () => { },
    onSchedule = () => { }
}) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [requestNotice, setRequestNotice] = useState(false);

    const patient = useMemo(() => {
        const email = String(user?.email || "").toLowerCase();

        return patients.find(
            (p) => String(p.email || "").toLowerCase() === email
        ) || patients[0] || {};
    }, [patients, user]);

    const patientTreatments = useMemo(() => {
        const id = patient?.patient_id;

        return treatments.filter(
            (t) => id == null || String(t.patient_id) === String(id)
        );
    }, [treatments, patient]);

    const planCount = patientTreatments.length;

    const totalPrescribed = patientTreatments.reduce(
        (sum, t) => sum + Math.max(0, Number(t.planned_sessions || 0)),
        0
    );

    const completedCount = completed.filter(
        (t) => patientTreatments.some((p) => String(p.uuid) === String(t.uuid))
    ).length;

    const progress = totalPrescribed > 0
        ? Math.min(100, Math.round((completedCount / totalPrescribed) * 100))
        : 0;

    const upcoming = scheduled
        .filter((t) =>
            patientTreatments.some((p) => String(p.uuid) === String(t.uuid))
        )
        .filter(
            (t) => (t.session_status || "Scheduled").toLowerCase() !== "completed"
        )
        .sort(
            (a, b) =>
                (asDate(a.appointment_start)?.getTime() || 0) -
                (asDate(b.appointment_start)?.getTime() || 0)
        )
        .slice(0, 3);

    const activePlan =
        treatmentPlan ||
        patientTreatments.find(
            (t) =>
                !["completed", "cancelled"].includes(
                    String(t.treatment_status || "").toLowerCase()
                )
        ) ||
        patientTreatments[0];

    const firstName = (user?.name || patient?.name || "Patient").split(" ")[0];

    const activePage = page || "dashboard";

    const navGroups = [
        {
            title: "OVERVIEW",
            items: [
                { label: "Dashboard", icon: Home, page: "dashboard" },
                { label: "My Profile", icon: UserRound, page: "profile" }
            ]
        },
        {
            title: "MY CARE",
            items: [
                { label: "Treatment Plans", icon: ClipboardList, page: "treatments" },
                { label: "Sessions", icon: CalendarDays, page: "sessions" },
                { label: "Progress Tracking", icon: ChartNoAxesColumnIncreasing, page: "progress" },
                { label: "Vitals & Symptoms", icon: HeartPulse, page: "vitals" }
            ]
        },
        {
            title: "SUPPORT",
            items: [
                { label: "Notifications", icon: Bell, page: "notifications" },
                { label: "Help & FAQs", icon: Info, page: "help" }
            ]
        }
    ];

    const requestSession = () => {
        if (onRequestSession) {
            onRequestSession();
        } else {
            setRequestNotice(true);
            window.setTimeout(() => setRequestNotice(false), 5000);
        }
    };

    return (
        <div className="patient-workspace">

            {/* SIDEBAR */}
            <aside className={`patient-sidebar ${mobileNavOpen ? "is-open" : ""}`}>

                <div className="patient-brand">
                    <div className="patient-brand-mark" aria-hidden="true">
                        <span className="brand-letter">A</span>
                    </div>

                    <div>
                        <strong>AYURDHARA</strong>
                        <span>Panchakarma Care</span>
                    </div>

                    <button
                        className="patient-mobile-close"
                        onClick={() => setMobileNavOpen(false)}
                        aria-label="Close menu"
                    >
                        <X />
                    </button>
                </div>

                <div className="patient-user-chip">
                    <div className="patient-avatar">
                        {firstName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <b>{user?.name || patient?.name || "Patient"}</b>
                        <span>Patient</span>
                    </div>

                    <i />
                </div>

                <nav className="patient-nav">
                    {navGroups.map((group) => (
                        <section key={group.title}>
                            <h3>{group.title}</h3>

                            {group.items.map(({ label, icon: Icon, page: navPage }) => (
                                <button
                                    key={label}
                                    className={`patient-nav-item ${activePage === navPage ? "active" : ""}`}
                                    onClick={() => {
                                        onNavigate(navPage);
                                        setMobileNavOpen(false);
                                    }}
                                >
                                    <Icon size={19} strokeWidth={1.8} />

                                    <span>{label}</span>

                                    {label === "Notifications" &&
                                        notificationsCount > 0 && (
                                            <em>{notificationsCount}</em>
                                        )}
                                </button>
                            ))}
                        </section>
                    ))}
                </nav>

                {/* SIDEBAR DECORATION - NO LOTUS */}
                <div className="patient-sidebar-art" aria-hidden="true">
                    <svg
                        className="patient-sidebar-waves"
                        viewBox="0 0 320 190"
                        preserveAspectRatio="none"
                    >
                        <path d="M0 105 C65 55 102 115 165 85 S260 40 320 0 L320 190 L0 190Z" />
                        <path d="M0 130 C70 80 115 145 185 112 S270 82 320 40" />
                        <path d="M0 151 C72 103 120 163 195 132 S270 103 320 68" />
                    </svg>
                </div>

                <button
                    type="button"
                    className="patient-signout"
                    onClick={onLogout}
                    aria-label="Sign out of AyurDhara"
                >
                    <LogOut size={18} />
                    <span>Sign out</span>
                </button>
            </aside>

            {mobileNavOpen && (
                <button
                    className="patient-nav-scrim"
                    onClick={() => setMobileNavOpen(false)}
                    aria-label="Close navigation"
                />
            )}

            {/* MAIN CONTENT */}
            <main className="patient-main">

                <header className="patient-topbar">
                    <button
                        className="patient-menu-toggle"
                        onClick={() => setMobileNavOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu />
                    </button>

                    <div className="patient-breadcrumb">
                        AYURDHARA <span>/</span> <b>{({ dashboard: "Patient Dashboard", treatments: "Treatment plans", sessions: "Sessions", progress: "Progress tracking", vitals: "Vitals & Symptoms", notifications: "Notifications", help: "Help & FAQs", profile: "My Profile" })[activePage] || "Patient Dashboard"}</b>
                    </div>

                    <div className="patient-top-actions">
                        <span className="patient-today">
                            {new Date().toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            })}
                        </span>

                        <button
                            className="patient-notification"
                            onClick={() => onNavigate("notifications")}
                            aria-label="Notifications"
                        >
                            <Bell size={19} />
                            {notificationsCount > 0 && (
                                <i>{notificationsCount}</i>
                            )}
                        </button>

                        <div className="patient-top-user">
                            <div className="patient-avatar">
                                {firstName.charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <b>{user?.name || "Patient"}</b>
                                <span>Patient</span>
                            </div>

                            <ChevronDown size={16} />
                        </div>
                    </div>
                </header>

                <div className="patient-page">

                    {activePage === "dashboard" ? (
                        <>
                            {/* HERO */}
                            <section className="patient-hero">
                                <div className="patient-hero-copy">
                                    <span>YOUR PATIENT WORKSPACE</span>
                                    <h1>
                                        Patient Dashboard: {firstName} <b>✦</b>
                                    </h1>
                                    <p>
                                        Review your Panchakarma treatment plan, sessions,
                                        and progress.
                                    </p>
                                </div>

                                <img
                                    className="patient-hero-art-image"
                                    src="/ayurdhara-panchakarma-hero.png"
                                    alt=""
                                    aria-hidden="true"
                                />
                            </section>

                            {/* FOUR METRIC CARDS */}
                            <section className="patient-metrics">

                                <Metric
                                    icon="clipboard"
                                    tone="green"
                                    label="My Treatment Plan"
                                    value={planCount}
                                    detail={
                                        planCount
                                            ? "Active care plans"
                                            : "No care plan assigned yet"
                                    }
                                />

                                <Metric
                                    icon="calendar"
                                    tone="blue"
                                    label="Upcoming Sessions"
                                    value={upcoming.length}
                                    detail="Approved / scheduled appointments"
                                />

                                <Metric
                                    icon="check"
                                    tone="gold"
                                    label="Completed Sessions"
                                    value={completedCount}
                                    detail={
                                        totalPrescribed
                                            ? `Out of ${totalPrescribed} prescribed sessions`
                                            : "Sessions recorded as complete"
                                    }
                                />

                                <Metric
                                    icon="chart"
                                    tone="rose"
                                    label="Care Progress"
                                    value={`${progress}%`}
                                    detail={
                                        totalPrescribed
                                            ? `${completedCount} of ${totalPrescribed} prescribed sessions`
                                            : "Progress appears after a plan is assigned"
                                    }
                                />

                            </section>

                            {/* MIDDLE CARDS */}
                            <section className="patient-middle-grid">

                                {/* UPCOMING SESSIONS */}
                                <article className="patient-card patient-upcoming-card">

                                    <CardHeading
                                        icon="calendar"
                                        title="Upcoming Sessions"
                                        subtitle="Your scheduled therapy appointments"
                                        action="View Sessions"
                                        onAction={() => onNavigate("sessions")}
                                    />

                                    {upcoming.length ? (
                                        <div className="patient-session-list">
                                            {upcoming.map((session) => {
                                                const date = asDate(session.appointment_start);
                                                const status = titleCase(
                                                    session.session_status || "Scheduled"
                                                );

                                                return (
                                                    <div
                                                        className="patient-session-row"
                                                        key={session.uuid}
                                                    >
                                                        <div className="patient-date-chip">
                                                            <b>
                                                                {date
                                                                    ? date.toLocaleDateString(
                                                                        "en-IN",
                                                                        { day: "2-digit" }
                                                                    )
                                                                    : "—"}
                                                            </b>
                                                            <span>
                                                                {date
                                                                    ? date.toLocaleDateString(
                                                                        "en-IN",
                                                                        { month: "short" }
                                                                    )
                                                                    : "TBD"}
                                                            </span>
                                                        </div>

                                                        <div className="patient-session-name">
                                                            <b>
                                                                {titleCase(
                                                                    session.procedure_type ||
                                                                    session.subtype ||
                                                                    "Panchakarma Therapy"
                                                                )}
                                                            </b>
                                                            <span>
                                                                {session.treatment_details ||
                                                                    "Prescribed therapy"}
                                                            </span>
                                                        </div>

                                                        <div className="patient-session-time">
                                                            <CalendarDays size={14} />
                                                            <span>
                                                                {formatDate(session.appointment_start)}
                                                            </span>
                                                            <Clock3 size={14} />
                                                            <span>
                                                                {formatTime(session.appointment_start)}
                                                            </span>
                                                        </div>

                                                        <span
                                                            className={`patient-status ${status
                                                                .toLowerCase()
                                                                .replace(/\s+/g, "-")}`}
                                                        >
                                                            {status}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="patient-empty-state">

                                            {/* CALENDAR ONLY - NO LEAVES */}
                                            <div
                                                className="patient-empty-icon"
                                                aria-hidden="true"
                                            >
                                                <svg
                                                    viewBox="0 0 150 105"
                                                    className="patient-empty-calendar-art"
                                                >
                                                    <g
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <rect
                                                            x="42"
                                                            y="27"
                                                            width="66"
                                                            height="58"
                                                            rx="7"
                                                        />

                                                        <path d="M55 19v17M95 19v17M43 43h64" />

                                                        <path d="
                                                    M58 56h8
                                                    M78 56h8
                                                    M58 69h8
                                                    M78 69h8
                                                " />
                                                    </g>
                                                </svg>
                                            </div>

                                            <b>No upcoming sessions scheduled</b>

                                            <p>
                                                You don't have any approved appointments yet.
                                            </p>

                                            <small>
                                                You can request a session, and your practitioner
                                                will review and schedule it.
                                            </small>
                                        </div>
                                    )}

                                    <div className="patient-request-wrap">
                                        <button
                                            className="patient-request-btn"
                                            onClick={requestSession}
                                        >
                                            <Plus size={17} />
                                            Request a Session
                                        </button>

                                        {requestNotice && (
                                            <p className="patient-request-note">
                                                Please contact your practitioner to request
                                                a session. They will review and approve
                                                your appointment.
                                            </p>
                                        )}
                                    </div>
                                </article>

                                {/* CARE PROGRESS */}
                                <article className="patient-card patient-progress-card">

                                    <CardHeading
                                        icon="chart"
                                        title="My Care Progress"
                                        subtitle="Overall treatment completion"
                                        action="View Details"
                                        onAction={() => onNavigate("progress")}
                                    />

                                    <div className="patient-progress-content">
                                        <div
                                            className="patient-donut"
                                            style={{ "--progress": `${progress}%` }}
                                        >
                                            <div>
                                                <b>{progress}%</b>
                                                <span>Completed</span>
                                            </div>
                                        </div>

                                        <div className="patient-progress-legend">
                                            <p>
                                                <i className="green-dot" />
                                                Completed Sessions
                                                <b>
                                                    {completedCount}
                                                    {totalPrescribed
                                                        ? ` / ${totalPrescribed}`
                                                        : ""}
                                                </b>
                                            </p>

                                            <p>
                                                <i className="blue-dot" />
                                                Scheduled / Ongoing
                                                <b>{upcoming.length}</b>
                                            </p>

                                            <p>
                                                <i className="gray-dot" />
                                                Remaining
                                                <b>
                                                    {Math.max(
                                                        0,
                                                        totalPrescribed - completedCount
                                                    )}
                                                </b>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="patient-progress-note">
                                        <Info size={17} />
                                        {totalPrescribed
                                            ? `You have completed ${completedCount} of ${totalPrescribed} prescribed sessions (${progress}%).`
                                            : "Your progress will update as your care team records completed sessions."}
                                    </div>
                                </article>

                            </section>

                            {/* QUICK ACTIONS */}
                            <section className="patient-quick-actions patient-card">

                                <div className="patient-quick-intro">
                                    <div className="patient-card-icon">
                                        <AyurDharaIcon name="bolt" size={25} />
                                    </div>

                                    <div>
                                        <h2>Quick Actions</h2>
                                        <p>Frequently used features for your care</p>
                                    </div>
                                </div>

                                <button
                                    className="patient-quick-action green"
                                    onClick={() => onNavigate("treatments")}
                                >
                                    <AyurDharaIcon name="clipboard" size={25} />
                                    <span>View Treatment Plan</span>
                                    <ArrowRight size={18} />
                                </button>

                                <button
                                    className="patient-quick-action blue"
                                    onClick={() => onNavigate("sessions")}
                                >
                                    <AyurDharaIcon name="calendar" size={24} />
                                    <span>My Sessions</span>
                                    <ArrowRight size={18} />
                                </button>

                                <button
                                    className="patient-quick-action gold"
                                    onClick={() => onNavigate("progress")}
                                >
                                    <AyurDharaIcon name="chart" size={24} />
                                    <span>Track Progress</span>
                                    <ArrowRight size={18} />
                                </button>

                            </section>
                        </>
                    ) : activePage === "treatments" ? (
                        <Treatments treatments={patientTreatments} search={search} setSearch={setSearch} readOnly onSchedule={onSchedule} />
                    ) : activePage === "sessions" ? (
                        <Sessions treatments={patientTreatments.filter(t => t.appointment_start)} notes={sessionNotes} setNotes={setSessionNotes} onUpdate={onUpdateSession} readOnly />
                    ) : activePage === "progress" ? (
                        <Progress patients={patient?.patient_id ? [patient] : []} treatments={patientTreatments} completed={completed.filter(t => patientTreatments.some(p => String(p.uuid) === String(t.uuid)))} />
                    ) : activePage === "vitals" ? (
                        <VitalsSymptoms />
                    ) : activePage === "notifications" ? (
                        <Notifications treatments={patientTreatments} alerts={alerts} onNavigate={onNavigate} />
                    ) : activePage === "help" ? (
                        <HelpFAQs />
                    ) : activePage === "profile" ? (
                        <PatientProfilePage user={user} patient={patient} />
                    ) : (
                        <section className="patient-card patient-page-empty"><div className="patient-empty-icon"><span>✦</span></div><h2>Care information</h2><p>This section will display information when it becomes available.</p></section>
                    )}
                </div>
            </main>
        </div>
    );
}

/* PATIENT PROFILE PAGE */
function PatientProfilePage({ user, patient }) {
    const name = patient?.name || user?.name || "Patient";
    const email = patient?.email || user?.email || "Not provided";
    const phone = patient?.phone_number || patient?.phone || patient?.mobile_number || user?.phone_number || user?.phone || "Not provided";
    const height = patient?.height != null && patient.height !== "" ? `${patient.height} cm` : "Not provided";
    const weight = patient?.weight != null && patient.weight !== "" ? `${patient.weight} kg` : "Not provided";
    const bloodGroup = patient?.blood_group || "Not provided";
    const address = patient?.address || "Not provided";
    const patientId = patient?.patient_id || "Not available";
    const registered = patient?.created_at ? formatDate(patient.created_at) : "Not available";
    const initials = name.trim().split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();

    const details = [
        ["Full name", name],
        ["Email address", email],
        ["Phone number", phone],
        ["Height", height],
        ["Weight", weight],
        ["Blood group", bloodGroup],
        ["Address", address],
        ["Patient ID", patientId],
        ["Registered on", registered]
    ];

    const stats = [
        { label: "Account status", value: "Registered", detail: "Your AyurDhara account", icon: "✓", tone: "green" },
        { label: "Phone number", value: phone, detail: "Registered contact", icon: "☎", tone: "blue" },
        { label: "Height", value: height, detail: "Patient information", icon: "↕", tone: "gold" },
        { label: "Weight", value: weight, detail: "Patient information", icon: "⚖", tone: "purple" }
    ];

    return (
        <div className="patient-profile-page">
            <section className="patient-profile-hero">
                <div>
                    <span className="patient-profile-eyebrow">YOUR AYURDHARA ACCOUNT</span>
                    <h1>My Profile</h1>
                    <p>View your registered details and personal information.</p>
                </div>
                <div className="patient-profile-hero-mark" aria-hidden="true">✦</div>
            </section>

            <section className="patient-profile-stats" aria-label="Profile summary">
                {stats.map((stat) => (
                    <article className={`patient-profile-stat ${stat.tone}`} key={stat.label}>
                        <span className="patient-profile-stat-icon" aria-hidden="true">{stat.icon}</span>
                        <div>
                            <small>{stat.label}</small>
                            <strong>{stat.value}</strong>
                            <span>{stat.detail}</span>
                        </div>
                    </article>
                ))}
            </section>

            <section className="patient-card patient-profile-card">
                <div className="patient-profile-summary">
                    {patient?.profile_photo ? (
                        <img className="patient-profile-avatar-large" src={patient.profile_photo} alt={`${name} profile`} />
                    ) : (
                        <div className="patient-profile-avatar-large patient-profile-avatar-fallback" aria-label={`${name} initials`}>{initials || "P"}</div>
                    )}
                    <div className="patient-profile-identity">
                        <span className="patient-profile-eyebrow">AYURDHARA PATIENT</span>
                        <h2>{name}</h2>
                        <p>{email}</p>
                        <span className="patient-profile-registered"><i /> Registered patient</span>
                    </div>
                </div>

                <div className="patient-profile-section-heading">
                    <div>
                        <span className="patient-profile-eyebrow">ACCOUNT INFORMATION</span>
                        <h2>Personal details</h2>
                        <p>Your information as recorded in your patient account.</p>
                    </div>
                    <span className="patient-profile-detail-count">{details.length} details</span>
                </div>

                <div className="patient-profile-details">
                    {details.map(([label, value]) => (
                        <div className="patient-profile-detail" key={label}>
                            <span>{label}</span>
                            <strong>{value || "Not provided"}</strong>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

/* NAVIGATION LEAF MARKER */
function LeafNavIcon() {
    return null;
}

/* METRIC CARD */
function Metric({ icon, tone, label, value, detail }) {
    return (
        <article className={`patient-metric ${tone}`}>
            <div className="patient-metric-icon">
                <AyurDharaIcon name={icon} size={29} />
            </div>

            <div className="patient-metric-copy">
                <span>{label}</span>
                <b>{value}</b>
                <small>{detail}</small>
            </div>
        </article>
    );
}

/* CARD HEADING */
function CardHeading({
    icon,
    title,
    subtitle,
    action,
    onAction
}) {
    return (
        <div className="patient-card-heading">
            <div className="patient-card-title">

                <div className="patient-card-icon">
                    <AyurDharaIcon name={icon} size={22} />
                </div>

                <div>
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>
            </div>

            <button onClick={onAction}>
                {action}
                <ArrowRight size={16} />
            </button>
        </div>
    );
}