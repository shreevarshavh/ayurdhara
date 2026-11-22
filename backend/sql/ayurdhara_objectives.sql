-- AyurDhara objective-completion migration (additive; does not delete existing records).
-- Run after patient_registration_profile.sql and frontend_integration.sql.

ALTER TABLE public.treatment
  ADD COLUMN IF NOT EXISTS treatment_name TEXT,
  ADD COLUMN IF NOT EXISTS treatment_requirements TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS priority INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS session_status VARCHAR(30) NOT NULL DEFAULT 'Scheduled',
  ADD COLUMN IF NOT EXISTS session_notes TEXT NOT NULL DEFAULT '';

-- Preserve the existing treatment label convention used by earlier screens.
UPDATE public.treatment
SET treatment_name = p1
WHERE treatment_name IS NULL AND p1 IS NOT NULL;

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS gender VARCHAR(30),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS expertise TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS work_days SMALLINT[] NOT NULL DEFAULT ARRAY[1,2,3,4,5,6]::SMALLINT[],
  ADD COLUMN IF NOT EXISTS workday_start TIME NOT NULL DEFAULT TIME '09:00',
  ADD COLUMN IF NOT EXISTS workday_end TIME NOT NULL DEFAULT TIME '17:00';

-- The scheduler uses these indexes when checking appointment conflicts.
CREATE INDEX IF NOT EXISTS idx_treatment_therapist_start
  ON public.treatment (therapist_id, appointment_start)
  WHERE appointment_start IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_treatment_patient
  ON public.treatment (patient_id);

-- Backfill an empty expertise list from the existing specialization when possible.
UPDATE public.therapists
SET expertise = ARRAY[TRIM(specialization)]::TEXT[]
WHERE COALESCE(array_length(expertise, 1), 0) = 0
  AND specialization IS NOT NULL
  AND TRIM(specialization) <> '';

-- Ensure emergency alerts exist for the monitoring dashboard.
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

CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status_created
  ON public.emergency_alerts (status, created_at DESC);
