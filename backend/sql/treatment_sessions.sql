-- AyurDhara fix pack: consistent expertise type and individual treatment-session history.
-- Run after patient_registration_profile.sql, frontend_integration.sql, and ayurdhara_objectives.sql.
-- This migration is additive and backfills existing appointment rows.

-- Ensure therapist expertise is always stored as a PostgreSQL text array.
ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS expertise TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

DO $$
DECLARE
  expertise_data_type TEXT;
  expertise_udt_name TEXT;
BEGIN
  SELECT data_type, udt_name INTO expertise_data_type, expertise_udt_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'therapists'
    AND column_name = 'expertise';

  IF expertise_udt_name IS NOT NULL AND expertise_udt_name <> '_text' THEN
    EXECUTE 'ALTER TABLE public.therapists ALTER COLUMN expertise DROP DEFAULT';
    IF expertise_data_type = 'ARRAY' THEN
      EXECUTE 'ALTER TABLE public.therapists ALTER COLUMN expertise TYPE TEXT[] USING expertise::text[]';
    ELSE
      EXECUTE $sql$
        ALTER TABLE public.therapists ALTER COLUMN expertise TYPE TEXT[]
        USING CASE
          WHEN expertise IS NULL OR BTRIM(expertise::text) = '' THEN ARRAY[]::TEXT[]
          ELSE string_to_array(BTRIM(expertise::text), ',')
        END
      $sql$;
    END IF;
    EXECUTE 'ALTER TABLE public.therapists ALTER COLUMN expertise SET DEFAULT ARRAY[]::TEXT[]';
  END IF;
END $$;

UPDATE public.therapists
SET expertise = ARRAY[TRIM(specialization)]::TEXT[]
WHERE COALESCE(array_length(expertise, 1), 0) = 0
  AND specialization IS NOT NULL
  AND TRIM(specialization) <> '';

-- Therapist-specific availability is read by the active JavaScript scheduler.
ALTER TABLE public.therapists
  ADD COLUMN IF NOT EXISTS work_days SMALLINT[] NOT NULL DEFAULT ARRAY[1,2,3,4,5,6]::SMALLINT[],
  ADD COLUMN IF NOT EXISTS workday_start TIME NOT NULL DEFAULT TIME '09:00',
  ADD COLUMN IF NOT EXISTS workday_end TIME NOT NULL DEFAULT TIME '17:00';

-- A treatment is a care plan; one plan can contain multiple dated sessions.
CREATE TABLE IF NOT EXISTS public.treatment_sessions (
  session_id BIGSERIAL PRIMARY KEY,
  treatment_uuid UUID NOT NULL REFERENCES public.treatment(uuid) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.therapists(therapist_id) ON DELETE SET NULL,
  appointment_start TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes BETWEEN 15 AND 480),
  priority INTEGER NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 5),
  session_status VARCHAR(30) NOT NULL DEFAULT 'Scheduled'
    CHECK (session_status IN ('Scheduled', 'Ongoing', 'Completed', 'Missed', 'Interrupted')),
  session_notes TEXT NOT NULL DEFAULT '',
  outcome TEXT NOT NULL DEFAULT '',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_sessions_therapist_start
  ON public.treatment_sessions (therapist_id, appointment_start)
  WHERE appointment_start IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_treatment_sessions_plan_start
  ON public.treatment_sessions (treatment_uuid, appointment_start DESC);

-- Preserve appointments already stored on treatment plans. Avoid duplicate backfill rows.
INSERT INTO public.treatment_sessions
  (treatment_uuid, therapist_id, appointment_start, duration_minutes, priority,
   session_status, session_notes, completed_at)
SELECT t.uuid, t.therapist_id, t.appointment_start,
       GREATEST(15, LEAST(480, COALESCE(t.duration_minutes, 60))),
       GREATEST(1, LEAST(5, COALESCE(t.priority, 2))),
       CASE WHEN t.session_status IN ('Scheduled', 'Ongoing', 'Completed', 'Missed', 'Interrupted')
            THEN t.session_status ELSE 'Scheduled' END,
       COALESCE(t.session_notes, ''),
       CASE WHEN t.session_status = 'Completed' THEN NOW() ELSE NULL END
FROM public.treatment t
WHERE t.appointment_start IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.treatment_sessions s
    WHERE s.treatment_uuid = t.uuid
      AND s.appointment_start = t.appointment_start
  );

-- Track when a session becomes completed, including updates made by the API.
CREATE OR REPLACE FUNCTION public.ayurdhara_set_session_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  IF NEW.session_status = 'Completed' AND OLD.session_status IS DISTINCT FROM 'Completed' THEN
    NEW.completed_at := NOW();
  ELSIF NEW.session_status <> 'Completed' THEN
    NEW.completed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ayurdhara_session_completed_at ON public.treatment_sessions;
CREATE TRIGGER trg_ayurdhara_session_completed_at
BEFORE UPDATE ON public.treatment_sessions
FOR EACH ROW EXECUTE FUNCTION public.ayurdhara_set_session_completed_at();
