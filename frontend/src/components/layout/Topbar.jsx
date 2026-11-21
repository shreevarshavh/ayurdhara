import React from "react";
import {
    Bell,
    ChevronDown,
    Menu
} from "lucide-react";

const PAGE_TITLES = {
    dashboard: {
        patient: "Patient Dashboard",
        therapist: "Therapist Dashboard",
        doctor: "Practitioner Dashboard",
        admin: "Admin Dashboard"
    },
    profile: "My Profile",
    treatments: "Treatment plans",
    sessions: "Sessions",
    progress: "Progress tracking",
    vitals: "Vitals & Symptoms",
    notifications: "Notifications",
    help: "Help & FAQs",
    patients: "Patients",
    doctors: "Practitioners",
    therapists: "Therapists",
    users: "User Management",
    schedule: "Scheduling",
    alerts: "Emergency Alerts",
    reports: "Reports",
    assessments: "Assessments",
    settings: "Settings"
};

const ROLE_LABELS = {
    patient: "Patient",
    therapist: "Therapist",
    doctor: "Practitioner",
    practitioner: "Practitioner",
    admin: "Administrator"
};

export default function Topbar({
    user,
    role = "patient",
    page = "dashboard",
    onNavigate = () => { },
    notificationsCount = 0,
    onMenuClick = () => { }
}) {
    const normalizedRole = String(role).toLowerCase();

    const roleLabel = ROLE_LABELS[normalizedRole] || "Patient";

    const displayName = user?.name || roleLabel;

    const firstName = displayName.split(" ")[0];

    const pageTitle =
        typeof PAGE_TITLES[page] === "object"
            ? PAGE_TITLES[page][normalizedRole] || "Dashboard"
            : PAGE_TITLES[page] || "Dashboard";

    return (
        <header className="patient-topbar">

            {/* MOBILE MENU */}
            <button
                className="patient-menu-toggle"
                onClick={onMenuClick}
                aria-label="Open menu"
            >
                <Menu />
            </button>

            {/* BREADCRUMB */}
            <div className="patient-breadcrumb">
                AYURDHARA <span>/</span> <b>{pageTitle}</b>
            </div>

            {/* TOP ACTIONS */}
            <div className="patient-top-actions">

                <span className="patient-today">
                    {new Date().toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    })}
                </span>

                {/* NOTIFICATIONS */}
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

                {/* USER */}
                <div className="patient-top-user">

                    <div className="patient-avatar">
                        {firstName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <b>{displayName}</b>
                        <span>{roleLabel}</span>
                    </div>

                    <ChevronDown size={16} />

                </div>

            </div>
        </header>
    );
}