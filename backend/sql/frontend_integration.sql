-- AyurDhara frontend integration migration
-- Run this once against the same PostgreSQL database used by backend.
ALTER TABLE treatment
  ADD COLUMN IF NOT EXISTS session_status VARCHAR(30) NOT NULL DEFAULT 'Scheduled',
  ADD COLUMN IF NOT EXISTS session_notes TEXT;

CREATE TABLE IF NOT EXISTS emergency_alerts (
  id BIGSERIAL PRIMARY KEY,
  patient_id UUID REFERENCES patients(patient_id) ON DELETE SET NULL,
  treatment_uuid UUID REFERENCES treatment(uuid) ON DELETE SET NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'High',
  symptoms TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Open',
  reported_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
