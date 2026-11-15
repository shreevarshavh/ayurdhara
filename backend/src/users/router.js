
const express = require("express");
const router = express.Router();
const service = require("./service");
const { authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", authorizeRoles("admin", "doctor"), async (req, res) => {
  try {
    const { name, email, password, role, phone_number } = req.body;
    const requestedRole = String(role || "").toLowerCase();
    if (String(req.user.role || "").toLowerCase() === "doctor" && requestedRole !== "patient") {
      return res.status(403).json({ message: "Doctors can create patient accounts only." });
    }
    if (requestedRole === "admin" && String(req.user.role || "").toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Only an administrator can create admin accounts." });
    }
    const user = await service.createUser(name, email, password, requestedRole, phone_number, req.body);

    return res.status(201).json({
      message: "User created successfully",
      user
    });
  } catch (error) {
    console.error("POST error:", error.message);

    if (["Name, email and a password of at least 8 characters are required", "Invalid user role", "Therapist workday end must be after start"].includes(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === "23505") {
      return res.status(409).json({
        message: "This email is already registered"
      });
    }

    return res.status(500).json({
      message: "Failed to create user"
    });
  }
});

// Delete user
router.delete("/:id", authorizeRoles("admin"), async (req, res) => {
  try {
    const deleted = await service.deleteUser(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("DELETE error:", error.message);

    return res.status(500).json({
      message: "Failed to delete user"
    });
  }
});

// Get users and search by user_id, name, or email
router.get("/", authorizeRoles("admin"), async (req, res) => {
  try {
    const { user_id, name, email, phone_number } = req.query;

    const users = await service.getUsers({
      user_id,
      name,
      email,
      phone_number
    });

    if (user_id && users.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      message: "Users fetched successfully",
      data: users
    });
  } catch (error) {
    console.error("GET error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch users"
    });
  }
});

// Get patients and search by user_id, name, or email
router.get("/p/", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const { user_id, name, email, phone_number } = req.query;

    const patients = await service.getPatients({
      user_id,
      name,
      email,
      phone_number
    });

    if (!patients || patients.length === 0) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    return res.status(200).json({
      message: "Patients fetched successfully",
      data: patients
    });
  } catch (error) {
    console.error("GET patients error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch patients"
    });
  }
});

// Get one patient by patient_id
router.get("/p/:id", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const patient = await service.getPatientById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found"
      });
    }

    return res.status(200).json({
      message: "Patient fetched successfully",
      data: patient
    });
  } catch (error) {
    console.error("GET patient error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch patient"
    });
  }
});

// Get doctors and search by user_id, name, or email
router.get("/doctors/", authorizeRoles("admin"), async (req, res) => {
  try {
    const { user_id, name, email, phone_number } = req.query;

    const doctors = await service.getDoctors({
      user_id,
      name,
      email,
      phone_number
    });

    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    return res.status(200).json({
      message: "Doctors fetched successfully",
      data: doctors
    });
  } catch (error) {
    console.error("GET doctors error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch doctors"
    });
  }
});

// Get one doctor by doctor_id
router.get("/doctors/:id", authorizeRoles("admin"), async (req, res) => {
  try {
    const doctor = await service.getDoctorById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found"
      });
    }

    return res.status(200).json({
      message: "Doctor fetched successfully",
      data: doctor
    });
  } catch (error) {
    console.error("GET doctor error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch doctor"
    });
  }
});

// Get therapists and search by user_id, name, or email
router.get("/therapists/", authorizeRoles("admin"), async (req, res) => {
  try {
    const { user_id, name, email, phone_number } = req.query;

    const therapists = await service.getTherapists({
      user_id,
      name,
      email,
      phone_number
    });

    if (!therapists || therapists.length === 0) {
      return res.status(404).json({
        message: "Therapist not found"
      });
    }

    return res.status(200).json({
      message: "Therapists fetched successfully",
      data: therapists
    });
  } catch (error) {
    console.error("GET therapists error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch therapists"
    });
  }
});

