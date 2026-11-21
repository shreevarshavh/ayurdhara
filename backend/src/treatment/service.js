
const pool = require("../config/db");
async function getPatients() {
  const result = await pool.query(`
    SELECT p.patient_id, p.user_id, u.name, u.email, u.phone_number,
           p.height_cm AS height, p.weight_kg AS weight, p.address, p.blood_group
    FROM patients p
    JOIN users u ON p.user_id = u.user_id
    ORDER BY u.name
  `);
  return result.rows;
}

async function getPatientProfile(patientId) {
  const result = await pool.query(`
    SELECT p.patient_id, p.user_id, u.name, u.email, u.phone_number,
           u.created_at, p.height_cm AS height, p.weight_kg AS weight, p.address, p.blood_group,
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
  const result = await pool.query(`
    SELECT
      d.doctor_id,
      d.user_id,
      u.name,
      u.email,
      u.phone_number,
      d.degree,
      d.specialization,
      d.license_number,
      d.approval_status
    FROM doctors d
    JOIN users u ON u.user_id = d.user_id
    ORDER BY u.name
  `);

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

// Schedule a treatment without moving existing appointments. The scheduler checks
// therapist expertise, configured work days/hours, treatment duration, existing
// appointments, and doctor priority. All scheduling writes happen in one transaction.
async function createTreatmentPlan({
  patient_id,
  treatment_name,
  treatment_requirements = "",
  duration_minutes = 60,
  priority = 2,
  doctor_id,
  therapist_id = null,
  appointment_start = null
}, currentUser) {
  const name = String(treatment_name || "").trim();
  const duration = Number(duration_minutes);
  const treatmentPriority = Number(priority);
  if (!patient_id || !name) throw new Error("Patient and treatment name are required");
  if (!Number.isInteger(duration) || duration < 15 || duration > 480) {
    throw new Error("Treatment duration must be between 15 and 480 minutes");
  }
  if (!Number.isInteger(treatmentPriority) || treatmentPriority < 1 || treatmentPriority > 5) {
    throw new Error("Priority must be between 1 and 5");
  }

  const role = String(currentUser.role || "").toLowerCase();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const patient = await client.query("SELECT patient_id FROM patients WHERE patient_id = $1", [patient_id]);
    if (!patient.rowCount) throw new Error("Patient record not found");

    let assignedDoctorId = doctor_id || null;
    if (role === "doctor") {
      const doctor = await client.query("SELECT doctor_id FROM doctors WHERE user_id = $1", [currentUser.user_id]);
      if (!doctor.rowCount) throw new Error("Doctor profile not found");
      assignedDoctorId = doctor.rows[0].doctor_id;
    }
    if (role === "admin" && !assignedDoctorId) {
      throw new Error("Choose the doctor responsible for this treatment");
    }

    let chosenTherapistId = therapist_id || null;
    if (chosenTherapistId) {
      const therapistCheck = await client.query("SELECT therapist_id FROM therapists WHERE therapist_id = $1", [chosenTherapistId]);
      if (!therapistCheck.rowCount) throw new Error("Therapist record not found");
    }

    let parsedStart = null;
    if (appointment_start) {
      const startCandidate = new Date(appointment_start);
      if (Number.isNaN(startCandidate.getTime())) {
        throw new Error("Invalid appointment date or time");
      }
      parsedStart = startCandidate;
    }

    const result = await client.query(
      `INSERT INTO treatment
        (patient_id, doctor_id, therapist_id, appointment_start, p1, treatment_name, treatment_requirements,
         duration_minutes, priority, session_status, session_notes)
       VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, 'Scheduled', '')
       RETURNING uuid, patient_id, doctor_id, therapist_id, appointment_start, p1, treatment_name, treatment_requirements,
                 duration_minutes, priority, session_status`,
      [patient_id, assignedDoctorId, chosenTherapistId, parsedStart, name, String(treatment_requirements || "").trim(), duration, treatmentPriority]
    );

    const plan = result.rows[0];

    if (chosenTherapistId && parsedStart) {
      await client.query(
        `INSERT INTO treatment_sessions
           (treatment_uuid, therapist_id, appointment_start,
            duration_minutes, priority, session_status)
         VALUES ($1, $2, $3, $4, $5, 'Scheduled')`,
        [plan.uuid, chosenTherapistId, parsedStart, duration, treatmentPriority]
      );
    }

    await client.query("COMMIT");
    return plan;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}


async function scheduleTreatment({
  uuid,
  therapist_id,
  appointment_start,
  duration_minutes,
  priority
}, currentUser) {
  const duration = Number(duration_minutes);
  const requestedPriority =
    priority == null || priority === "" ? null : Number(priority);

  if (
    !uuid ||
    !appointment_start ||
    !Number.isInteger(duration) ||
    duration < 15 ||
    duration > 480 ||
    (requestedPriority !== null &&
      (!Number.isInteger(requestedPriority) ||
        requestedPriority < 1 ||
        requestedPriority > 5))
  ) {
    throw new Error("Invalid scheduling details");
  }

  const requestedStart = new Date(appointment_start);

  if (Number.isNaN(requestedStart.getTime())) {
    throw new Error("Invalid appointment date or time");
  }

  if (requestedStart.getTime() < Date.now() - 60000) {
    throw new Error("Choose a future appointment time");
  }

  const role = String(currentUser.role || "").toLowerCase();

  if (!["admin", "doctor"].includes(role)) {
    throw new Error("Only doctors and admins can schedule treatments");
  }

  // Use local wall-clock times consistently with the current Python solver.
  const pad = (value) => String(value).padStart(2, "0");

  const formatLocalDateTime = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

  const dayStart = new Date(
    requestedStart.getFullYear(),
    requestedStart.getMonth(),
    requestedStart.getDate(),
    0, 0, 0, 0
  );

  const nextDay = new Date(
    requestedStart.getFullYear(),
    requestedStart.getMonth(),
    requestedStart.getDate() + 1,
    0, 0, 0, 0
  );

  // The current Python solver accepts a single calendar day's window.
  const latestStart = new Date(
    requestedStart.getFullYear(),
    requestedStart.getMonth(),
    requestedStart.getDate(),
    23, 45, 0, 0
  );

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Serialize booking changes made through this scheduling function.
    await client.query("SELECT pg_advisory_xact_lock(73190421)");

    const owned = await client.query(
      `SELECT
         t.uuid,
         t.patient_id,
         t.doctor_id,
         t.treatment_name,
         t.treatment_requirements,
         t.p1,
         t.priority
       FROM treatment t
       LEFT JOIN doctors d ON d.doctor_id = t.doctor_id
       WHERE t.uuid = $1
         AND (
           $2 = 'admin'
           OR ($2 = 'doctor' AND d.user_id = $3)
         )
       FOR UPDATE OF t`,
      [uuid, role, currentUser.user_id]
    );

    if (!owned.rowCount) {
      throw new Error(
        "Treatment record not found or not assigned to your account"
      );
    }

    const plan = owned.rows[0];

    const requirements = String(
      plan.treatment_requirements ||
      plan.treatment_name ||
      plan.p1 ||
      ""
    ).trim();

    const treatmentPriority =
      requestedPriority ?? Number(plan.priority || 2);

    // Lock and reuse the existing scheduled session when rescheduling.
    const activeSessionResult = await client.query(
      `SELECT session_id
       FROM treatment_sessions
       WHERE treatment_uuid = $1
         AND session_status = 'Scheduled'
       ORDER BY appointment_start DESC
       LIMIT 1
       FOR UPDATE`,
      [uuid]
    );

    const activeSessionId =
      activeSessionResult.rows[0]?.session_id ?? null;

    // Load therapist information from PostgreSQL.
    const therapistResult = await client.query(
      `SELECT
         th.therapist_id,
         th.user_id,
         u.name,
         th.specialization,
         CASE
           WHEN pg_typeof(th.expertise) = 'text[]'::regtype
             THEN th.expertise::TEXT[]
           ELSE
             CASE
               WHEN NULLIF(BTRIM(th.expertise::text), '') IS NULL
                 THEN ARRAY[]::TEXT[]
               ELSE ARRAY[BTRIM(th.expertise::text)]::TEXT[]
             END
         END AS expertise,
         COALESCE(
           th.work_days::SMALLINT[],
           ARRAY[1,2,3,4,5,6]::SMALLINT[]
         ) AS work_days,
         COALESCE(th.workday_start, TIME '09:00')::text
           AS workday_start,
         COALESCE(th.workday_end, TIME '17:00')::text
           AS workday_end
       FROM therapists th
       JOIN users u ON u.user_id = th.user_id
       WHERE LOWER(u.role) = 'therapist'
       ORDER BY u.name`
    );

    let therapists = therapistResult.rows;

    if (!therapists.length) {
      throw new Error("No therapists are registered in the system");
    }

    // Keep the requested therapist first as a preference, if supplied.
    if (therapist_id) {
      therapists.sort((a, b) => {
        const aPreferred =
          String(a.therapist_id) === String(therapist_id);
        const bPreferred =
          String(b.therapist_id) === String(therapist_id);

        return Number(bPreferred) - Number(aPreferred);
      });
    }

    const therapistIds = therapists.map(
      (therapist) => therapist.therapist_id
    );

    // Fetch appointments for the requested calendar day.
    // Exclude this treatment's current session when rescheduling it.
    const bookingsResult = await client.query(
      `SELECT
         session_id,
         therapist_id,
         appointment_start,
         COALESCE(duration_minutes, 60) AS duration_minutes
       FROM treatment_sessions
       WHERE therapist_id = ANY($1::uuid[])
         AND appointment_start >= $2
         AND appointment_start < $3
         AND ($4::bigint IS NULL OR session_id <> $4::bigint)`,
      [therapistIds, dayStart, nextDay, activeSessionId]
    );

    // Send local, timezone-naive timestamps to match the current
    // Python solver's naive datetime inputs.
    const existingAppointments = bookingsResult.rows.map((booking) => {
      const start = new Date(booking.appointment_start);

      return {
        therapist_id: String(booking.therapist_id),
        appointment_start: formatLocalDateTime(start),
        duration_minutes: Number(booking.duration_minutes)
      };
    });

    // Google OR-Tools CP-SAT makes the scheduling decision.
    let solverResponse;

    try {
      solverResponse = await fetch(
        process.env.ORTOOLS_SOLVER_URL ||
        "http://127.0.0.1:8000/schedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            treatment_name: requirements,
            duration_minutes: duration,
            priority: treatmentPriority,
            earliest_start: formatLocalDateTime(requestedStart),
            latest_start: formatLocalDateTime(latestStart),

            therapists: therapists.map((therapist) => ({
              therapist_id: String(therapist.therapist_id),
              name: therapist.name,
              expertise: Array.isArray(therapist.expertise)
                ? therapist.expertise
                : [],
              work_days: (therapist.work_days || []).map(Number),
              workday_start: therapist.workday_start,
              workday_end: therapist.workday_end
            })),

            existing_appointments: existingAppointments
          })
        }
      );
    } catch (error) {
      throw new Error(
        "Unable to connect to the Python OR-Tools service. " +
        "Check that the solver is running on port 8000. " +
        error.message
      );
    }

    let solverResult;

    try {
      solverResult = await solverResponse.json();
    } catch {
      throw new Error("The Python solver returned an invalid response");
    }

    if (!solverResponse.ok) {
      const detail = solverResult.detail;

      throw new Error(
        typeof detail === "string"
          ? detail
          : detail
            ? JSON.stringify(detail)
            : "The Python solver request failed"
      );
    }

    if (
      !["OPTIMAL", "FEASIBLE"].includes(solverResult.status) ||
      !solverResult.therapist_id ||
      !solverResult.appointment_start
    ) {
      throw new Error(
        "No feasible appointment was found by OR-Tools. " +
        "Check therapist expertise, working hours, and existing bookings."
      );
    }

    const chosenTherapist = therapists.find(
      (therapist) =>
        String(therapist.therapist_id) ===
        String(solverResult.therapist_id)
    );

    if (!chosenTherapist) {
      throw new Error(
        "The solver selected a therapist not found in the database"
      );
    }

    const chosenSlot = new Date(solverResult.appointment_start);

    if (
      Number.isNaN(chosenSlot.getTime()) ||
      chosenSlot < requestedStart ||
      chosenSlot > latestStart
    ) {
      throw new Error(
        "The solver returned an invalid appointment time"
      );
    }

    const chosenEnd = new Date(
      chosenSlot.getTime() + duration * 60000
    );

    if (
      chosenSlot.getFullYear() !== requestedStart.getFullYear() ||
      chosenSlot.getMonth() !== requestedStart.getMonth() ||
      chosenSlot.getDate() !== requestedStart.getDate() ||
      chosenEnd > nextDay
    ) {
      throw new Error(
        "The solver returned an appointment outside the requested day"
      );
    }

    // Defensive conflict check immediately before saving.
    // The advisory lock also serializes other callers using this function.
    const conflictResult = await client.query(
      `SELECT session_id
       FROM treatment_sessions
       WHERE therapist_id = $1
         AND session_status IN ('Scheduled', 'Ongoing')
         AND ($2::bigint IS NULL OR session_id <> $2::bigint)
         AND appointment_start < $4
         AND appointment_start
             + (COALESCE(duration_minutes, 60) * INTERVAL '1 minute') > $3
       LIMIT 1`,
      [
        chosenTherapist.therapist_id,
        activeSessionId,
        chosenSlot,
        chosenEnd
      ]
    );

    if (conflictResult.rowCount) {
      throw new Error(
        "The selected therapist's slot was booked by another appointment. Please try scheduling again."
      );
    }

    // Save the solver's selected appointment to the treatment record.
    const saved = await client.query(
      `UPDATE treatment
       SET therapist_id = $1,
           appointment_start = $2,
           duration_minutes = $3,
           priority = $4,
           session_status = 'Scheduled'
       WHERE uuid = $5
       RETURNING
         uuid,
         therapist_id,
         appointment_start,
         duration_minutes,
         priority`,
      [
        chosenTherapist.therapist_id,
        chosenSlot,
        duration,
        treatmentPriority,
        uuid
      ]
    );

    let sessionResult;

    if (activeSessionId !== null) {
      sessionResult = await client.query(
        `UPDATE treatment_sessions
         SET therapist_id = $1,
             appointment_start = $2,
             duration_minutes = $3,
             priority = $4,
             session_status = 'Scheduled',
             updated_at = NOW()
         WHERE session_id = $5
         RETURNING session_id`,
        [
          chosenTherapist.therapist_id,
          chosenSlot,
          duration,
          treatmentPriority,
          activeSessionId
        ]
      );
    } else {
      sessionResult = await client.query(
        `INSERT INTO treatment_sessions
           (treatment_uuid, therapist_id, appointment_start,
            duration_minutes, priority, session_status)
         VALUES ($1, $2, $3, $4, $5, 'Scheduled')
         RETURNING session_id`,
        [
          uuid,
          chosenTherapist.therapist_id,
          chosenSlot,
          duration,
          treatmentPriority
        ]
      );
    }

    await client.query("COMMIT");

    const row = saved.rows[0];

    return [{
      ...row,
      session_id: sessionResult.rows[0]?.session_id,
      therapist_name: chosenTherapist.name,
      appointment_end: chosenEnd.toISOString(),
      auto_adjusted:
        chosenSlot.getTime() !== requestedStart.getTime(),
      scheduling_note:
        chosenSlot.getTime() !== requestedStart.getTime()
          ? "OR-Tools selected a feasible time based on therapist availability and existing appointments."
          : "The requested appointment time is available."
    }];
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
           th.specialization, th.experience_years,
           CASE
    WHEN pg_typeof(th.expertise) = 'text[]'::regtype
        THEN th.expertise::TEXT[]
    ELSE
        CASE
            WHEN NULLIF(BTRIM(th.expertise::text), '') IS NULL
                THEN ARRAY[]::TEXT[]
            ELSE ARRAY[BTRIM(th.expertise::text)]::TEXT[]
        END
END AS expertise,
           COALESCE(th.work_days::SMALLINT[], ARRAY[1,2,3,4,5,6]::SMALLINT[]) AS work_days,
           COALESCE(th.workday_start, TIME '09:00')::text AS workday_start,
           COALESCE(th.workday_end, TIME '17:00')::text AS workday_end
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
      COALESCE(t.treatment_name, t.p1) AS p1, t.p2, t.p3, t.p4, t.p5,
      t.treatment_name, t.treatment_requirements,
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

async function getTreatmentSessions(currentUser) {
  const result = await pool.query(`
    SELECT s.session_id, s.treatment_uuid, t.patient_id, t.doctor_id, s.therapist_id,
           COALESCE(t.treatment_name, t.p1, 'Panchakarma treatment') AS treatment_name,
           COALESCE(t.treatment_name, t.p1, 'Panchakarma treatment') AS p1,
           t.treatment_requirements, s.appointment_start, s.duration_minutes, s.priority,
           s.session_status, s.session_notes, s.outcome, s.completed_at,
           pu.name AS patient_name, du.name AS doctor_name, tu.name AS therapist_name
    FROM treatment_sessions s
    JOIN treatment t ON t.uuid = s.treatment_uuid
    LEFT JOIN patients p ON p.patient_id = t.patient_id
    LEFT JOIN users pu ON pu.user_id = p.user_id
    LEFT JOIN doctors d ON d.doctor_id = t.doctor_id
    LEFT JOIN users du ON du.user_id = d.user_id
    LEFT JOIN therapists th ON th.therapist_id = s.therapist_id
    LEFT JOIN users tu ON tu.user_id = th.user_id
    WHERE
      ($1 = 'admin')
      OR ($1 = 'doctor' AND d.user_id = $2)
      OR ($1 = 'therapist' AND th.user_id = $2)
      OR ($1 = 'patient' AND p.user_id = $2)
    ORDER BY s.appointment_start DESC, s.session_id DESC
  `, [String(currentUser.role || '').toLowerCase(), currentUser.user_id]);
  return result.rows;
}

async function updateTreatmentSession(sessionId, session_status, session_notes = "", outcome = "", currentUser) {
  const allowed = ["Scheduled", "Ongoing", "Completed", "Missed", "Interrupted"];
  if (!allowed.includes(session_status)) throw new Error("Invalid session status");

  const role = String(currentUser.role || '').toLowerCase();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const access = await client.query(`
      SELECT s.session_id, s.treatment_uuid
      FROM treatment_sessions s
      JOIN treatment t ON t.uuid = s.treatment_uuid
      LEFT JOIN doctors d ON d.doctor_id = t.doctor_id
      LEFT JOIN therapists th ON th.therapist_id = s.therapist_id
      WHERE s.session_id = $1
        AND ($2 = 'admin' OR ($2 = 'doctor' AND d.user_id = $3)
             OR ($2 = 'therapist' AND th.user_id = $3))
      FOR UPDATE OF s`, [sessionId, role, currentUser.user_id]);
    if (!access.rowCount) {
      await client.query("ROLLBACK");
      return null;
    }

    const updated = await client.query(`
      UPDATE treatment_sessions
      SET session_status = $1, session_notes = $2, outcome = $3,
          completed_at = CASE WHEN $1 = 'Completed' THEN COALESCE(completed_at, NOW()) ELSE NULL END,
          updated_at = NOW()
      WHERE session_id = $4
      RETURNING session_id, treatment_uuid, session_status, session_notes, outcome, completed_at`,
      [session_status, String(session_notes || ''), String(outcome || ''), sessionId]);

    // Keep the old treatment columns synchronized for screens/integrations that still use them.
    await client.query(`
      UPDATE treatment t
      SET session_status = latest.session_status,
          session_notes = latest.session_notes,
          therapist_id = latest.therapist_id,
          appointment_start = latest.appointment_start,
          duration_minutes = latest.duration_minutes,
          priority = latest.priority
      FROM (
        SELECT treatment_uuid, session_status, session_notes, therapist_id,
               appointment_start, duration_minutes, priority
        FROM treatment_sessions
        WHERE treatment_uuid = $1
        ORDER BY appointment_start DESC, session_id DESC
        LIMIT 1
      ) latest
      WHERE t.uuid = latest.treatment_uuid`, [updated.rows[0].treatment_uuid]);

    await client.query("COMMIT");
    return updated.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updateSession(uuid, session_status, session_notes = "", currentUser) {
  const allowed = ["Scheduled", "Ongoing", "Completed", "Missed", "Interrupted"];
  if (!allowed.includes(session_status)) throw new Error("Invalid session status");
  const latest = await pool.query(
    `SELECT session_id FROM treatment_sessions
     WHERE treatment_uuid = $1
     ORDER BY appointment_start DESC, session_id DESC LIMIT 1`, [uuid]
  );
  if (!latest.rowCount) return null;
  return updateTreatmentSession(latest.rows[0].session_id, session_status, session_notes, "", currentUser);
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
  getTreatmentSessions,
  updateTreatmentSession,
  createTreatmentPlan,
  getTherapistsForScheduling,
  updateSession,
  getAlerts,
  createAlert,
  updateAlertStatus,
  scheduleTreatment
};
