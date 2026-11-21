import {
    Home,
    UserRound,
    Users,
    ClipboardList,
    CalendarDays,
    ChartNoAxesColumnIncreasing,
    HeartPulse,
    Bell,
    Info,
    ShieldAlert,
    FileText,
} from "lucide-react";

// Navigation menus for each user role
export const ROLE_NAVIGATION = {
    patient: [
        {
            title: "OVERVIEW",
            items: [
                { label: "Dashboard", page: "dashboard", icon: Home },
                { label: "My Profile", page: "profile", icon: UserRound },
            ],
        },
        {
            title: "MY CARE",
            items: [
                { label: "Treatment Plans", page: "treatments", icon: ClipboardList },
                { label: "Sessions", page: "sessions", icon: CalendarDays },
                { label: "Progress Tracking", page: "progress", icon: ChartNoAxesColumnIncreasing },
                { label: "Vitals & Symptoms", page: "vitals", icon: HeartPulse },
            ],
        },
        {
            title: "SUPPORT",
            items: [
                { label: "Notifications", page: "notifications", icon: Bell },
                { label: "Help & FAQs", page: "help", icon: Info },
            ],
        },
    ],

    therapist: [
        {
            title: "OVERVIEW",
            items: [
                { label: "Dashboard", page: "dashboard", icon: Home },
            ],
        },
        {
            title: "MY WORK",
            items: [
                { label: "Assigned Treatments", page: "treatments", icon: ClipboardList },
                { label: "Sessions", page: "sessions", icon: CalendarDays },
                { label: "Progress Tracking", page: "progress", icon: ChartNoAxesColumnIncreasing },
                { label: "Emergency Alerts", page: "alerts", icon: ShieldAlert },
            ],
        },
        {
            title: "SUPPORT",
            items: [
                { label: "Notifications", page: "notifications", icon: Bell },
            ],
        },
    ],

    doctor: [
        {
            title: "OVERVIEW",
            items: [
                { label: "Dashboard", page: "dashboard", icon: Home },
                { label: "Patients", page: "patients", icon: Users },
            ],
        },

        {
            title: "CLINICAL MANAGEMENT",
            items: [
                { label: "Treatment Plans", page: "treatments", icon: ClipboardList },
                { label: "Sessions", page: "sessions", icon: CalendarDays },
                { label: "Progress Tracking", page: "progress", icon: ChartNoAxesColumnIncreasing },
                { label: "Progress Reports", page: "reports", icon: FileText },
                { label: "Emergency Alerts", page: "alerts", icon: ShieldAlert },
                {
                    label: "Scheduling",
                    page: "schedule",
                    icon: CalendarDays
                },
            ],

        },
        {
            title: "SUPPORT",
            items: [
                { label: "Notifications", page: "notifications", icon: Bell },
            ],
        },
    ],

    admin: [
        {
            title: "OVERVIEW",
            items: [
                { label: "Dashboard", page: "dashboard", icon: Home },
            ],
        },
        {
            title: "CENTRE MANAGEMENT",
            items: [
                { label: "Patients", page: "patients", icon: UserRound },
                { label: "Treatment Management", page: "treatments", icon: ClipboardList },
                { label: "Scheduling", page: "schedule", icon: CalendarDays },
                { label: "Sessions", page: "sessions", icon: CalendarDays },
            ],
        },
        {
            title: "REPORTS & USERS",
            items: [
                { label: "Progress Tracking", page: "progress", icon: ChartNoAxesColumnIncreasing },
                { label: "Emergency Alerts", page: "alerts", icon: ShieldAlert },
                { label: "Reports", page: "reports", icon: FileText },
                { label: "User Management", page: "users", icon: Users },
                { label: "Notifications", page: "notifications", icon: Bell },
            ],
        },
    ],
};

// Normalize user roles
export function normalizeRole(role) {
    const value = String(role || "patient").trim().toLowerCase();

    if (value === "practitioner") {
        return "doctor";
    }

    if (["patient", "therapist", "doctor", "admin"].includes(value)) {
        return value;
    }

    return "patient";
}

// Get available pages for a particular role
export function getRolePageIds(role) {
    return (
        ROLE_NAVIGATION[normalizeRole(role)] ||
        ROLE_NAVIGATION.patient
    ).flatMap(group =>
        group.items.map(item => item.page)
    );
}