// Get one therapist by therapist_id
router.get("/therapists/:id", authorizeRoles("admin"), async (req, res) => {
  try {
    const therapist = await service.getTherapistById(req.params.id);

    if (!therapist) {
      return res.status(404).json({
        message: "Therapist not found"
      });
    }

    return res.status(200).json({
      message: "Therapist fetched successfully",
      data: therapist
    });
  } catch (error) {
    console.error("GET therapist error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch therapist"
    });
  }
});

router.patch("/:id/profile", authorizeRoles("admin"), async (req, res) => {
  try {
    const {
      name,
      email,
      phone_number,
      degree,
      specialization,
      license_number,
      experience_years
    } = req.body;

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim())
    ) {
      return res.status(400).json({
        message: "Name cannot be empty."
      });
    }

    if (
      email !== undefined &&
      (typeof email !== "string" || !email.trim())
    ) {
      return res.status(400).json({
        message: "Email cannot be empty."
      });
    }

    const user = await service.updateUserProfile(
      req.params.id,
      {
        name,
        email,
        phone_number,
        degree,
        specialization,
        license_number,
        experience_years
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "Doctor or therapist not found."
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      user
    });
  } catch (error) {
    console.error("UPDATE PROFILE error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "This email is already registered."
      });
    }

    return res.status(500).json({
      message: "Failed to update profile."
    });
  }
});

router.patch("/patients/:user_id/profile", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const {
      name,
      email,
      phone_number,
      gender,
      blood_group,
      height_cm,
      weight_kg,
      address
    } = req.body;

    if (
      name !== undefined &&
      (typeof name !== "string" || !name.trim())
    ) {
      return res.status(400).json({
        message: "Name cannot be empty."
      });
    }

    if (
      email !== undefined &&
      (typeof email !== "string" || !email.trim())
    ) {
      return res.status(400).json({
        message: "Email cannot be empty."
      });
    }

    if (
      height_cm !== undefined &&
      height_cm !== null &&
      (!Number.isFinite(Number(height_cm)) || Number(height_cm) <= 0)
    ) {
      return res.status(400).json({
        message: "Height must be a positive number."
      });
    }

    if (
      weight_kg !== undefined &&
      weight_kg !== null &&
      (!Number.isFinite(Number(weight_kg)) || Number(weight_kg) <= 0)
    ) {
      return res.status(400).json({
        message: "Weight must be a positive number."
      });
    }

    const patient = await service.updatePatientProfile(
      req.params.user_id,
      {
        name,
        email,
        phone_number,
        gender,
        blood_group,
        height_cm,
        weight_kg,
        address
      }
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found."
      });
    }

    return res.status(200).json({
      message: "Patient profile updated successfully.",
      user: patient
    });
  } catch (error) {
    console.error("UPDATE PATIENT PROFILE error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "This email is already registered."
      });
    }

    return res.status(500).json({
      message: "Failed to update patient profile."
    });
  }
});


// Upload or update doctor/therapist profile photo
router.patch("/:id/photo", authorizeRoles("doctor", "admin"), async (req, res) => {
  try {
    const { profile_photo } = req.body;
    const user_id = req.params.id;

    if (
      typeof profile_photo !== "string" ||
      !profile_photo.startsWith("data:image/")
    ) {
      return res.status(400).json({
        message: "Please provide a valid image."
      });
    }

    const user = await service.updateUserPhoto(
      user_id,
      profile_photo
    );

    if (!user) {
      return res.status(404).json({
        message: "Doctor or therapist not found."
      });
    }

    return res.status(200).json({
      message: "Profile photo updated successfully.",
      user
    });
  } catch (error) {
    console.error("UPDATE PHOTO error:", error.message);

    return res.status(500).json({
      message: "Failed to update profile photo."
    });
  }
});
module.exports = router;
