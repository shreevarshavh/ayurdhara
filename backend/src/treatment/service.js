
const pool = require("../config/db");
const { spawn } = require("child_process");
const path = require("path");

// Run the Python OR-Tools scheduler
function runOrToolsScheduler(appointments) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "scheduler.py");
    const pythonCommand = process.env.PYTHON_PATH || "python";

    const python = spawn(pythonCommand, [scriptPath]);

    let stdout = "";
    let stderr = "";

    python.stdout.setEncoding("utf8");
    python.stderr.setEncoding("utf8");

    python.stdout.on("data", (data) => {
      stdout += data;
    });

    python.stderr.on("data", (data) => {
      stderr += data;
    });

    python.on("error", (error) => {
      reject(error);
    });

    python.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(stderr.trim() || "OR-Tools scheduler failed")
        );
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error("Invalid response from Python scheduler"));
      }
    });

    python.stdin.on("error", (error) => {
      reject(error);
    });

    python.stdin.end(JSON.stringify(appointments));
  });
}

// Keep your existing function below this line
async function getPatients() {
  const result = await pool.query(`
    SELECT p.patient_id, p.user_id, u.name, u.email, u.phone_number,
           p.height, p.weight, p.address, p.blood_group
    FROM patients p
    JOIN users u ON p.user_id = u.user_id
    ORDER BY u.name
  `);
  return result.rows;
}

async function getPatientProfile(patientId) {
  const result = await pool.query(`
    SELECT p.patient_id, p.user_id, u.name, u.email, u.phone_number,
           u.created_at, p.height, p.weight, p.address, p.blood_group,
           p.profile_photo
    FROM patients p
    JOIN users u ON p.user_id = u.user_id
    WHERE p.patient_id = $1
  `, [patientId]);
  return result.rows[0] || null;
}


async function getPatientProfileByUserId(userId) {
  const result = await pool.query(`
    SELECT
      p.patient_id,
      p.user_id,
      u.name,
      u.email,
      u.phone_number,
      u.created_at,
      p.height_cm AS height,
      p.weight_kg AS weight,
      p.address,
      p.blood_group,
      p.profile_photo
    FROM patients p
    JOIN users u ON p.user_id = u.user_id
    WHERE p.user_id = $1
  `, [userId]);

  return result.rows[0] || null;
}

async function updatePatientPhotoByPatientId(patientId, photo) {
  const result = await pool.query(
    `UPDATE patients SET profile_photo = $1 WHERE patient_id = $2 RETURNING patient_id, profile_photo`,
    [photo, patientId]
  );
  return result.rows[0] || null;
}

async function updatePatientPhotoByUserId(userId, photo) {
  const result = await pool.query(
    `UPDATE patients SET profile_photo = $1 WHERE user_id = $2 RETURNING patient_id, profile_photo`,
    [photo, userId]
  );
  return result.rows[0] || null;
}


// Search patients by name
async function searchPatients(name) {
  const result = await pool.query(
    `SELECT p.patient_id, u.name
     FROM patients p
     JOIN users u ON p.user_id = u.user_id
     WHERE u.name ILIKE $1
     ORDER BY u.name`,
    [`%${name}%`]
  );

  return result.rows;
}

// Get doctors
async function getDoctors() {
  const result = await pool.query(
    `SELECT doctor_id FROM doctors`
  );

  return result.rows;
}

// Get doctor ID using user ID
async function getDoctorId(user_id) {
  const result = await pool.query(
    `SELECT doctor_id
     FROM doctors
     WHERE user_id = $1`,
    [user_id]
  );

  return result.rows[0];
}

// Schedule treatment and automatically resolve conflicts

async function scheduleTreatment({
  uuid,
  therapist_id,
  appointment_start,
  duration_minutes,
  priority = 1
}, currentUser) {
  if (
    !uuid ||
    !therapist_id ||
    !appointment_start ||
    !Number.isInteger(Number(duration_minutes)) ||
    Number(duration_minutes) <= 0 ||
    !Number.isInteger(Number(priority)) ||
    Number(priority) < 1 ||
    Number(priority) > 5
  ) {
    throw new Error("Invalid scheduling details");
  }

  const requestedStart = new Date(appointment_start);

  if (Number.isNaN(requestedStart.getTime())) {
    throw new Error("Invalid appointment date or time");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // A doctor may schedule only a treatment assigned to their own doctor profile.
    // Admin access is reserved for explicitly provisioned admin accounts.
    const ownedTreatment = await client.query(
      `SELECT t.uuid
       FROM treatment t
       LEFT JOIN doctors d ON d.doctor_id = t.doctor_id
       WHERE t.uuid = $1
         AND ($2 = 'admin' OR ($2 = 'doctor' AND d.user_id = $3))
       FOR UPDATE OF t`,
      [uuid, String(currentUser.role || '').toLowerCase(), currentUser.user_id]
    );
    if (ownedTreatment.rowCount === 0) {
      throw new Error("Treatment record not found or not assigned to your account");
    }

    // Prevent simultaneous scheduling operations for this therapist.
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1))",
      [therapist_id]
    );

    // Update the treatment selected by the doctor.
    const updated = await client.query(
      `UPDATE treatment
       SET therapist_id = $1,
           appointment_start = $2,
           duration_minutes = $3,
           priority = $4
       WHERE uuid = $5
       RETURNING uuid`,
      [
        therapist_id,
        requestedStart,
        Number(duration_minutes),
        Number(priority),
        uuid
      ]
    );

    if (updated.rowCount === 0) {
      throw new Error("Treatment record not found");
    }

    // Fetch all scheduled treatments for this therapist.
    const result = await client.query(
      `SELECT uuid, appointment_start,
              duration_minutes, priority
       FROM treatment
       WHERE therapist_id = $1
         AND appointment_start IS NOT NULL
         AND duration_minutes IS NOT NULL
       FOR UPDATE`,
      [therapist_id]
    );

    const appointments = result.rows.map((row) => ({
      uuid: row.uuid,
      appointment_start: new Date(row.appointment_start).toISOString(),
      duration_minutes: Number(row.duration_minutes),
      priority: Number(row.priority || 1)
    }));

    // Ask Python OR-Tools to calculate the schedule.
    const scheduled = await runOrToolsScheduler(appointments);

    // Save the optimized times in the existing treatment table.
    for (const appointment of scheduled) {
      await client.query(
        `UPDATE treatment
         SET appointment_start = $1
         WHERE uuid = $2`,
        [
          new Date(appointment.appointment_start),
          appointment.uuid
        ]
      );
    }

    await client.query("COMMIT");

    return scheduled;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}



