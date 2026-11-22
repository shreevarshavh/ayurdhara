import React, { useMemo, useState } from "react";
import {
    ArrowRight, Bell, CalendarDays, Check, ChevronDown, Clock3,
    Home, LogOut, Menu, Plus, UserRound, X,
    ChartNoAxesColumnIncreasing, Info, ClipboardList, Sparkles, Phone, Ruler, Scale
} from "lucide-react";
import "../styles/patient-dashboard.css";
import AyurDharaIcon from "./AyurDharaIcons";
import AyurDharaLogo from "./AyurDharaLogo";
import PatientProgress from "./pages/Progress";
import {
    Treatments,
    Sessions,
    Notifications,
    HelpFAQs
} from "./Pages";


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
                    <AyurDharaLogo size={46} variant="light" withText />

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
                        AYURDHARA <span>/</span> <b>{({ dashboard: "Patient Dashboard", treatments: "Treatment plans", sessions: "Sessions", progress: "Progress tracking", notifications: "Notifications", help: "Help & FAQs", profile: "My Profile" })[activePage] || "Patient Dashboard"}</b>
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

                    {activePage !== "dashboard" && (
                        <section className="patient-page-hero patient-page-hero-light">

                            <div className="patient-page-hero-copy">

                                <span>
                                    YOUR PATIENT WORKSPACE
                                </span>

                                <h1>
                                    {{
                                        treatments: "Treatment Plans",
                                        sessions: "My Sessions",
                                        progress: "Progress Tracking",
                                        notifications: "Notifications",
                                        help: "Help & FAQs",
                                        profile: "My Profile"
                                    }[activePage] || "Patient Care"}
                                </h1>

                                <p>
                                    Your Panchakarma care information, treatment activities,
                                    and health progress.
                                </p>

                            </div>

                        </section>
                    )}

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
                        <PatientProgress patients={patient?.patient_id ? [patient] : []} treatments={patientTreatments} completed={completed.filter(t => patientTreatments.some(p => String(p.uuid) === String(t.uuid)))} />
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
        { label: "Account status", value: "Registered", detail: "Your AyurDhara account", icon: <Check size={20} strokeWidth={2.5} />, tone: "green" },
        { label: "Phone number", value: phone, detail: "Registered contact", icon: <Phone size={19} strokeWidth={2} />, tone: "blue" },
        { label: "Height", value: height, detail: "Patient information", icon: <Ruler size={19} strokeWidth={2} />, tone: "gold" },
        { label: "Weight", value: weight, detail: "Patient information", icon: <Scale size={19} strokeWidth={2} />, tone: "purple" }
    ];

    return (
        <div className="flex flex-col w-full gap-[16px]">


            <section className="grid grid-cols-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-2 gap-[13px] max-[640px]:gap-[9px] w-full" aria-label="Profile summary">
                {stats.map((stat) => (
                    <article className="flex items-center max-[420px]:flex-col max-[420px]:items-start gap-[13px] max-[640px]:gap-[9px] min-w-0 min-h-[94px] max-[640px]:min-h-[82px] p-[14px_15px] max-[640px]:p-[11px] border border-[#e7ece4] rounded-[15px] bg-white shadow-[0_4px_15px_rgba(30,66,43,.055)]" key={stat.label}>
                        <span className={`grid place-items-center shrink-0 w-[48px] h-[48px] max-[640px]:w-[42px] max-[640px]:h-[42px] rounded-[15px] max-[640px]:rounded-[13px] text-[22px] max-[640px]:text-[20px] font-bold ${stat.tone === "green"
                            ? "bg-[#e5f2df] text-[#347c4b]"
                            : stat.tone === "blue"
                                ? "bg-[#e5efff] text-[#3977c9]"
                                : stat.tone === "gold"
                                    ? "bg-[#fff0d7] text-[#b77b18]"
                                    : "bg-[#f0e5ff] text-[#8750c5]"
                            }`} aria-hidden="true">{stat.icon}</span>
                        <div className="flex flex-col gap-[4px] min-w-0 max-[420px]:w-full">
                            <small className="text-[#4f665b] text-[11px] font-bold">{stat.label}</small>
                            <strong className="text-[#123d2d] font-['Playfair_Display',Georgia,serif] text-[clamp(14px,1.25vw,20px)] max-[640px]:text-[15px] font-bold leading-[1.2] [overflow-wrap:anywhere]">{stat.value}</strong>
                            <span className="text-[#87948c] text-[10px]">{stat.detail}</span>
                        </div>
                    </article>
                ))}
            </section>

            <section className="bg-white border border-[#e6ebe3] rounded-[16px] p-[27px_30px_30px] max-[640px]:p-[19px_16px] shadow-[0_4px_14px_#193c260a]">
                <div className="flex items-center gap-[22px] max-[640px]:gap-[14px] pt-[3px] px-0 pb-[25px] border-b border-[#e9eee7]">
                    {patient?.profile_photo ? (
                        <img className="grid place-items-center w-[112px] h-[112px] max-[640px]:w-[82px] max-[640px]:h-[82px] shrink-0 rounded-[22px] max-[640px]:rounded-[17px] object-cover border border-[#e3ebdf] shadow-[0_5px_16px_rgba(24,66,43,.08)]" src={patient.profile_photo} alt={`${name} profile`} />
                    ) : (
                        <div className="grid place-items-center w-[112px] h-[112px] max-[640px]:w-[82px] max-[640px]:h-[82px] shrink-0 rounded-[22px] max-[640px]:rounded-[17px] border border-[#e3ebdf] shadow-[0_5px_16px_rgba(24,66,43,.08)] bg-[linear-gradient(145deg,#e8f2e2,#d9e9d5)] text-[#176143] font-['Playfair_Display',Georgia,serif] text-[38px] max-[640px]:text-[29px] font-bold" aria-label={`${name} initials`}>{initials || "P"}</div>
                    )}
                    <div className="min-w-0">
                        <span className="block mb-[8px] text-[#769080] text-[10px] font-extrabold tracking-[0.19em] uppercase">AYURDHARA PATIENT</span>
                        <h2 className="m-[0_0_5px] text-[#123d2d] font-['Playfair_Display',Georgia,serif] text-[29px] max-[640px]:text-[23px] font-bold leading-[1.2]">{name}</h2>
                        <p className="m-[0_0_12px] text-[#7d8c82] text-[13px] [overflow-wrap:anywhere]">{email}</p>
                        <span className="inline-flex items-center gap-[7px] px-[11px] py-[6px] rounded-full bg-[#e8f4e8] text-[#287447] text-[11px] font-bold"><i className="w-[7px] h-[7px] rounded-full bg-[#39a566] not-italic" /> Registered patient</span>
                    </div>
                </div>

                <div className="flex justify-between items-end max-[760px]:items-start max-[760px]:gap-[10px] pt-[24px] pb-[16px]">
                    <div>
                        <span className="block mb-[5px] text-[#769080] text-[10px] font-extrabold tracking-[0.19em] uppercase">ACCOUNT INFORMATION</span>
                        <h2 className="m-[0_0_4px] text-[#143e2e] font-['Playfair_Display',Georgia,serif] text-[23px] font-bold">Personal details</h2>
                        <p className="m-0 text-[#87948c] text-[12px]">Your information as recorded in your patient account.</p>
                    </div>
                    <span className="text-[12px] font-bold text-[#456d54] bg-[#edf5e8] px-[10px] py-[4px] rounded-full">{details.length} details</span>
                </div>

                <div className="grid grid-cols-2 max-[640px]:grid-cols-1 [column-gap:28px]">
                    {details.map(([label, value]) => (
                        <div className="min-w-0 min-h-[72px] p-[14px_4px] border-b border-[#edf0eb] flex flex-col justify-center gap-[7px]" key={label}>
                            <span className="text-[#829087] text-[10px] font-extrabold tracking-[0.09em] uppercase">{label}</span>
                            <strong className="text-[#244638] text-[13px] font-bold [overflow-wrap:anywhere]">{value || "Not provided"}</strong>
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
    const toneStyles = {
        green: {
            card: "bg-[linear-gradient(120deg,#fff,#f4f8ed)]",
            icon: "bg-[#e7f2df] text-[#3b7b4b]"
        },
        blue: {
            card: "bg-[linear-gradient(120deg,#fff,#f1f6ff)]",
            icon: "bg-[#e4edfc] text-[#3d75c4]"
        },
        gold: {
            card: "bg-[linear-gradient(120deg,#fff,#fff8ec)]",
            icon: "bg-[#fff0d8] text-[#b88735]"
        },
        rose: {
            card: "bg-[linear-gradient(120deg,#fff,#fff2f1)]",
            icon: "bg-[#fde8e5] text-[#c35c50]"
        }
    }[tone] || {
        card: "bg-white",
        icon: "bg-[#e7f2df] text-[#3b7b4b]"
    };

    return (
        <article className={`h-[130px] min-h-[130px] max-[760px]:min-h-[112px] max-[760px]:h-auto p-[17px_20px] max-[1450px]:p-[15px_13px] max-[760px]:p-[12px] gap-[14px] max-[1450px]:gap-[10px] max-[760px]:gap-[9px] rounded-[15px] flex items-start relative overflow-hidden border border-[#e6ebe3] shadow-[0_4px_12px_#193c2610] ${toneStyles.card}`}>
            <div className={`w-[55px] h-[55px] shrink-0 max-[1450px]:w-[46px] max-[1450px]:h-[46px] max-[760px]:w-[38px] max-[760px]:h-[38px] rounded-[16px] max-[760px]:rounded-[12px] grid place-items-center ${toneStyles.icon}`}>
                <AyurDharaIcon name={icon} size={29} />
            </div>

            <div className="flex flex-col gap-[5px] pt-[2px] min-w-0">
                <span className="text-[14px] max-[1350px]:text-[12px] max-[760px]:text-[10px] font-bold text-[#263c30] whitespace-nowrap max-[1350px]:whitespace-normal leading-[1.25]">{label}</span>
                <b className="font-['Playfair_Display',Georgia,serif] text-[36px] max-[1350px]:text-[31px] max-[760px]:text-[26px] font-extrabold text-[#073d2a] leading-[1.05] mt-[1px]">{value}</b>
                <small className="font-['DM_Sans',sans-serif] text-[11px] max-[760px]:text-[9px] text-[#78867d] leading-[1.35] max-w-[205px]">{detail}</small>
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
        <div className="flex items-center justify-between gap-[12px] mb-[17px]">
            <div className="flex items-center gap-[11px] min-w-0">
                <div className="w-[39px] h-[39px] rounded-[12px] bg-[#eaf3e2] text-[#347448] grid place-items-center shrink-0">
                    <AyurDharaIcon name={icon} size={22} />
                </div>

                <div>
                    <h2 className="font-['Playfair_Display',serif] text-[21px] max-[420px]:text-[16px] font-bold m-[0_0_3px] text-[#1c3829]">{title}</h2>
                    <p className="m-0 text-[12px] max-[420px]:text-[9px] text-[#869289]">{subtitle}</p>
                </div>
            </div>

            <button onClick={onAction} className="flex items-center gap-[5px] border-0 bg-transparent text-[#17613d] font-['DM_Sans',sans-serif] text-[10px] max-[420px]:text-[9px] font-bold whitespace-nowrap cursor-pointer hover:underline">
                {action}
                <ArrowRight size={16} />
            </button>
        </div>
    );
}
