import React, { useMemo, useState } from "react";
import {
    ArrowRight, Bell, CalendarDays, Check, ChevronDown, Clock3,
    HeartPulse, Home, LogOut, Menu, Plus, UserRound, X,
    ChartNoAxesColumnIncreasing, Info, ClipboardList, Sparkles, Phone, Ruler, Scale
} from "lucide-react";
import AyurDharaIcon from "./AyurDharaIcons";
import AyurDharaLogo from "./AyurDharaLogo";
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
        <div className="min-h-screen bg-[#f6f7f2] text-[#19372b] font-['DM_Sans',sans-serif] flex">

            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-20 flex flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-[307px] max-[1450px]:w-[270px] max-[1200px]:w-[238px] max-[760px]:w-[280px] max-[760px]:transition-transform max-[760px]:duration-200 bg-[linear-gradient(160deg,#064b34_0%,#075338_58%,#075b3e_100%)] text-white p-[20px_19px_18px] ${mobileNavOpen ? "max-[760px]:translate-x-0" : "max-[760px]:-translate-x-full"}`}>

                <div className="flex items-center gap-[10px] px-[10px] pb-[20px] pt-0 border-b border-[#ffffff20] min-h-[72px]">
                    <div className="shrink-0" aria-hidden="true">
                        <AyurDharaLogo size={42} variant="light" />
                    </div>

                    <div>
                        <strong className="block font-['Playfair_Display',serif] text-[22px] font-bold tracking-[0.035em] whitespace-nowrap">AYURDHARA</strong>
                        <span className="block text-[#c4d9c8] text-[12px] mt-[2px]">Panchakarma Care</span>
                    </div>

                    <button
                        className="hidden max-[760px]:block ml-auto bg-transparent border-0 text-white cursor-pointer"
                        onClick={() => setMobileNavOpen(false)}
                        aria-label="Close menu"
                    >
                        <X />
                    </button>
                </div>

                <div className="flex items-center gap-[11px] my-[18px_22px] p-[12px_13px] min-h-[70px] border border-[#ffffff35] rounded-[15px] bg-[#ffffff0b]">
                    <div className="w-[43px] h-[43px] rounded-full grid place-items-center bg-[#e7f0d5] text-[#15563b] font-extrabold text-[17px] shrink-0">
                        {firstName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex flex-col gap-[3px] min-w-0">
                        <b className="text-[13px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">{user?.name || patient?.name || "Patient"}</b>
                        <span className="text-[11px] text-[#c4d9c8] capitalize">Patient</span>
                    </div>

                    <i className="w-[9px] h-[9px] bg-[#6bd47c] rounded-full ml-auto shrink-0 not-italic" />
                </div>

                <nav className="flex flex-col">
                    {navGroups.map((group) => (
                        <section key={group.title} className="mb-[18px]">
                            <h3 className="text-[10px] tracking-[0.12em] text-[#b9d1c1] m-[0_0_9px_13px] font-extrabold uppercase">{group.title}</h3>

                            {group.items.map(({ label, icon: Icon, page: navPage }) => (
                                <button
                                    key={label}
                                    className={`w-full flex items-center gap-[13px] border-0 text-left min-h-[43px] p-[10px_13px] rounded-[12px] text-[14px] font-semibold my-[3px] transition-colors duration-200 cursor-pointer ${activePage === navPage ? "bg-[#dcebc0] text-[#124c33] shadow-[inset_4px_0_#85b77d]" : "bg-transparent text-[#e4eee6] hover:bg-[#ffffff12]"}`}
                                    onClick={() => {
                                        onNavigate(navPage);
                                        setMobileNavOpen(false);
                                    }}
                                >
                                    <Icon size={19} strokeWidth={1.8} />

                                    <span>{label}</span>

                                    {label === "Notifications" &&
                                        notificationsCount > 0 && (
                                            <em className="not-italic ml-auto rounded-[20px] bg-[#d94d45] text-white px-[7px] py-[3px] text-[10px]">{notificationsCount}</em>
                                        )}
                                </button>
                            ))}
                        </section>
                    ))}
                </nav>

                {/* SIDEBAR DECORATION - NO LOTUS */}
                <div className="min-h-[174px] flex-auto mt-[10px] -mx-[19px] mb-0 p-0 relative bg-[linear-gradient(180deg,transparent_0%,rgba(19,105,66,.2)_100%)] overflow-hidden" aria-hidden="true">
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 320 190"
                        preserveAspectRatio="none"
                    >
                        <path className="fill-[#167449] opacity-[0.58]" d="M0 105 C65 55 102 115 165 85 S260 40 320 0 L320 190 L0 190Z" />
                        <path className="fill-none stroke-[#a7bb65] stroke-[1.3] opacity-80" d="M0 130 C70 80 115 145 185 112 S270 82 320 40" />
                        <path className="fill-none stroke-[#a7bb65] stroke-[1.3] opacity-80" d="M0 151 C72 103 120 163 195 132 S270 103 320 68" />
                    </svg>
                </div>

                <button
                    type="button"
                    className="flex items-center gap-[12px] border border-[#ffffff55] bg-[#ffffff08] text-white rounded-[13px] min-h-[54px] p-[12px_14px] text-[12px] font-semibold shrink-0 mt-[8px] cursor-pointer hover:bg-[#ffffff15] transition-colors"
                    onClick={onLogout}
                    aria-label="Sign out of AyurDhara"
                >
                    <LogOut size={18} />
                    <span>Sign out</span>
                </button>
            </aside>

            {mobileNavOpen && (
                <button
                    className="hidden max-[760px]:block fixed inset-0 bg-[#10281ccc] border-0 z-15 cursor-pointer"
                    onClick={() => setMobileNavOpen(false)}
                    aria-label="Close navigation"
                />
            )}

            {/* MAIN CONTENT */}
            <main className="ml-[307px] w-[calc(100%-307px)] max-[1450px]:ml-[270px] max-[1450px]:w-[calc(100%-270px)] max-[1200px]:ml-[238px] max-[1200px]:w-[calc(100%-238px)] max-[760px]:ml-0 max-[760px]:w-full min-h-screen min-w-0 flex-1">

                <header className="h-[70px] max-[760px]:h-[62px] bg-white border-b border-[#e8ece5] flex items-center justify-between px-[clamp(20px,3vw,44px)] max-[760px]:px-[15px] sticky top-0 z-10">
                    <button
                        className="hidden max-[760px]:grid max-[760px]:place-items-center border-0 bg-transparent text-[#315d42] cursor-pointer"
                        onClick={() => setMobileNavOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu />
                    </button>

                    <div className="text-[10px] max-[760px]:text-[9px] font-extrabold tracking-[0.1em] text-[#6f8174]">
                        AYURDHARA <span className="text-[#b6c2b8] px-[12px]">/</span> <b className="text-[#263e30] tracking-[0.02em]">{({ dashboard: "Patient Dashboard", treatments: "Treatment plans", sessions: "Sessions", progress: "Progress tracking", vitals: "Vitals & Symptoms", notifications: "Notifications", help: "Help & FAQs", profile: "My Profile" })[activePage] || "Patient Dashboard"}</b>
                    </div>

                    <div className="flex items-center gap-[17px] max-[760px]:gap-[9px]">
                        <span className="text-[10px] text-[#87958b] max-[760px]:hidden">
                            {new Date().toLocaleDateString("en-IN", {
                                weekday: "short",
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            })}
                        </span>

                        <button
                            className="w-[39px] h-[39px] grid place-items-center relative bg-white border border-[#e6ebe3] rounded-[12px] text-[#456d54] cursor-pointer hover:bg-[#f6f8f5] transition-colors"
                            onClick={() => onNavigate("notifications")}
                            aria-label="Notifications"
                        >
                            <Bell size={19} />
                            {notificationsCount > 0 && (
                                <i className="absolute -right-[5px] -top-[5px] bg-[#d94d45] text-white rounded-[20px] not-italic text-[9px] px-[5px] py-[3px]">{notificationsCount}</i>
                            )}
                        </button>

                        <div className="flex items-center gap-[9px]">
                            <div className="w-[38px] h-[38px] rounded-full grid place-items-center bg-[#e7f0d5] text-[#15563b] font-extrabold text-[15px] shrink-0">
                                {firstName.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex flex-col gap-[2px] max-[760px]:hidden">
                                <b className="text-[11px] font-bold text-[#19372b]">{user?.name || "Patient"}</b>
                                <span className="text-[10px] text-[#849187]">Patient</span>
                            </div>

                            <ChevronDown size={16} className="max-[760px]:hidden text-[#6f8174]" />
                        </div>
                    </div>
                </header>

                <div key={activePage} className="page-transition w-full p-[18px_27px_20px] max-[1450px]:p-[16px_18px] max-[760px]:p-[14px]">

                    {activePage === "dashboard" ? (
                        <>
                            {/* HERO */}
                            <section className="h-[170px] min-h-[170px] max-[760px]:min-h-[150px] max-[760px]:h-auto p-[26px_38px] max-[760px]:p-[22px_18px] mb-[18px] rounded-[16px] bg-[#075438] relative isolate overflow-hidden">
                                <div className="absolute inset-0 z-2 pointer-events-none bg-[linear-gradient(90deg,#064b32_0%,rgba(6,75,50,.98)_29%,rgba(6,75,50,.84)_42%,rgba(6,75,50,.36)_57%,transparent_73%)]" aria-hidden="true" />

                                <div className="max-w-[58%] max-[760px]:max-w-[92%] relative z-3 flex flex-col justify-center">
                                    <span className="font-['DM_Sans',sans-serif] text-[10px] tracking-[0.18em] font-extrabold text-[#d6e5bb]">YOUR PATIENT WORKSPACE</span>
                                    <h1 className="font-['Playfair_Display',Georgia,serif] text-[clamp(29px,2.35vw,40px)] max-[760px]:text-[24px] font-bold leading-[1.16] m-[13px_0_8px] text-white whitespace-normal flex items-center flex-wrap gap-2">
                                        <span>Patient Dashboard: {firstName}</span> <Sparkles size={22} className="text-[#d9e8a9] shrink-0" />
                                    </h1>
                                    <p className="m-0 font-['DM_Sans',sans-serif] text-[15px] max-[760px]:text-[13px] text-[#e0eee4] leading-[1.4] max-w-[480px]">
                                        Review your Panchakarma treatment plan, sessions,
                                        and progress.
                                    </p>
                                </div>

                                <img
                                    className="absolute right-0 top-0 h-full w-auto max-w-[58%] max-[760px]:max-w-none max-[760px]:w-full max-[760px]:opacity-65 object-contain object-right max-[760px]:object-[65%_center] z-1 block pointer-events-none"
                                    src="/ayurdhara-panchakarma-hero.png"
                                    alt=""
                                    aria-hidden="true"
                                />
                            </section>

                            {/* FOUR METRIC CARDS */}
                            <section className="grid grid-cols-4 max-[1200px]:grid-cols-2 max-[420px]:grid-cols-2 gap-[16px] max-[760px]:gap-[9px] mb-[17px]">

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
                            <section className="grid grid-cols-[minmax(0,1.2fr)_minmax(390px,0.8fr)] max-[1450px]:grid-cols-[minmax(0,1.1fr)_minmax(330px,0.9fr)] max-[1200px]:grid-cols-1 gap-[18px] max-[760px]:gap-[12px] mb-[17px]">

                                {/* UPCOMING SESSIONS */}
                                <article className="bg-white border border-[#e6ebe3] rounded-[16px] p-[19px_20px] max-[760px]:p-[14px] shadow-[0_4px_14px_#193c260a] min-w-0 min-h-[305px] max-[1200px]:min-h-0">

                                    <CardHeading
                                        icon="calendar"
                                        title="Upcoming Sessions"
                                        subtitle="Your scheduled therapy appointments"
                                        action="View Sessions"
                                        onAction={() => onNavigate("sessions")}
                                    />

                                    {upcoming.length ? (
                                        <div className="flex flex-col gap-[8px]">
                                            {upcoming.map((session) => {
                                                const date = asDate(session.appointment_start);
                                                const status = titleCase(
                                                    session.session_status || "Scheduled"
                                                );

                                                return (
                                                    <div
                                                        className="grid grid-cols-[48px_minmax(120px,1fr)_minmax(180px,auto)_auto] max-[1200px]:grid-cols-[48px_minmax(120px,1fr)_minmax(150px,auto)_auto] max-[760px]:grid-cols-[43px_minmax(0,1fr)_auto] items-center gap-[11px] max-[760px]:gap-[8px] border border-[#edf0e9] rounded-[12px] p-[9px]"
                                                        key={session.uuid}
                                                    >
                                                        <div className="h-[46px] rounded-[10px] bg-[#edf5e5] flex flex-col items-center justify-center text-[#326a42]">
                                                            <b className="text-[15px] font-bold leading-none">
                                                                {date
                                                                    ? date.toLocaleDateString(
                                                                        "en-IN",
                                                                        { day: "2-digit" }
                                                                    )
                                                                    : "—"}
                                                            </b>
                                                            <span className="text-[9px] mt-[3px]">
                                                                {date
                                                                    ? date.toLocaleDateString(
                                                                        "en-IN",
                                                                        { month: "short" }
                                                                    )
                                                                    : "TBD"}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-col gap-[4px] min-w-0">
                                                            <b className="text-[11px] font-bold text-[#33483a] whitespace-nowrap overflow-hidden text-ellipsis">
                                                                {titleCase(
                                                                    session.procedure_type ||
                                                                    session.subtype ||
                                                                    "Panchakarma Therapy"
                                                                )}
                                                            </b>
                                                            <span className="text-[9px] text-[#8b968d] whitespace-nowrap overflow-hidden text-ellipsis">
                                                                {session.treatment_details ||
                                                                    "Prescribed therapy"}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-[14px_auto] items-center gap-[4px_6px] text-[9px] text-[#78867b] max-[760px]:col-start-2 max-[760px]:row-start-2">
                                                            <CalendarDays size={14} className="text-[#648b6b]" />
                                                            <span>
                                                                {formatDate(session.appointment_start)}
                                                            </span>
                                                            <Clock3 size={14} className="text-[#648b6b]" />
                                                            <span>
                                                                {formatTime(session.appointment_start)}
                                                            </span>
                                                        </div>

                                                        <span
                                                            className={`text-[9px] font-bold px-[9px] py-[6px] rounded-[20px] whitespace-nowrap max-[760px]:col-start-3 max-[760px]:row-start-1 ${
                                                                status.toLowerCase().includes("pending")
                                                                    ? "bg-[#fff0d9] text-[#a77829]"
                                                                    : status.toLowerCase().includes("progress")
                                                                    ? "bg-[#e9f0fc] text-[#5078b7]"
                                                                    : "bg-[#e5f3e5] text-[#367448]"
                                                            }`}
                                                        >
                                                            {status}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="min-h-[190px] flex flex-col items-center justify-center text-center p-[7px_10px_2px] gap-[3px]">

                                            {/* CALENDAR ONLY - NO LEAVES */}
                                            <div
                                                className="w-[156px] h-[104px] mb-[6px] rounded-full bg-[radial-gradient(ellipse,#f0f6e6_0%,#f0f6e6_58%,transparent_59%)] text-[#72a25c] grid place-items-center"
                                                aria-hidden="true"
                                            >
                                                <svg
                                                    viewBox="0 0 150 105"
                                                    className="w-[150px] h-[105px] overflow-visible"
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

                                            <b className="font-['Playfair_Display',Georgia,serif] text-[19px] font-bold text-[#102f22]">No upcoming sessions scheduled</b>

                                            <p className="text-[13px] text-[#273c31] my-[4px]">
                                                You don't have any approved appointments yet.
                                            </p>

                                            <small className="text-[11px] text-[#87938a] max-w-[430px] leading-[1.5]">
                                                You can request a session, and your practitioner
                                                will review and schedule it.
                                            </small>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center mt-0 gap-[8px]">
                                        <button
                                            className="flex items-center justify-center gap-[9px] bg-[#075536] hover:bg-[#06452e] text-white border-0 rounded-[12px] min-h-[43px] px-[22px] py-[11px] font-['DM_Sans',sans-serif] text-[13px] font-bold shadow-[0_4px_10px_#07553620] cursor-pointer transition-colors"
                                            onClick={requestSession}
                                        >
                                            <Plus size={17} />
                                            Request a Session
                                        </button>

                                        {requestNotice && (
                                            <p className="text-[10px] text-[#8a6b36] text-center m-0">
                                                Please contact your practitioner to request
                                                a session. They will review and approve
                                                your appointment.
                                            </p>
                                        )}
                                    </div>
                                </article>

                                {/* CARE PROGRESS */}
                                <article className="bg-white border border-[#e6ebe3] rounded-[16px] p-[19px_20px] max-[760px]:p-[14px] shadow-[0_4px_14px_#193c260a] min-w-0 min-h-[305px] max-[1200px]:min-h-0">

                                    <CardHeading
                                        icon="chart"
                                        title="My Care Progress"
                                        subtitle="Overall treatment completion"
                                        action="View Details"
                                        onAction={() => onNavigate("progress")}
                                    />

                                    <div className="flex items-center justify-center gap-[28px] max-[760px]:gap-[14px] max-[420px]:flex-col p-[8px_5px_15px]">
                                        <div
                                            className="w-[150px] h-[150px] shrink-0 max-[760px]:w-[125px] max-[760px]:h-[125px] rounded-full grid place-items-center"
                                            style={{ background: `conic-gradient(#21804b ${progress}%, #e9eee7 0)` }}
                                        >
                                            <div className="w-[124px] h-[124px] max-[760px]:w-[101px] max-[760px]:h-[101px] rounded-full bg-white flex flex-col items-center justify-center gap-[3px]">
                                                <b className="font-['Playfair_Display',Georgia,serif] text-[36px] max-[760px]:text-[26px] font-extrabold text-[#073d2a] leading-none">{progress}%</b>
                                                <span className="text-[10px] text-[#87948a]">Completed</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-[13px] min-w-0 flex-1 max-[420px]:w-full">
                                            <p className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-[9px] m-0 text-[12px] text-[#718075]">
                                                <i className="w-[8px] h-[8px] rounded-full bg-[#25834f] not-italic" />
                                                Completed Sessions
                                                <b className="text-[12px] text-[#34493a] font-bold">
                                                    {completedCount}
                                                    {totalPrescribed
                                                        ? ` / ${totalPrescribed}`
                                                        : ""}
                                                </b>
                                            </p>

                                            <p className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-[9px] m-0 text-[12px] text-[#718075]">
                                                <i className="w-[8px] h-[8px] rounded-full bg-[#5a8bd0] not-italic" />
                                                Scheduled / Ongoing
                                                <b className="text-[12px] text-[#34493a] font-bold">{upcoming.length}</b>
                                            </p>

                                            <p className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-[9px] m-0 text-[12px] text-[#718075]">
                                                <i className="w-[8px] h-[8px] rounded-full bg-[#c9d0c8] not-italic" />
                                                Remaining
                                                <b className="text-[12px] text-[#34493a] font-bold">
                                                    {Math.max(
                                                        0,
                                                        totalPrescribed - completedCount
                                                    )}
                                                </b>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-[9px] p-[11px_13px] bg-[#f0f6e8] rounded-[9px] text-[#56704f] text-[11px] leading-[1.5]">
                                        <Info size={17} className="shrink-0" />
                                        {totalPrescribed
                                            ? `You have completed ${completedCount} of ${totalPrescribed} prescribed sessions (${progress}%).`
                                            : "Your progress will update as your care team records completed sessions."}
                                    </div>
                                </article>

                            </section>

                            {/* QUICK ACTIONS */}
                            <section className="bg-white border border-[#e6ebe3] rounded-[16px] shadow-[0_4px_14px_#193c260a] min-w-0 grid grid-cols-[minmax(250px,1.2fr)_repeat(3,minmax(170px,1fr))] max-[1200px]:grid-cols-2 max-[760px]:grid-cols-1 items-center gap-[15px] min-h-[96px] p-[14px_20px] mb-[2px] relative overflow-hidden">

                                <div className="flex items-center gap-[12px] min-w-0 max-[1200px]:col-span-2 max-[760px]:col-auto">
                                    <div className="w-[39px] h-[39px] rounded-[12px] bg-[#eaf3e2] text-[#347448] grid place-items-center shrink-0">
                                        <AyurDharaIcon name="bolt" size={25} />
                                    </div>

                                    <div>
                                        <h2 className="font-['Playfair_Display',serif] text-[20px] font-bold m-[0_0_4px] text-[#183b29]">Quick Actions</h2>
                                        <p className="text-[11px] text-[#78867c] m-0">Frequently used features for your care</p>
                                    </div>
                                </div>

                                <button
                                    className="min-h-[58px] max-[760px]:min-h-[52px] flex items-center gap-[12px] p-[12px_16px] rounded-[13px] border text-[13px] font-bold shadow-[0_3px_8px_#173b2610] cursor-pointer hover:-translate-y-px transition-transform bg-[linear-gradient(110deg,#f4f8e9,#edf5df)] text-[#315f31] border-[#e1ebd2]"
                                    onClick={() => onNavigate("treatments")}
                                >
                                    <AyurDharaIcon name="clipboard" size={25} />
                                    <span className="flex-1 text-left">View Treatment Plan</span>
                                    <ArrowRight size={18} />
                                </button>

                                <button
                                    className="min-h-[58px] max-[760px]:min-h-[52px] flex items-center gap-[12px] p-[12px_16px] rounded-[13px] border text-[13px] font-bold shadow-[0_3px_8px_#173b2610] cursor-pointer hover:-translate-y-px transition-transform bg-[linear-gradient(110deg,#f1f6ff,#e8f1ff)] text-[#2767b5] border-[#dce8fb]"
                                    onClick={() => onNavigate("sessions")}
                                >
                                    <AyurDharaIcon name="calendar" size={24} />
                                    <span className="flex-1 text-left">My Sessions</span>
                                    <ArrowRight size={18} />
                                </button>

                                <button
                                    className="min-h-[58px] max-[760px]:min-h-[52px] flex items-center gap-[12px] p-[12px_16px] rounded-[13px] border text-[13px] font-bold shadow-[0_3px_8px_#173b2610] cursor-pointer hover:-translate-y-px transition-transform bg-[linear-gradient(110deg,#fff9ed,#fff4df)] text-[#a66b13] border-[#f4e8cf]"
                                    onClick={() => onNavigate("progress")}
                                >
                                    <AyurDharaIcon name="chart" size={24} />
                                    <span className="flex-1 text-left">Track Progress</span>
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
                        <section className="bg-white border border-[#e6ebe3] rounded-[16px] p-[19px_20px] shadow-[0_4px_14px_#193c260a] min-h-[190px] flex flex-col items-center justify-center text-center">
                            <div className="w-[156px] h-[104px] mb-[6px] rounded-full bg-[radial-gradient(ellipse,#f0f6e6_0%,#f0f6e6_58%,transparent_59%)] text-[#72a25c] grid place-items-center">
                                <Sparkles size={28} className="text-[#72a25c]" />
                            </div>
                            <h2 className="font-['Playfair_Display',serif] text-[21px] font-bold text-[#1c3829] mb-[4px]">Care information</h2>
                            <p className="text-[13px] text-[#728076] m-0">This section will display information when it becomes available.</p>
                        </section>
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
            <section className="relative flex items-center justify-between min-h-[170px] max-[760px]:min-h-[155px] p-[28px_38px] max-[760px]:p-[23px_22px] overflow-hidden isolate rounded-[16px] bg-[linear-gradient(90deg,rgba(6,75,50,.98),rgba(6,75,50,.88)_52%,rgba(6,75,50,.35)),url('/ayurdhara-panchakarma-hero.png')] bg-cover bg-[center_56%] max-[760px]:bg-[64%_center] no-repeat shadow-[0_7px_20px_rgba(18,64,42,.08)]">
                <div className="relative z-1">
                    <span className="block mb-[8px] text-[#769080] text-[10px] font-extrabold tracking-[0.19em] uppercase">YOUR AYURDHARA ACCOUNT</span>
                    <h1 className="m-[0_0_8px] text-white font-['Playfair_Display',Georgia,serif] text-[clamp(29px,2.5vw,40px)] font-bold leading-[1.12]">My Profile</h1>
                    <p className="m-0 text-[#f0f6ed] text-[14px] max-[760px]:text-[12px] leading-[1.55] max-[760px]:max-w-[85%]">View your registered details and personal information.</p>
                </div>
                <div className="text-[#dce9bb] opacity-40 pr-[5%] max-[760px]:pr-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                    <Sparkles size={60} strokeWidth={1.4} />
                </div>
            </section>

            <section className="grid grid-cols-4 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-2 gap-[13px] max-[640px]:gap-[9px] w-full" aria-label="Profile summary">
                {stats.map((stat) => (
                    <article className="flex items-center max-[420px]:flex-col max-[420px]:items-start gap-[13px] max-[640px]:gap-[9px] min-w-0 min-h-[94px] max-[640px]:min-h-[82px] p-[14px_15px] max-[640px]:p-[11px] border border-[#e7ece4] rounded-[15px] bg-white shadow-[0_4px_15px_rgba(30,66,43,.055)]" key={stat.label}>
                        <span className={`grid place-items-center shrink-0 w-[48px] h-[48px] max-[640px]:w-[42px] max-[640px]:h-[42px] rounded-[15px] max-[640px]:rounded-[13px] text-[22px] max-[640px]:text-[20px] font-bold ${
                            stat.tone === "green"
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
