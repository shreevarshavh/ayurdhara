
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", group: "Overview", roles: ["admin", "doctor", "therapist", "patient"] },
  { id: "profile", label: "My Profile", icon: "profile", group: "Overview", roles: ["patient"] },
  { id: "patients", label: "Patients", icon: "patients", group: "Care", roles: ["admin", "doctor"] },
  { id: "treatments", label: "Treatment plans", icon: "treatments", group: "Care", roles: ["admin", "doctor", "therapist", "patient"] },
  { id: "schedule", label: "Scheduling", icon: "schedule", group: "Care", roles: ["admin", "doctor", "therapist"] },
  { id: "sessions", label: "Sessions", icon: "sessions", group: "Care", roles: ["admin", "doctor", "therapist", "patient"] },
  { id: "progress", label: "Progress tracking", icon: "progress", group: "Care", roles: ["admin", "doctor", "patient"] },
  { id: "vitals", label: "Vitals & Symptoms", icon: "vitals", group: "Care", roles: ["patient"] },
  { id: "alerts", label: "Emergency alerts", icon: "alerts", group: "Coordination", roles: ["admin", "doctor", "therapist"] },
  { id: "reports", label: "Reports", icon: "reports", group: "Coordination", roles: ["admin", "doctor"] },
  { id: "notifications", label: "Notifications", icon: "notifications", group: "Coordination", roles: ["admin", "doctor", "therapist", "patient"] },
  { id: "help", label: "Help & FAQs", icon: "help", group: "Coordination", roles: ["patient"] },
  { id: "users", label: "User management", icon: "users", group: "Administration", roles: ["admin"] }
];

const fmtDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "Not scheduled";

const fmtTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";

const shortId = (value) =>
  value ? `${String(value).slice(0, 8)}…` : "—";

const fullName = (user) =>
  user?.name || user?.patient_name || "Patient";

const normalizeRole = (role) =>
  String(role || "").toLowerCase();

export {
  NAV,
  fmtDate,
  fmtTime,
  shortId,
  fullName,
  normalizeRole
};
