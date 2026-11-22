import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import "../../styles/layout.css";
import "../../styles/patient-dashboard.css";

const PAGE_HERO = {
    patients: {
        eyebrow: "PATIENT MANAGEMENT",
        title: "Patients",
        description: "View and manage patient records and care information."
    },
    doctors: {
        eyebrow: "PRACTITIONER MANAGEMENT",
        title: "Practitioners",
        description: "Manage practitioners and their clinical responsibilities."
    },
    therapists: {
        eyebrow: "CARE TEAM",
        title: "Therapists",
        description: "Manage therapists and their assigned responsibilities."
    },
    treatments: {
        eyebrow: "CARE PLANNING",
        title: "Treatment Plans",
        description: "Review treatment records and manage prescribed care."
    },
    sessions: {
        eyebrow: "SESSION DELIVERY",
        title: "Sessions",
        description: "Manage Panchakarma sessions and treatment activities."
    },
    progress: {
        eyebrow: "OUTCOME MONITORING",
        title: "Progress Tracking",
        description: "Monitor treatment progress and patient outcomes."
    },
    alerts: {
        eyebrow: "PATIENT SAFETY",
        title: "Emergency Alerts",
        description: "Monitor and respond to patient incidents during therapy."
    },
    reports: {
        eyebrow: "CARE INSIGHTS",
        title: "Reports",
        description: "Review treatment outcomes and healthcare activity."
    },
    notifications: {
        eyebrow: "CARE TEAM UPDATES",
        title: "Notifications",
        description: "Stay updated with important care and system activities."
    },
    users: {
        eyebrow: "SYSTEM MANAGEMENT",
        title: "User Management",
        description: "Manage user accounts and access permissions."
    },
    schedule: {
        eyebrow: "APPOINTMENT MANAGEMENT",
        title: "Scheduling",
        description: "Organize appointments, therapists and treatment resources."
    },
    assessments: {
        eyebrow: "CLINICAL ASSESSMENT",
        title: "Patient Assessments",
        description: "Review patient assessments and Ayurvedic health information."
    },
    settings: {
        eyebrow: "WORKSPACE CONFIGURATION",
        title: "Settings",
        description: "Manage your AyurDhara workspace preferences."
    }
};

const ROLE_LABELS = {
    patient: "Patient",
    therapist: "Therapist",
    doctor: "Practitioner",
    practitioner: "Practitioner",
    admin: "Administrator"
};

export default function DashboardLayout({
    user,
    role,
    page,
    onNavigate,
    onLogout,
    notificationsCount,
    children
}) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const normalizedRole = String(role || "").toLowerCase();

    const isDashboard = page === "dashboard";

    const roleLabel = ROLE_LABELS[normalizedRole] || "Practitioner";

    const hero = PAGE_HERO[page] || {
        eyebrow: `${roleLabel.toUpperCase()} WORKSPACE`,
        title: "Care Management",
        description: "Manage your AyurDhara workspace."
    };

    return (
        <div className="patient-workspace">

            <Sidebar
                user={user}
                role={role}
                page={page}
                onNavigate={onNavigate}
                onLogout={onLogout}
                notificationsCount={notificationsCount}
                mobileNavOpen={mobileNavOpen}
                setMobileNavOpen={setMobileNavOpen}
            />

            <main className="patient-main">

                <Topbar
                    user={user}
                    role={role}
                    page={page}
                    onNavigate={onNavigate}
                    notificationsCount={notificationsCount}
                    onMenuClick={() => setMobileNavOpen(true)}
                />

                <div className="patient-page">
                    {children.props?.notice && (
                        <div className={`toast ${children.props.notice.type}`}>
                            {children.props.notice.message}
                        </div>
                    )}

                    {isDashboard ? (
                        /* DARK HERO FOR DASHBOARDS */
                        <section className="patient-hero">
                            <div className="patient-hero-copy">
                                <span>
                                    YOUR {roleLabel.toUpperCase()} WORKSPACE
                                </span>

                                <h1>{roleLabel} Dashboard ✦</h1>

                                <p>
                                    Manage Panchakarma care, treatment
                                    activities, and patient progress.
                                </p>
                            </div>

                            <img
                                className="patient-hero-art-image"
                                src="/ayurdhara-panchakarma-hero.png"
                                alt=""
                                aria-hidden="true"
                            />
                        </section>
                    ) : (
                        /* STANDARD LIGHT HERO FOR ALL OTHER PAGES */
                        <section className="patient-page-hero patient-page-hero-light">
                            <div className="patient-page-hero-copy">
                                <span>{hero.eyebrow}</span>
                                <h1>{hero.title}</h1>
                                <p>{hero.description}</p>
                            </div>
                        </section>
                    )}

                    {children}
                </div>
            </main >
        </div >
    );
}