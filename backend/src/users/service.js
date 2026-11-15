
const pool = require("../config/db");
const bcrypt = require("bcrypt");


async function createUser(name, email, password, role, phone_number, profile = {}) {
  const normalizedRole = String(role || "").toLowerCase();
  if (!name?.trim() || !email?.trim() || !password || String(password).length < 8) {
    throw new Error("Name, email and a password of at least 8 characters are required");
  }
  if (!["patient", "doctor", "therapist", "admin"].includes(normalizedRole)) {
    throw new Error("Invalid user role");
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 12);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, role, phone_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, name, email, role, phone_number, created_at`,
      [name.trim(), normalizedEmail, hashedPassword, normalizedRole, phone_number || null]
    );
    const user = result.rows[0];

    if (normalizedRole === "patient") {
      await client.query("INSERT INTO patients (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING", [user.user_id]);
    } else if (normalizedRole === "doctor") {
      await client.query("INSERT INTO doctors (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING", [user.user_id]);
    } else if (normalizedRole === "therapist") {
      const expertise = Array.isArray(profile.expertise)
        ? profile.expertise
        : String(profile.expertise || "").split(",").map((item) => item.trim()).filter(Boolean);
      const workDays = Array.isArray(profile.work_days) && profile.work_days.length
        ? [...new Set(profile.work_days.map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))]
        : [1, 2, 3, 4, 5, 6];
      const workStart = profile.workday_start || "09:00";
      const workEnd = profile.workday_end || "17:00";
      if (workStart >= workEnd) throw new Error("Therapist workday end must be after start");
      await client.query(
        `INSERT INTO therapists
          (user_id, specialization, experience_years, expertise, work_days, workday_start, workday_end)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id) DO UPDATE SET
           specialization = EXCLUDED.specialization,
           experience_years = EXCLUDED.experience_years,
           expertise = EXCLUDED.expertise,
           work_days = EXCLUDED.work_days,
           workday_start = EXCLUDED.workday_start,
           workday_end = EXCLUDED.workday_end`,
        [user.user_id, profile.specialization || null,
          profile.experience_years === "" || profile.experience_years == null ? null : Number(profile.experience_years),
          expertise, workDays, workStart, workEnd]
      );
    }
    await client.query("COMMIT");
    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getUsers({ user_id, name, email, phone_number } = {}) {
  let query = `
  SELECT user_id, name, email, role, phone_number,
         profile_photo, created_at
  FROM users
  WHERE 1=1
`;
  const values = [];

  if (user_id) {
    values.push(user_id);
    query += ` AND user_id = $${values.length}`;
  }

  if (name) {
    values.push(name);
    query += ` AND name = $${values.length}`;
  }

  if (email) {
    values.push(email);
    query += ` AND email = $${values.length}`;
  }
  if(phone_number){
    values.push(phone_number);
    query += ` AND phone_number = $${values.length}`;
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
}

async function getUserById(user_id) {
  const result = await pool.query(
    `SELECT user_id, name, email, role, phone_number, created_at
     FROM users
     WHERE user_id = $1`,
    [user_id]
  );

  return result.rows[0];
}

async function deleteUser(user_id) {
  const result = await pool.query(
    `DELETE FROM users
     WHERE user_id = $1
     RETURNING user_id`,
    [user_id]
  );

  return result.rows[0];
}

async function getPatients({ user_id, name, email, phone_number } = {}) {
  let query = `SELECT user_id, name, email, role, phone_number,created_at
               FROM users WHERE 1=1`;

  const values = [];

  if (user_id) {
    values.push(user_id);
    query += ` AND user_id = $${values.length}`;
  }

  if (name) {
    values.push(name);
    query += ` AND name = $${values.length}`;
  }

  if (email) {
    values.push(email);
    query += ` AND email = $${values.length}`;
  }
  if(phone_number){
    values.push(phone_number);
    query += ` AND phone_number = $${values.length}`;
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
}

async function getPatientById(patient_id) {
  const result = await pool.query(
    `SELECT * FROM patients WHERE patient_id = $1`,
    [patient_id]
  );

  return result.rows[0];
}

async function getPatientByUserId(user_id) {
  const result = await pool.query(
    `SELECT * FROM patients WHERE user_id = $1`,
    [user_id]
  );

  return result.rows;
}


async function getDoctors({ user_id, name, email, phone_number } = {}) {
  let query = `
    SELECT
      u.user_id,
      u.name,
      u.email,
      u.role,
      u.phone_number,
      u.created_at,
      d.doctor_id,
      d.degree,
      d.specialization,
      d.license_number,
      d.approval_status,
      u.profile_photo
    FROM users u
    LEFT JOIN doctors d ON u.user_id = d.user_id
    WHERE u.role = 'doctor'
  `;

  const values = [];

  if (user_id) {
    values.push(user_id);
    query += ` AND u.user_id = $${values.length}`;
  }

  if (name) {
    values.push(name);
    query += ` AND u.name = $${values.length}`;
  }

  if (email) {
    values.push(email);
    query += ` AND u.email = $${values.length}`;
  }

  if (phone_number) {
    values.push(phone_number);
    query += ` AND u.phone_number = $${values.length}`;
  }

  query += ` ORDER BY u.created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
}

