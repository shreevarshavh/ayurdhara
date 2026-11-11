
const pool = require("../config/db");
const bcrypt = require("bcrypt");


async function createUser(name, email, password, role, phone_number) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, phone_number)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, name, email, role, phone_number, created_at`,
    [name, email, hashedPassword, role, phone_number]
  );

  const user = result.rows[0];

  if (role === "doctor") {
    await pool.query(
      "INSERT INTO doctors (user_id) VALUES ($1)",
      [user.user_id]
    );
  }

  if (role === "patient") {
    await pool.query(
      "INSERT INTO patients (user_id) VALUES ($1)",
      [user.user_id]
    );
  }

  if (role === "therapist") {
    await pool.query(
      "INSERT INTO therapists (user_id) VALUES ($1)",
      [user.user_id]
    );
  }

  return user;
}

async function getUsers({ user_id, name, email, phone_number } = {}) {
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
  let query = `SELECT user_id, name, email, role, phone_number,created_at
               FROM users WHERE role = 'doctor'`;

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

async function getTherapists({ user_id, name, email, phone_number } = {}) {
  let query = `SELECT user_id, name, email, role, phone_number,created_at
               FROM users WHERE role = 'therapist'`;

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

async function TherapistByUserId(user_id) {
  const result = await pool.query(
    `SELECT * FROM therapists WHERE user_id = $1`,
    [user_id]
  );

  return result.rows;
}

async function getTherapistById(therapist_id) {
  const result = await pool.query(
    `SELECT * FROM therapists WHERE therapist_id = $1`,
    [therapist_id]
  );

  return result.rows[0];
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
  TherapistByUserId,
  getTherapistById
};
