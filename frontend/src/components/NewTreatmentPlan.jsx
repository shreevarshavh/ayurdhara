import React, { useMemo, useState } from "react";
import api from "../services/api";
import { fmtDate, fmtTime, shortId } from "../utils";
import { PageHeading, Empty, Status, SearchBox } from "./Pages";

// Canonical Panchakarma treatments in traditional Ayurveda
const CANONICAL_TREATMENTS = [
  {
    name: "Vamana",
    category: "Pradhana Karma (Emesis)",
    description: "Therapeutic emesis for expelling aggravated Kapha dosha and respiratory/metabolic toxins."
  },
  {
    name: "Virechana",
    category: "Pradhana Karma (Purgation)",
    description: "Therapeutic purgation for Pitta-dominant disorders, liver cleansing, and systemic detoxification."
  },
  {
    name: "Basti",
    category: "Pradhana Karma (Enema)",
    description: "Medicated oil/decoction enemas targeting Vata dosha, neuromuscular conditions, and colon health."
  },
  {
    name: "Nasya",
    category: "Pradhana Karma (Nasal)",
    description: "Nasal administration of medicated oils/herbs for clavicular, cranial, and neurological balance."
  },
  {
    name: "Raktamokshana",
    category: "Pradhana Karma (Bloodletting)",
    description: "Traditional blood purification therapy for localized Pitta/Rakta vitiations and dermatological conditions."
  },
  {
    name: "Shirodhara",
    category: "Allied / Upakarma",
    description: "Continuous rhythmic pouring of warm herbal oil over the forehead for nervous system calming and insomnia."
  },
  {
    name: "Abhyanga",
    category: "Allied / Purvakarma",
    description: "Full-body synchronization massage with customized herbal oils to promote circulation and tissue nourishment."
  },
  {
    name: "Swedana",
    category: "Allied / Purvakarma",
    description: "Herbal steam sudation therapy to liquefy toxins, improve mobility, and relieve musculoskeletal stiffness."
  },
  {
    name: "Udvartana",
    category: "Allied / Upakarma",
    description: "Deep tissue herbal dry powder massage for lymphatic drainage, metabolism enhancement, and Kapha reduction."
  },
  {
    name: "Pinda Sweda (Kizhi)",
    category: "Allied / Upakarma",
    description: "Fomentation therapy utilizing warm herbal boluses (potli) for joint pain, inflammation, and stiffness."
  }
];

