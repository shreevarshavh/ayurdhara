
const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const router = express.Router();



// Return the identity encoded in a valid login token.
router.get("/me", async (req, res) => {
  const jwt = require("jsonwebtoken");
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ayurdhara-local-development-secret");
    const result = await pool.query(
      `SELECT user_id, name, email, role, phone_number FROM users WHERE user_id = $1`,
      [decoded.user_id]
    );
    if (!result.rows[0]) return res.status(401).json({ message: "User account not found" });
    return res.json({ user: result.rows[0] });
  } catch (error) {
    return res.status(401).json({ message: "Your login session is invalid or expired" });
  }
});

// Login with email and password
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await pool.query(
      `SELECT user_id, name, email, password_hash, role, phone_number
       FROM users
       WHERE LOWER(email) = $1`,
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, email: user.email },
      process.env.JWT_SECRET || "ayurdhara-local-development-secret",
      { expiresIn: "8h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone_number: user.phone_number
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Login failed" });
  }
});

// Public registration creates patient accounts only.
router.post("/register", async (req, res) => {
  const { name, email, password, phone_number, height, weight, address, blood_group, profile_photo } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  if (String(password).length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters"
    });
  }

  if (profile_photo && (typeof profile_photo !== "string" || profile_photo.length > 4_000_000 || !/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(profile_photo))) {
    return res.status(400).json({ message: "Profile photo must be a valid image smaller than 2 MB" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await client.query(
      "SELECT user_id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, name, email, role, phone_number, created_at`,
      [name.trim(), normalizedEmail, passwordHash, "patient", phone_number || null]
    );

    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO patients (user_id, height, weight, address, blood_group, profile_photo)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.user_id,
        height === "" || height == null ? null : Number(height),
        weight === "" || weight == null ? null : Number(weight),
        address || null,
        blood_group || null,
        profile_photo || null
      ]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Patient registered successfully",
      user
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Registration failed"
    });
  } finally {
    client.release();
  }
});

router.post("/register-doctor", async (req, res) => {
 const {
  name,
  email,
  password,
  degree,
  date_of_birth,
  specialization,
  license_number,
  phone
} = req.body || {};
console.log("Received body:", req.body);
console.log("Required fields:", {
  name,
  email,
  password: !!password,
  degree,
  specialization,
  license_number
});

  if (!name || !email || !password || !degree ||
      !specialization || !license_number) {
    return res.status(400).json({
      message: "Name, email, password, degree, specialization, and license number are required"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters"
    });
  }
  

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await client.query(
      "SELECT user_id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, name, email, created_at`,
      [name.trim(), normalizedEmail, passwordHash, "doctor"]
    );

    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO doctors
       (user_id, degree, date_of_birth, specialization,
        license_number, phone)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.user_id,
        degree,
        date_of_birth || null,
        specialization,
        license_number,
        phone || null
      ]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Doctor registered successfully. Admin approval is required before access is granted.",
      user
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email or license number already exists"
      });
    }

    if (error.code === "23514" || error.code === "22P02" ||
        error.code === "22007") {
      return res.status(400).json({
        message: "One or more supplied fields have an invalid value"
      });
    }

    console.error("Doctor registration error:", error.message);

    return res.status(500).json({
      message: "Doctor registration failed"
    });
  } finally {
    client.release();
  }
});


module.exports = router;
