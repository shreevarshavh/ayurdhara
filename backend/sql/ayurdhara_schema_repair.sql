-- AyurDhara schema repair for the legacy schema shown in the ER diagram.
-- Additive and re-runnable: it does not drop or rename existing data.
-- Run this in pgAdmin against the SAME database configured in backend/.env.

DO $$
BEGIN
  IF to_regclass('public.users') IS NULL THEN
    RAISE EXCEPTION 'public.users is missing. Select the database used by AyurDhara before running this migration.';
  END IF;
  IF to_regclass('public.patients') IS NULL THEN
    RAISE EXCEPTION 'public.patients is missing. Run the base schema setup before this migration.';
  END IF;
  IF to_regclass('public.doctors') IS NULL THEN
    RAISE EXCEPTION 'public.doctors is missing. Run the base schema setup before this migration.';
  END IF;
  IF to_regclass('public.therapists') IS NULL THEN
    RAISE EXCEPTION 'public.therapists is missing. Run the base schema setup before this migration.';
  END IF;
  IF to_regclass('public.treatment') IS NULL THEN
    RAISE EXCEPTION 'public.treatment is missing. Run the base schema setup before this migration.';
  END IF;
END $$;

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS gender VARCHAR(30),
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5),
  ADD COLUMN IF NOT EXISTS profile_photo TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Existing ERD has p1-p5, appointment_start, duration_minutes, priority, and session_status.
-- Keep these legacy columns and add the clearer fields used by the current API.
ALTER TABLE public.treatment
  ADD COLUMN IF NOT EXISTS treatment_name TEXT,
  ADD COLUMN IF NOT EXISTS treatment_requirements TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS appointment_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS session_status VARCHAR(30) NOT NULL DEFAULT 'Scheduled',
    ADD COLUMN IF NOT EXISTS clinical_notes TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS session_notes TEXT NOT NULL DEFAULT '';
  

-- Keep the current API and the original p1-p5 design in sync.
UPDATE public.treatment
SET treatment_name = COALESCE(NULLIF(BTRIM(treatment_name), ''), NULLIF(BTRIM(p1), ''))
WHERE treatment_name IS NULL OR BTRIM(treatment_name) = '';

UPDATE public.treatment
SET p1 = treatment_name
WHERE (p1 IS NULL OR BTRIM(p1) = '') AND treatment_name IS NOT NULL;

ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS expertise TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS work_days SMALLINT[] NOT NULL DEFAULT ARRAY[1,2,3,4,5,6]::SMALLINT[],
  ADD COLUMN IF NOT EXISTS workday_start TIME NOT NULL DEFAULT TIME '09:00',
  ADD COLUMN IF NOT EXISTS workday_end TIME NOT NULL DEFAULT TIME '17:00';

UPDATE public.therapists
SET expertise = ARRAY[BTRIM(specialization)]::TEXT[]
WHERE COALESCE(array_length(expertise, 1), 0) = 0
  AND specialization IS NOT NULL AND BTRIM(specialization) <> '';

-- therapist_id exists in the supplied ERD; add it only if this database is older.
ALTER TABLE public.treatment ADD COLUMN IF NOT EXISTS therapist_id UUID;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'treatment_therapist_id_fkey') THEN
    ALTER TABLE public.treatment ADD CONSTRAINT treatment_therapist_id_fkey
      FOREIGN KEY (therapist_id) REFERENCES public.therapists(therapist_id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id BIGSERIAL PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(patient_id) ON DELETE SET NULL,
  treatment_uuid UUID REFERENCES public.treatment(uuid) ON DELETE SET NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'High',
  symptoms TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Open',
  reported_by UUID REFERENCES public.users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_therapist_start
  ON public.treatment (therapist_id, appointment_start)
  WHERE appointment_start IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_treatment_patient ON public.treatment (patient_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status_created
  ON public.emergency_alerts (status, created_at DESC);