const PRIORITY_LEVELS = [
  { value: 1, label: "1 — Very Low", urgency: "Elective / Maintenance", meaning: "Routine follow-up or long-term preventive care with no immediate scheduling urgency." },
  { value: 2, label: "2 — Low", urgency: "Mild / Non-urgent", meaning: "Mild discomfort or chronic condition requiring regular attention when schedule allows." },
  { value: 3, label: "3 — Medium", urgency: "Standard Care (Default)", meaning: "Active clinical care plan requiring timely appointment booking within normal clinic turnaround." },
  { value: 4, label: "4 — High", urgency: "High Urgency", meaning: "Acute flare-up or severe symptoms requiring prioritized scheduling within the next 24–48 hours." },
  { value: 5, label: "5 — Very High", urgency: "Highest Urgency", meaning: "Critical Panchakarma intervention requiring the earliest feasible appointment slot." }
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function NewTreatmentPlan({
  user,
  patients = [],
  treatments = [],
  therapists = [],
  onBack,
  onSuccess,
  flash
}) {
  const role = String(user?.role || "").toLowerCase();
  const isDoctorOrAdmin = ["doctor", "admin"].includes(role);

  // Form State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");

  const [diseaseDescription, setDiseaseDescription] = useState("");
  const [symptomsObservations, setSymptomsObservations] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [selectedTreatment, setSelectedTreatment] = useState("");
  const [priority, setPriority] = useState(3);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [appointmentStart, setAppointmentStart] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // 1. Available Treatments: Dynamically merged from database records, therapist expertise, and canonical therapies
  const availableTreatments = useMemo(() => {
    const map = new Map();

    // Seed with canonical Panchakarma treatments
    CANONICAL_TREATMENTS.forEach((t) => {
      map.set(t.name.toLowerCase(), t);
    });

    // Merge treatments existing in treatment plans database
    treatments.forEach((t) => {
      const name = (t.treatment_name || t.p1 || "").trim();
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), {
          name,
          category: "Clinic Care Record",
          description: t.treatment_requirements || "Prescribed in clinic records."
        });
      }
    });

    // Merge expertise and specializations from therapist records
    therapists.forEach((th) => {
      if (Array.isArray(th.expertise)) {
        th.expertise.forEach((exp) => {
          const expTrimmed = String(exp || "").trim();
          if (expTrimmed && !map.has(expTrimmed.toLowerCase())) {
            map.set(expTrimmed.toLowerCase(), {
              name: expTrimmed,
              category: "Therapist Expertise",
              description: `Specialized procedure offered by ${th.name}.`
            });
          }
        });
      }
      if (th.specialization) {
        const spec = String(th.specialization).trim();
        if (spec && !map.has(spec.toLowerCase())) {
          map.set(spec.toLowerCase(), {
            name: spec,
            category: "Therapist Specialization",
            description: `Clinical focus area recorded for ${th.name}.`
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [treatments, therapists]);

  // 2. Patient search filter
  const filteredPatients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    if (!q) return patients.slice(0, 8);
    return patients.filter((p) => {
      const idMatch = String(p.patient_id || "").toLowerCase().includes(q);
      const nameMatch = String(p.name || "").toLowerCase().includes(q);
      const emailMatch = String(p.email || "").toLowerCase().includes(q);
      const phoneMatch = String(p.phone_number || "").toLowerCase().includes(q);
      return idMatch || nameMatch || emailMatch || phoneMatch;
    });
  }, [patients, patientSearch]);

  // 3. Therapist Ranking by Panchakarma Expertise and Availability
  const rankedTherapists = useMemo(() => {
    if (!therapists || !therapists.length) return [];

    const normTreatment = selectedTreatment.trim().toLowerCase();

    return therapists
      .map((th) => {
        let matchScore = 0;
        let matchType = "none";
        let matchReason = "";

        const expList = Array.isArray(th.expertise)
          ? th.expertise.map((e) => String(e).trim().toLowerCase())
          : [];
        const spec = String(th.specialization || "").trim().toLowerCase();

        const hasAnyExpertiseRecorded = expList.length > 0 || Boolean(th.specialization);

        if (normTreatment) {
          // Direct expertise array match
          const directMatch = expList.some(
            (exp) => exp === normTreatment || exp.includes(normTreatment) || normTreatment.includes(exp)
          );

          // Specialization string match
          const specMatch = spec && (spec.includes(normTreatment) || normTreatment.includes(spec));

          if (directMatch) {
            matchScore = 100 + (Number(th.experience_years) || 0) * 2;
            matchType = "direct";
            matchReason = `Direct Expertise Match: Recorded in ${th.name}'s verified expertise keywords.`;
          } else if (specMatch) {
            matchScore = 70 + (Number(th.experience_years) || 0) * 2;
            matchType = "specialization";
            matchReason = `Specialization Match: Aligns with ${th.name}'s focus area (${th.specialization}).`;
          } else if (hasAnyExpertiseRecorded) {
            matchScore = 30 + (Number(th.experience_years) || 0);
            matchType = "general";
            matchReason = `General Qualifications: Experienced therapist with other Panchakarma procedures.`;
          } else {
            matchScore = 10;
            matchType = "unspecified";
            matchReason = "Reliable expertise match cannot be determined (no declared expertise keywords).";
          }
        } else {
          matchScore = Number(th.experience_years) || 0;
          matchType = hasAnyExpertiseRecorded ? "general" : "unspecified";
          matchReason = hasAnyExpertiseRecorded
            ? "Select a Panchakarma treatment above to rank by specific expertise."
            : "No declared expertise keywords recorded.";
        }

        // Availability evaluation
        const workDays = Array.isArray(th.work_days) && th.work_days.length ? th.work_days : [1, 2, 3, 4, 5, 6];
        const workStart = th.workday_start || "09:00";
        const workEnd = th.workday_end || "17:00";

        let availabilityStatus = "schedule-known"; // neutral when no appointment date chosen
        let availabilityMessage = `Working days: ${workDays.map((d) => DAY_NAMES[d]).join(", ")}; Hours: ${workStart} – ${workEnd}`;

        if (appointmentStart) {
          const reqDate = new Date(appointmentStart);
          if (!Number.isNaN(reqDate.getTime())) {
            const dayOfWeek = reqDate.getDay();
            const pad = (n) => String(n).padStart(2, "0");
            const reqTime = `${pad(reqDate.getHours())}:${pad(reqDate.getMinutes())}`;
            const endMinutes = reqDate.getHours() * 60 + reqDate.getMinutes() + Number(durationMinutes || 60);
            const reqEndTime = `${pad(Math.floor(endMinutes / 60))}:${pad(endMinutes % 60)}`;

            if (!workDays.includes(dayOfWeek)) {
              availabilityStatus = "off-day";
              availabilityMessage = `Non-working day (${DAY_NAMES[dayOfWeek]} is outside regular clinic schedule)`;
            } else if (reqTime < workStart || reqEndTime > workEnd) {
              availabilityStatus = "outside-hours";
              availabilityMessage = `Outside working hours (${workStart} – ${workEnd})`;
            } else {
              // Check appointment conflict with active treatments
              const reqStartTime = reqDate.getTime();
              const reqEndTimeMs = reqStartTime + Number(durationMinutes || 60) * 60000;

              const hasConflict = treatments.some((t) => {
                if (String(t.therapist_id) !== String(th.therapist_id)) return false;
                if (!t.appointment_start) return false;
                if (["Completed", "Missed"].includes(t.session_status)) return false;

                const tStart = new Date(t.appointment_start).getTime();
                const tEnd = tStart + Number(t.duration_minutes || 60) * 60000;
                return reqStartTime < tEnd && tStart < reqEndTimeMs;
              });

              if (hasConflict) {
                availabilityStatus = "booked";
                availabilityMessage = "Schedule conflict: Already booked for another session at this time.";
              } else {
                availabilityStatus = "available";
                availabilityMessage = "Available for the requested appointment date and time.";
              }
            }
          }
        }

        return {
          ...th,
          matchScore,
          matchType,
          matchReason,
          workDays,
          workStart,
          workEnd,
          availabilityStatus,
          availabilityMessage
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }, [therapists, selectedTreatment, appointmentStart, durationMinutes, treatments]);

  // Form Submission
  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    // Step 8 Validation
    if (!selectedPatient) {
      setFormError("Please select a patient before saving the treatment plan.");
      return;
    }
    if (!diseaseDescription.trim()) {
      setFormError("Please enter the patient's disease description or clinical condition.");
      return;
    }
    if (!selectedTreatment) {
      setFormError("Please select a Panchakarma treatment.");
      return;
    }
    const priorityNum = Number(priority);
    if (!Number.isInteger(priorityNum) || priorityNum < 1 || priorityNum > 5) {
      setFormError("Priority must be an integer between 1 and 5.");
      return;
    }
    const durationNum = Number(durationMinutes);
    if (!Number.isInteger(durationNum) || durationNum < 15 || durationNum > 480) {
      setFormError("Treatment duration must be between 15 and 480 minutes.");
      return;
    }

    if (appointmentStart) {
      const appDate = new Date(appointmentStart);
      if (Number.isNaN(appDate.getTime())) {
        setFormError("Please enter a valid appointment date and time.");
        return;
      }
    }

    // Combine clinical notes
    const clinicalNotes = [
      diseaseDescription.trim() ? `Condition / Disease: ${diseaseDescription.trim()}` : "",
      symptomsObservations.trim() ? `Symptoms & Observations: ${symptomsObservations.trim()}` : "",
      additionalNotes.trim() ? `Additional Notes: ${additionalNotes.trim()}` : ""
    ].filter(Boolean).join("\n\n");

    setSubmitting(true);
    try {
      const payload = {
        patient_id: selectedPatient.patient_id,
        treatment_name: selectedTreatment,
        treatment_requirements: clinicalNotes,
        duration_minutes: durationNum,
        priority: priorityNum,
        therapist_id: selectedTherapist ? selectedTherapist.therapist_id : null,
        appointment_start: appointmentStart ? new Date(appointmentStart).toISOString() : null
      };

      const result = await api("/api/treatment/plans", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      flash?.("success", result.message || "Treatment plan created successfully.");
      if (onSuccess) {
        await onSuccess();
      } else if (onBack) {
        onBack();
      }
    } catch (err) {
      console.error("Save treatment plan error:", err);
      setFormError(err.message || "Failed to save treatment plan. Please check the entered details.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isDoctorOrAdmin) {
    return (
      <div className="panel" style={{ padding: "30px", textAlign: "center" }}>
        <Empty
          icon="⚑"
          title="Access Restricted"
          text="Only doctors and administrators are authorized to prescribe and create new Panchakarma treatment plans."
        />
        <button className="primary-btn" onClick={onBack} style={{ marginTop: "15px" }}>
          ← Back to Treatment Plans
        </button>
      </div>
    );
  }

  return (
    <div className="new-treatment-plan-page">
      <PageHeading
        eyebrow="DOCTOR CARE PLANNING"
        title="New Treatment Plan"
        description="Prescribe a Panchakarma treatment, rank qualified therapists by clinical expertise, and schedule coordinated care."
        action={
          <div className="heading-actions">
            <button type="button" className="outline-btn" onClick={onBack} disabled={submitting}>
              ← Cancel & Back
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={handleSubmit}
              disabled={submitting || !selectedPatient || !selectedTreatment || !diseaseDescription.trim()}
            >
              {submitting ? "Saving plan…" : "✓ Save Treatment Plan"}
            </button>
          </div>
        }
      />

      {formError && (
        <div className="toast error" style={{ position: "relative", marginBottom: "20px", width: "100%" }}>
          <span>!</span>
          <b>Validation Error:</b> {formError}
          <button type="button" onClick={() => setFormError(null)}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="modal-form">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* LEFT COLUMN: Clinical Formulation */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* SECTION 1: Patient Selection */}
            <section className="panel" style={{ padding: "20px" }}>
              <div className="panel-header" style={{ marginBottom: "12px", paddingBottom: "10px" }}>
                <div>
                  <span className="eyebrow" style={{ color: "#366b4d" }}>STEP 1</span>
                  <h2 style={{ fontSize: "16px", margin: "2px 0" }}>Patient Selection</h2>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--muted)" }}>
                    Search and select the patient record for this treatment plan.
                  </p>
                </div>
                {selectedPatient && (
                  <span className="status success" style={{ fontSize: "11px" }}>✓ Patient Selected</span>
                )}
              </div>

              {!selectedPatient ? (
                <div>
                  <SearchBox
                    value={patientSearch}
                    onChange={setPatientSearch}
                    placeholder="Search by patient name, email, or patient ID…"
                  />
                  <div style={{ marginTop: "12px", maxHeight: "250px", overflowY: "auto", border: "1px solid #e7ede5", borderRadius: "8px" }}>
                    {filteredPatients.length === 0 ? (
                      <div style={{ padding: "16px", textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
                        No patients matching "{patientSearch}".
                      </div>
                    ) : (
                      filteredPatients.map((p) => (
                        <div
                          key={p.patient_id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderBottom: "1px solid #f0f4ee",
                            cursor: "pointer",
                            background: "#fff"
                          }}
                          onClick={() => setSelectedPatient(p)}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="table-avatar" style={{ width: "30px", height: "30px", fontSize: "12px" }}>
                              {(p.name || "P").slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <b style={{ fontSize: "13px", color: "#20372f" }}>{p.name}</b>
                              <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                                {p.email || "No email"} · ID: {shortId(p.patient_id)}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="small-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPatient(p);
                            }}
                          >
                            Select →
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ background: "#f8fbf8", border: "1px solid #dbe6dc", borderRadius: "10px", padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <div className="table-avatar" style={{ width: "42px", height: "42px", fontSize: "16px" }}>
                        {(selectedPatient.name || "P").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ margin: "0 0 3px", fontSize: "16px", color: "#19563f" }}>{selectedPatient.name}</h3>
                        <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                          {selectedPatient.email || "No email"} · {selectedPatient.phone_number || "No phone"}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#77847c" }}>
                          Patient ID: <code>{selectedPatient.patient_id}</code>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="outline-btn small-btn"
                      onClick={() => setSelectedPatient(null)}
                      title="Clear patient selection"
                    >
                      Change patient
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "14px", paddingTop: "12px", borderTop: "1px dashed #dce5dc", fontSize: "11px" }}>
                    <div><span style={{ color: "var(--muted)" }}>Height:</span> <b>{selectedPatient.height ? `${selectedPatient.height} cm` : "—"}</b></div>
                    <div><span style={{ color: "var(--muted)" }}>Weight:</span> <b>{selectedPatient.weight ? `${selectedPatient.weight} kg` : "—"}</b></div>
                    <div><span style={{ color: "var(--muted)" }}>Blood Group:</span> <b>{selectedPatient.blood_group || "—"}</b></div>
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 2: Disease Description & Clinical Notes */}
            <section className="panel" style={{ padding: "20px" }}>
              <div className="panel-header" style={{ marginBottom: "12px", paddingBottom: "10px" }}>
                <div>
                  <span className="eyebrow" style={{ color: "#366b4d" }}>STEP 2</span>
                  <h2 style={{ fontSize: "16px", margin: "2px 0" }}>Disease Description & Clinical Observations</h2>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--muted)" }}>
                    Record clinical context, symptoms, and specific treatment requirements.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label htmlFor="disease-desc" style={{ display: "block", marginBottom: "4px" }}>
                    Disease / Condition Description <span style={{ color: "var(--rose)" }}>*</span>
                  </label>
                  <textarea
                    id="disease-desc"
                    rows="3"
                    value={diseaseDescription}
                    onChange={(e) => setDiseaseDescription(e.target.value)}
                    placeholder="Enter the primary clinical diagnosis, chronic condition, or Panchakarma indication (e.g. Amavata / Rheumatoid arthritis, Vata-Kapha imbalance, Sandhigata Vata)..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="symptoms-obs" style={{ display: "block", marginBottom: "4px" }}>
                    Symptoms & Clinical Observations (Optional)
                  </label>
                  <textarea
                    id="symptoms-obs"
                    rows="2"
                    value={symptomsObservations}
                    onChange={(e) => setSymptomsObservations(e.target.value)}
                    placeholder="e.g. Morning joint stiffness, elevated Pitta signs, severe fatigue, sleep disturbance..."
                  />
                </div>

                <div>
                  <label htmlFor="additional-notes" style={{ display: "block", marginBottom: "4px" }}>
                    Specific Treatment Instructions & Precautions (Optional)
                  </label>
                  <textarea
                    id="additional-notes"
                    rows="2"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="e.g. Use warm Mahanarayan oil; monitor pulse pre/post Shirodhara; light diet post procedure..."
                  />
                </div>
              </div>
            </section>

            {/* SECTION 3: Select Panchakarma Treatment & Priority */}
            <section className="panel" style={{ padding: "20px" }}>
              <div className="panel-header" style={{ marginBottom: "12px", paddingBottom: "10px" }}>
                <div>
                  <span className="eyebrow" style={{ color: "#366b4d" }}>STEP 3 & 4</span>
                  <h2 style={{ fontSize: "16px", margin: "2px 0" }}>Panchakarma Procedure & Clinical Priority</h2>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--muted)" }}>
                    Select the prescribed treatment procedure and assign clinical scheduling urgency (1 to 5).
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label htmlFor="treatment-select" style={{ display: "block", marginBottom: "4px" }}>
                    Panchakarma Treatment <span style={{ color: "var(--rose)" }}>*</span>
                  </label>
                  <select
                    id="treatment-select"
                    value={selectedTreatment}
                    onChange={(e) => setSelectedTreatment(e.target.value)}
                    required
                    style={{ fontWeight: "600", color: "#19563f" }}
                  >
                    <option value="">Choose a Panchakarma treatment procedure…</option>
                    {availableTreatments.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>

                  {selectedTreatment && (
                    <div style={{ marginTop: "8px", padding: "10px", background: "#f5f9f5", borderRadius: "8px", fontSize: "11px" }}>
                      <b>✦ Selected Procedure:</b> {selectedTreatment}
                      {availableTreatments.find((t) => t.name === selectedTreatment)?.description && (
                        <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
                          {availableTreatments.find((t) => t.name === selectedTreatment).description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* PRIORITY SELECTION (1 to 5) */}
                <div>
                  <label htmlFor="priority-select" style={{ display: "block", marginBottom: "4px" }}>
                    Treatment Priority (1 to 5) <span style={{ color: "var(--rose)" }}>*</span>
                  </label>
                  <select
                    id="priority-select"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    required
                  >
                    {PRIORITY_LEVELS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label} — {p.urgency}
                      </option>
                    ))}
                  </select>

                  {/* Priority Meaning Banner */}
                  <div style={{ marginTop: "8px", padding: "10px 12px", background: "#fcf9f2", borderLeft: "4px solid #d9a449", borderRadius: "4px", fontSize: "11px" }}>
                    <b>Priority {priority} — {PRIORITY_LEVELS.find((p) => p.value === priority)?.urgency}:</b>
                    <p style={{ margin: "3px 0 0", color: "#5d5440" }}>
                      {PRIORITY_LEVELS.find((p) => p.value === priority)?.meaning}
                    </p>
                    <small style={{ color: "#8a7a58", display: "block", marginTop: "4px" }}>
                      * Priority 5 represents the highest scheduling urgency; Priority 1 is the lowest. Priority guides scheduling priority and does not determine therapist qualifications.
                    </small>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Therapist Ranking & Appointment */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* SECTION 4: Ranked Therapists by Expertise */}
            <section className="panel" style={{ padding: "20px" }}>
              <div className="panel-header" style={{ marginBottom: "12px", paddingBottom: "10px" }}>
                <div>
                  <span className="eyebrow" style={{ color: "#366b4d" }}>STEP 5</span>
                  <h2 style={{ fontSize: "16px", margin: "2px 0" }}>Therapists Ranked by Panchakarma Expertise</h2>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--muted)" }}>
                    Therapists with recorded expertise matching <b>{selectedTreatment || "the selected treatment"}</b> are ranked first.
                  </p>
                </div>
                {selectedTherapist && (
                  <span className="status success" style={{ fontSize: "11px" }}>✓ Therapist Selected</span>
                )}
              </div>

              {!selectedTreatment ? (
                <div style={{ padding: "24px 16px", textAlign: "center", background: "#f9faf8", borderRadius: "8px", border: "1px dashed #dce5dc" }}>
                  <span style={{ fontSize: "24px", color: "#77917f", display: "block", marginBottom: "8px" }}>✳</span>
                  <b style={{ fontSize: "13px", color: "#304b3e" }}>Select a Panchakarma procedure to rank therapists</b>
                  <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--muted)" }}>
                    The system will immediately sort care therapists by their recorded expertise in that specific treatment.
                  </p>
                </div>
              ) : rankedTherapists.length === 0 ? (
                <Empty icon="♧" title="No therapists found" text="No therapist profiles are currently recorded in PostgreSQL." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "380px", overflowY: "auto", paddingRight: "4px" }}>
                  {rankedTherapists.map((th, index) => {
                    const isSelected = selectedTherapist?.therapist_id === th.therapist_id;
                    const isDirectMatch = th.matchType === "direct";
                    const isSpecMatch = th.matchType === "specialization";
                    const isUnspecified = th.matchType === "unspecified";

                    return (
                      <div
                        key={th.therapist_id}
                        onClick={() => setSelectedTherapist(th)}
                        style={{
                          border: isSelected ? "2px solid #19563f" : "1px solid #e2e8e0",
                          borderRadius: "10px",
                          padding: "12px 14px",
                          background: isSelected ? "#f3f8f4" : "#ffffff",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          boxShadow: isSelected ? "0 2px 8px rgba(25, 86, 63, 0.12)" : "none"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <div
                              className="table-avatar"
                              style={{
                                width: "32px",
                                height: "32px",
                                background: isSelected ? "#19563f" : isDirectMatch ? "#e3f2e7" : "#f1f3f0",
                                color: isSelected ? "#ffffff" : isDirectMatch ? "#1d5b3c" : "#5d6d62",
                                fontSize: "12px"
                              }}
                            >
                              #{index + 1}
                            </div>
                            <div>
                              <b style={{ fontSize: "13px", color: "#20372f" }}>{th.name}</b>
                              <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                                {th.specialization || "General Panchakarma Therapist"} · {th.experience_years ? `${th.experience_years} yrs exp` : "Experience not recorded"}
                              </div>
                            </div>
                          </div>

                          {/* Match Badge */}
                          <div>
                            {isDirectMatch ? (
                              <span className="status success" style={{ fontSize: "10px", padding: "3px 7px" }}>
                                ✓ Direct Expertise
                              </span>
                            ) : isSpecMatch ? (
                              <span className="status info" style={{ fontSize: "10px", padding: "3px 7px" }}>
                                ✓ Specialization
                              </span>
                            ) : isUnspecified ? (
                              <span className="status warning" style={{ fontSize: "10px", padding: "3px 7px" }}>
                                ? Expertise Unknown
                              </span>
                            ) : (
                              <span style={{ fontSize: "10px", padding: "3px 7px", background: "#f0f2ef", color: "#66776c", borderRadius: "4px" }}>
                                General
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expertise Tags */}
                        {Array.isArray(th.expertise) && th.expertise.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                            {th.expertise.map((exp, i) => {
                              const matchesProcedure = selectedTreatment && String(exp).toLowerCase().includes(selectedTreatment.toLowerCase());
                              return (
                                <span
                                  key={i}
                                  style={{
                                    fontSize: "10px",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    background: matchesProcedure ? "#d8ecdc" : "#f0f3ef",
                                    color: matchesProcedure ? "#134d31" : "#556459",
                                    fontWeight: matchesProcedure ? "700" : "500"
                                  }}
                                >
                                  {matchesProcedure ? `★ ${exp}` : exp}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Match Reason explanation */}
                        <p style={{ margin: "6px 0 0", fontSize: "10px", color: isDirectMatch ? "#205938" : "var(--muted)" }}>
                          {th.matchReason}
                        </p>

                        {/* Availability Details */}
                        <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed #e6ece4", fontSize: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#6a7b70" }}>
                            ◷ {th.availabilityMessage}
                          </span>
                          {th.availabilityStatus === "available" && (
                            <span style={{ color: "#19563f", fontWeight: "700" }}>✓ Available</span>
                          )}
                          {th.availabilityStatus === "booked" && (
                            <span style={{ color: "var(--rose)", fontWeight: "700" }}>✕ Conflict</span>
                          )}
                          {th.availabilityStatus === "off-day" && (
                            <span style={{ color: "#a87114", fontWeight: "700" }}>✕ Off-day</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedTherapist && (
                <div style={{ marginTop: "12px", padding: "10px 14px", background: "#e8f4eb", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "10px", letterSpacing: "0.1em", fontWeight: "800", color: "#286344", textTransform: "uppercase" }}>Selected Therapist</span>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#164531" }}>{selectedTherapist.name}</div>
                  </div>
                  <button
                    type="button"
                    className="outline-btn small-btn"
                    onClick={() => setSelectedTherapist(null)}
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </section>

            {/* SECTION 5: Duration and Appointment Details */}
            <section className="panel" style={{ padding: "20px" }}>
              <div className="panel-header" style={{ marginBottom: "12px", paddingBottom: "10px" }}>
                <div>
                  <span className="eyebrow" style={{ color: "#366b4d" }}>STEP 6</span>
                  <h2 style={{ fontSize: "16px", margin: "2px 0" }}>Duration & Appointment Schedule</h2>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--muted)" }}>
                    Configure session length and preferred appointment time.
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label htmlFor="duration-min" style={{ display: "block", marginBottom: "4px" }}>
                    Duration (Minutes) <span style={{ color: "var(--rose)" }}>*</span>
                  </label>
                  <input
                    id="duration-min"
                    type="number"
                    min="15"
                    max="480"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    required
                  />
                  <small style={{ color: "var(--muted)", fontSize: "10px", display: "block", marginTop: "2px" }}>
                    Standard: 60 min (Range: 15–480 min)
                  </small>
                </div>

                <div>
                  <label htmlFor="appointment-datetime" style={{ display: "block", marginBottom: "4px" }}>
                    Requested Date & Time (Optional)
                  </label>
                  <input
                    id="appointment-datetime"
                    type="datetime-local"
                    value={appointmentStart}
                    onChange={(e) => setAppointmentStart(e.target.value)}
                  />
                  <small style={{ color: "var(--muted)", fontSize: "10px", display: "block", marginTop: "2px" }}>
                    Select date to check therapist work schedule
                  </small>
                </div>
              </div>
            </section>

            {/* SECTION 6: Plan Summary and Save Action */}
            <section className="panel" style={{ padding: "20px", background: "#f8fbf9", border: "1px solid #d8e5da" }}>
              <h2 style={{ fontSize: "15px", margin: "0 0 10px", color: "#19563f" }}>Plan Formulation Summary</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px", marginBottom: "16px" }}>
                <div>
                  <span style={{ color: "var(--muted)" }}>Patient:</span>{" "}
                  <b>{selectedPatient ? selectedPatient.name : "Not selected"}</b>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Procedure:</span>{" "}
                  <b>{selectedTreatment || "Not selected"}</b>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Priority:</span>{" "}
                  <b>{priority} / 5 ({PRIORITY_LEVELS.find((p) => p.value === priority)?.urgency})</b>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Duration:</span>{" "}
                  <b>{durationMinutes} minutes</b>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Assigned Therapist:</span>{" "}
                  <b>{selectedTherapist ? selectedTherapist.name : "Unassigned (Can be scheduled later)"}</b>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Appointment:</span>{" "}
                  <b>{appointmentStart ? `${fmtDate(appointmentStart)} at ${fmtTime(appointmentStart)}` : "Not scheduled"}</b>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  className="primary-btn wide"
                  disabled={submitting || !selectedPatient || !selectedTreatment || !diseaseDescription.trim()}
                  style={{ padding: "12px", fontSize: "13px" }}
                >
                  {submitting ? "Saving plan to database…" : "✓ Save Treatment Plan"}
                </button>
                <button
                  type="button"
                  className="outline-btn"
                  onClick={onBack}
                  disabled={submitting}
                >
                  Cancel
                </button>
              </div>
            </section>

          </div>
        </div>
      </form>
    </div>
  );
}
