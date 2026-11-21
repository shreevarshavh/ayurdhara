import React from "react";
import { LogOut, X } from "lucide-react";
import { ROLE_NAVIGATION, normalizeRole } from "../../config/navigation";

export default function Sidebar({
    user,
    role = "patient",
    page = "dashboard",
    onNavigate = () => { },
    onLogout = () => { },
    notificationsCount = 0,
    mobileNavOpen = false,
    setMobileNavOpen = () => { },
}) {
    const roleKey = normalizeRole(role || user?.role);
    const navGroups = ROLE_NAVIGATION[roleKey] || ROLE_NAVIGATION.patient;
    const name = user?.name || "User";
    const firstName = name.trim().split(/\s+/)[0] || "User";

    const roleLabels = {
        patient: "Patient",
        therapist: "Therapist",
        doctor: "Practitioner",
        admin: "Administrator",
    };

    return (
        <>
            <aside className={`patient-sidebar ${mobileNavOpen ? "is-open" : ""}`}>
                <div className="patient-brand">
                    <div className="patient-brand-mark">
                        <span className="brand-letter">A</span>
                    </div>
                    <div>
                        <strong>AYURDHARA</strong>
                        <span>Panchakarma Care</span>
                    </div>
                    <button
                        type="button"
                        className="patient-mobile-close"
                        onClick={() => setMobileNavOpen(false)}
                        aria-label="Close menu"
                    >
                        <X />
                    </button>
                </div>

                <div className="patient-user-chip">
                    <div className="patient-avatar">{firstName.charAt(0).toUpperCase()}</div>
                    <div>
                        <b>{name}</b>
                        <span>{roleLabels[roleKey]}</span>
                    </div>
                    <i />
                </div>

                <nav className="patient-nav" aria-label={`${roleLabels[roleKey]} navigation`}>
                    {navGroups.map((group) => (
                        <section key={group.title}>
                            <h3>{group.title}</h3>
                            {group.items.map(({ label, icon: Icon, page: navPage }) => (
                                <button
                                    type="button"
                                    key={navPage}
                                    className={`patient-nav-item ${page === navPage ? "active" : ""}`}
                                    aria-current={page === navPage ? "page" : undefined}
                                    onClick={() => {
                                        onNavigate(navPage);
                                        setMobileNavOpen(false);
                                    }}
                                >
                                    <Icon size={19} strokeWidth={1.8} />
                                    <span>{label}</span>
                                    {label === "Notifications" && notificationsCount > 0 && (
                                        <em>{notificationsCount}</em>
                                    )}
                                </button>
                            ))}
                        </section>
                    ))}
                </nav>

                <div className="patient-sidebar-art" aria-hidden="true">
                    <svg className="patient-sidebar-waves" viewBox="0 0 320 190" preserveAspectRatio="none">
                        <path d="M0 105 C65 55 102 115 165 85 S260 40 320 0 L320 190 L0 190Z" />
                        <path d="M0 130 C70 80 115 145 185 112 S270 82 320 40" />
                        <path d="M0 151 C72 103 120 163 195 132 S270 103 320 68" />
                    </svg>
                </div>

                <button type="button" className="patient-signout" onClick={onLogout}>
                    <LogOut size={18} />
                    <span>Sign out</span>
                </button>
            </aside>

            {mobileNavOpen && (
                <button
                    type="button"
                    className="patient-nav-scrim"
                    onClick={() => setMobileNavOpen(false)}
                    aria-label="Close navigation"
                />
            )}
        </>
    );
}
