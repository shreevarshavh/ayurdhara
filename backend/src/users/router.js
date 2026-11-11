
const express = require("express");
const router = express.Router();
const service = require("./service");

router.post("/", async (req, res) => {
  try {
    const { name, email, password, role, phone_number } = req.body;

    const user = await service.createUser(
      name,
      email,
      password,
      role,
      phone_number
    );

    return res.status(201).json({
      message: "User created successfully",
      user
    });
  } catch (error) {
    console.error("POST error:", error.message);

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
router.delete("/:id", async (req, res) => {
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
router.get("/", async (req, res) => {
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
router.get("/p/", async (req, res) => {
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
router.get("/p/:id", async (req, res) => {
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
router.get("/doctors/", async (req, res) => {
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
router.get("/doctors/:id", async (req, res) => {
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
router.get("/therapists/", async (req, res) => {
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
router.get("/therapists/:id", async (req, res) => {
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
module.exports = router;