async function getDoctorById(doctor_id) {
  const result = await pool.query(
    `SELECT * FROM doctors WHERE doctor_id = $1`,
    [doctor_id]
  );

  return result.rows[0];
}

async function getDoctorByUserId(user_id) {
  const result = await pool.query(
    `SELECT * FROM doctors WHERE user_id = $1`,
    [user_id]
  );

  return result.rows;
}

async function getTherapists({
  user_id,
  name,
  email,
  phone_number
} = {}) {
  let query = `
    SELECT
      u.user_id,
      u.name,
      u.email,
      u.role,
      u.phone_number,
      u.created_at,
      t.therapist_id,
      t.specialization,
      t.experience_years,
      COALESCE(t.expertise::TEXT[], ARRAY[]::TEXT[]) AS expertise,
      COALESCE(t.work_days::SMALLINT[], ARRAY[1,2,3,4,5,6]::SMALLINT[]) AS work_days,
      COALESCE(t.workday_start, TIME '09:00')::text AS workday_start,
      COALESCE(t.workday_end, TIME '17:00')::text AS workday_end,
      u.profile_photo
    FROM users u
    LEFT JOIN therapists t ON u.user_id = t.user_id
    WHERE u.role = 'therapist'
  `;

  const values = [];

  if (user_id) {
    values.push(user_id);
    query += ` AND u.user_id = $${values.length}`;
  }

  if (name) {
    values.push(name);
    query += ` AND u.name = $${values.length}`;
  }

  if (email) {
    values.push(email);
    query += ` AND u.email = $${values.length}`;
  }

  if (phone_number) {
    values.push(phone_number);
    query += ` AND u.phone_number = $${values.length}`;
  }

  query += ` ORDER BY u.created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
}
async function getTherapistByUserId(user_id) {
  const result = await pool.query(
    `SELECT * FROM therapists WHERE user_id = $1`,
    [user_id]
  );

  return result.rows;
}
async function updateUserPhoto(user_id, profile_photo) {
  const result = await pool.query(
    `UPDATE users
     SET profile_photo = $1
     WHERE user_id = $2
       AND role IN ('doctor', 'therapist')
     RETURNING user_id, name, role, profile_photo`,
    [profile_photo, user_id]
  );

  return result.rows[0];
}
async function updateUserProfile(user_id, profile) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      name,
      email,
      phone_number,
      degree,
      specialization,
      license_number,
      experience_years
    } = profile;

    // Find the user's role
    const userResult = await client.query(
      `SELECT user_id, role
       FROM users
       WHERE user_id = $1`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const role = userResult.rows[0].role;

    if (!["doctor", "therapist"].includes(role)) {
      await client.query("ROLLBACK");
      return null;
    }

    // Update common account details
    await client.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone_number = COALESCE($3, phone_number)
       WHERE user_id = $4`,
      [
        name === undefined ? null : name.trim(),
        email === undefined ? null : email.trim(),
        phone_number === undefined ? null : phone_number,
        user_id
      ]
    );

    // Update doctor-specific details
    if (role === "doctor") {
      await client.query(
        `UPDATE doctors
         SET degree = COALESCE($1, degree),
             specialization = COALESCE($2, specialization),
             license_number = COALESCE($3, license_number)
         WHERE user_id = $4`,
        [
          degree === undefined ? null : degree,
          specialization === undefined ? null : specialization,
          license_number === undefined ? null : license_number,
          user_id
        ]
      );
    }

    // Update therapist-specific details
    if (role === "therapist") {
      await client.query(
        `UPDATE therapists
         SET specialization = COALESCE($1, specialization),
             experience_years = COALESCE($2, experience_years)
         WHERE user_id = $3`,
        [
          specialization === undefined ? null : specialization,
          experience_years === undefined ? null : experience_years,
          user_id
        ]
      );
    }

    // Return the updated profile
    let result;

    if (role === "doctor") {
      result = await client.query(
        `SELECT u.user_id, u.name, u.email, u.role,
                u.phone_number, u.profile_photo, u.created_at,
                d.doctor_id, d.degree, d.specialization,
                d.license_number, d.approval_status
         FROM users u
         LEFT JOIN doctors d ON d.user_id = u.user_id
         WHERE u.user_id = $1`,
        [user_id]
      );
    } else {
      result = await client.query(
        `SELECT u.user_id, u.name, u.email, u.role,
                u.phone_number, u.profile_photo, u.created_at,
                t.therapist_id, t.specialization,
                t.experience_years
         FROM users u
         LEFT JOIN therapists t ON t.user_id = u.user_id
         WHERE u.user_id = $1`,
        [user_id]
      );
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updatePatientProfile(user_id, profile) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      name,
      email,
      phone_number,
      gender,
      blood_group,
      height_cm,
      weight_kg,
      address
    } = profile;

    const userResult = await client.query(
      `SELECT user_id
       FROM users
       WHERE user_id = $1
         AND role = 'patient'`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone_number = COALESCE($3, phone_number)
       WHERE user_id = $4`,
      [
        name === undefined ? null : name.trim(),
        email === undefined ? null : email.trim(),
        phone_number === undefined ? null : phone_number,
        user_id
      ]
    );

    await client.query(
      `UPDATE patients
       SET gender = COALESCE($1, gender),
           blood_group = COALESCE($2, blood_group),
           height_cm = COALESCE($3, height_cm),
           weight_kg = COALESCE($4, weight_kg),
           address = COALESCE($5, address),
           updated_at = NOW()
       WHERE user_id = $6`,
      [
        gender === undefined ? null : gender,
        blood_group === undefined ? null : blood_group,
        height_cm === undefined ? null : height_cm,
        weight_kg === undefined ? null : weight_kg,
        address === undefined ? null : address,
        user_id
      ]
    );

    const result = await client.query(
      `SELECT
         u.user_id, u.name, u.email, u.phone_number,
         u.role, u.created_at,
         p.patient_id, p.gender, p.blood_group,
         p.height_cm, p.weight_kg, p.address,
         p.profile_photo, p.updated_at
       FROM users u
       JOIN patients p ON p.user_id = u.user_id
       WHERE u.user_id = $1`,
      [user_id]
    );

    await client.query("COMMIT");
    return result.rows[0] || null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}


module.exports = {
  createUser,
  getUsers,
  getUserById,
  deleteUser,
  getPatients,
  getPatientById,
  getPatientByUserId,
  getDoctors,
  getDoctorById,
  getDoctorByUserId,
  getTherapists,
  getTherapistByUserId,
  updateUserPhoto,
  updateUserProfile,
  updatePatientProfile
};