async function getTherapistsForScheduling() {
  const result = await pool.query(`
    SELECT th.therapist_id, th.user_id, u.name, u.email,
           th.specialization, th.experience_years
    FROM therapists th
    JOIN users u ON u.user_id = th.user_id
    ORDER BY u.name
  `);
  return result.rows;
}

async function getTreatments(currentUser) {
  // Every role sees only treatment records linked to their own profile.
  const result = await pool.query(`
    SELECT
      t.uuid,
      t.patient_id,
      t.doctor_id,
      t.therapist_id,
      t.p1, t.p2, t.p3, t.p4, t.p5,
      t.appointment_start,
      t.duration_minutes,
      t.priority,
      COALESCE(t.session_status, 'Scheduled') AS session_status,
      COALESCE(t.session_notes, '') AS session_notes,
      pu.name AS patient_name,
      du.name AS doctor_name,
      tu.name AS therapist_name
    FROM treatment t
    LEFT JOIN patients p ON p.patient_id = t.patient_id
    LEFT JOIN users pu ON pu.user_id = p.user_id
    LEFT JOIN doctors d ON d.doctor_id = t.doctor_id
    LEFT JOIN users du ON du.user_id = d.user_id
    LEFT JOIN therapists th ON th.therapist_id = t.therapist_id
    LEFT JOIN users tu ON tu.user_id = th.user_id
    WHERE
      ($1 = 'doctor' AND d.user_id = $2)
      OR ($1 = 'therapist' AND th.user_id = $2)
      OR ($1 = 'patient' AND p.user_id = $2)
      OR ($1 = 'admin')
    ORDER BY t.appointment_start NULLS LAST
  `, [String(currentUser.role || '').toLowerCase(), currentUser.user_id]);
  return result.rows;
}

async function updateSession(uuid, session_status, session_notes = "", currentUser) {
  const allowed = ["Scheduled", "Ongoing", "Completed", "Missed", "Interrupted"];
  if (!allowed.includes(session_status)) {
    throw new Error("Invalid session status");
  }
  const result = await pool.query(
    `UPDATE treatment
     SET session_status = $1, session_notes = $2
     WHERE uuid = $3
       AND (
         $4 = 'admin'
         OR EXISTS (
           SELECT 1
           FROM doctors d
           WHERE d.doctor_id = treatment.doctor_id
             AND d.user_id = $5
             AND $4 = 'doctor'
         )
         OR EXISTS (
           SELECT 1
           FROM therapists th
           WHERE th.therapist_id = treatment.therapist_id
             AND th.user_id = $5
             AND $4 = 'therapist'
         )
       )
     RETURNING uuid, session_status, session_notes`,
    [session_status, session_notes, uuid, String(currentUser.role || '').toLowerCase(), currentUser.user_id]
  );
  return result.rows[0];
}

async function getAlerts() {
  const result = await pool.query(`
    SELECT a.id, a.patient_id, a.treatment_uuid, a.severity, a.symptoms,
           a.status, a.created_at, a.reported_by,
           pu.name AS patient_name, ru.name AS reporter_name
    FROM emergency_alerts a
    LEFT JOIN patients p ON p.patient_id = a.patient_id
    LEFT JOIN users pu ON pu.user_id = p.user_id
    LEFT JOIN users ru ON ru.user_id = a.reported_by
    ORDER BY a.created_at DESC
  `);
  return result.rows;
}

async function createAlert({ patient_id, treatment_uuid, severity, symptoms, reported_by }) {
  const result = await pool.query(
    `INSERT INTO emergency_alerts
      (patient_id, treatment_uuid, severity, symptoms, reported_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [patient_id || null, treatment_uuid || null, severity || "High", symptoms, reported_by || null]
  );
  return result.rows[0];
}

async function updateAlertStatus(id, status) {
  const allowed = ["Open", "Acknowledged", "Resolved"];
  if (!allowed.includes(status)) throw new Error("Invalid alert status");
  const result = await pool.query(
    `UPDATE emergency_alerts SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}

module.exports = {
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
};
