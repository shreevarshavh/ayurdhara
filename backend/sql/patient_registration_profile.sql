-- AyurDhara patient registration profile fields
-- Run once in the PostgreSQL database used by the backend.
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS height NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS weight NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS blood_group VARCHAR(3),
  ADD COLUMN IF NOT EXISTS profile_photo TEXT;
