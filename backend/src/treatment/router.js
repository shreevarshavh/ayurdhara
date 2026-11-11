
const express = require("express");
const router = express.Router();
const { authorizeRoles } = require("../middleware/authMiddleware");

const {
  getPatients,
  getPatientProfile,
  getPatientProfileByUserId,
  updatePatientPhotoByPatientId,
  updatePatientPhotoByUserId,
  searchPatients,
  getDoctors,
  getDoctorId,
  getTreatments,
  getTherapistsForScheduling,
  updateSession,
  getAlerts,
  createAlert,
  updateAlertStatus,
  scheduleTreatment
} = require("./service");


// Therapists with their scheduling IDs
router.get("/therapists", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    res.json(await getTherapistsForScheduling());
  } catch (error) {
    console.error("Fetch therapists error:", error);
    res.status(500).json({ message: "Failed to fetch therapists" });
  }
});

// List treatment plans and scheduled sessions
router.get("/", async (req, res) => {
  try {
    res.json(await getTreatments(req.user));
  } catch (error) {
    console.error("Fetch treatments error:", error);
    res.status(500).json({ message: "Failed to fetch treatments. Check that the database migration has been applied." });
  }
});

// Update session status and notes
router.patch("/:uuid/session", authorizeRoles("therapist", "doctor", "admin"), async (req, res) => {
  try {
    const { session_status, session_notes = "" } = req.body;
    const updated = await updateSession(req.params.uuid, session_status, session_notes, req.user);
    if (!updated) return res.status(404).json({ message: "Treatment not found" });
    res.json({ message: "Session updated", session: updated });
  } catch (error) {
    console.error("Update session error:", error);
    res.status(error.message === "Invalid session status" ? 400 : 500).json({ message: error.message || "Failed to update session" });
  }
});

// Emergency alerts
router.get("/alerts", authorizeRoles("doctor", "therapist", "admin"), async (req, res) => {
  try {
    res.json(await getAlerts());
  } catch (error) {
    console.error("Fetch alerts error:", error);
    res.status(500).json({ message: "Failed to fetch alerts. Check that the database migration has been applied." });
  }
});

router.post("/alerts", authorizeRoles("patient", "therapist", "doctor", "admin"), async (req, res) => {
  try {
    const { patient_id, treatment_uuid, severity, symptoms } = req.body;
    const reported_by = req.user.user_id;
    if (!symptoms || !String(symptoms).trim()) {
      return res.status(400).json({ message: "Symptoms are required" });
    }
    const alert = await createAlert({ patient_id, treatment_uuid, severity, symptoms, reported_by });
    res.status(201).json({ message: "Emergency alert created", alert });
  } catch (error) {
    console.error("Create alert error:", error);
    res.status(500).json({ message: "Failed to create emergency alert" });
  }
});

router.patch("/alerts/:id", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const alert = await updateAlertStatus(req.params.id, req.body.status);
    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json({ message: "Alert updated", alert });
  } catch (error) {
    console.error("Update alert error:", error);
    res.status(error.message === "Invalid alert status" ? 400 : 500).json({ message: error.message || "Failed to update alert" });
  }
});

// Patient can view their own registered profile.
router.get("/patients/me", authorizeRoles("patient"), async (req, res) => {
  try {
    const profile = await getPatientProfileByUserId(req.user.user_id);
    if (!profile) return res.status(404).json({ message: "Patient profile not found" });
    res.json(profile);
  } catch (error) {
    console.error("Fetch own patient profile error:", error);
    res.status(500).json({ message: "Failed to fetch patient profile" });
  }
});

// Doctors/admins can open a patient's detailed profile.
router.get("/patients/:patient_id/profile", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const profile = await getPatientProfile(req.params.patient_id);
    if (!profile) return res.status(404).json({ message: "Patient profile not found" });
    res.json(profile);
  } catch (error) {
    console.error("Fetch patient profile error:", error);
    res.status(500).json({ message: "Failed to fetch patient profile" });
  }
});

// Patients can upload/update their own profile photo.
router.patch("/patients/me/photo", authorizeRoles("patient"), async (req, res) => {
  try {
    const photo = req.body?.profile_photo;
    if (typeof photo !== "string" || photo.length > 4_000_000 || !/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(photo)) {
      return res.status(400).json({ message: "Choose a valid image smaller than 2 MB" });
    }
    const updated = await updatePatientPhotoByUserId(req.user.user_id, photo);
    if (!updated) return res.status(404).json({ message: "Patient profile not found" });
    res.json({ message: "Profile photo updated", ...updated });
  } catch (error) {
    console.error("Update own patient photo error:", error);
    res.status(500).json({ message: "Failed to update profile photo" });
  }
});

// Doctors/admins can add or update a photo on a patient record.
router.patch("/patients/:patient_id/photo", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const photo = req.body?.profile_photo;
    if (typeof photo !== "string" || photo.length > 4_000_000 || !/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(photo)) {
      return res.status(400).json({ message: "Choose a valid image smaller than 2 MB" });
    }
    const updated = await updatePatientPhotoByPatientId(req.params.patient_id, photo);
    if (!updated) return res.status(404).json({ message: "Patient profile not found" });
    res.json({ message: "Profile photo updated", ...updated });
  } catch (error) {
    console.error("Update patient photo error:", error);
    res.status(500).json({ message: "Failed to update patient photo" });
  }
});

// Get all patients
router.get("/patients", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const patients = await getPatients();
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch patients"
    });
  }
});

// Search patients
router.get("/search", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const patients = await searchPatients(
      req.query.name || ""
    );

    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to search patients"
    });
  }
});

// Get doctors
router.get("/doctors", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const doctors = await getDoctors();
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch doctors"
    });
  }
});

// Get doctor ID
router.get("/doctor/:user_id", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const doctor = await getDoctorId(req.params.user_id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    res.json(doctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch doctor"
    });
  }
});

// Schedule treatment and resolve conflicts
router.post("/schedule", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const schedule = await scheduleTreatment(req.body, req.user);

    res.json({
      message: "Schedule updated successfully",
      schedule
    });
  } catch (error) {
    console.error("Scheduling error:", error);

    if (
      error.message === "Invalid scheduling details" ||
      error.message === "Invalid appointment date or time"
    ) {
      return res.status(400).json({
        message: error.message
      });
    }

    if (error.message === "Treatment record not found" || error.message === "Treatment record not found or not assigned to your account") {
      return res.status(404).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: "Failed to schedule treatment"
    });
  }
});

module.exports = router;
