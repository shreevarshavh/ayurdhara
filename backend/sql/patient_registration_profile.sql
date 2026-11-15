-- AyurDhara patient profile schema alignment
-- Run this in the SAME PostgreSQL database configured in backend/.env.
-- This migration preserves legacy height/weight data by renaming those columns
-- when needed, then ensures the canonical height_cm/weight_kg columns exist.

DO $$
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RAISE EXCEPTION 'Table public.patients does not exist. Check the database configured in backend/.env.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'height'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'height_cm'
  ) THEN
    ALTER TABLE public.patients RENAME COLUMN height TO height_cm;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'weight'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'weight_kg'
  ) THEN
    ALTER TABLE public.patients RENAME COLUMN weight TO weight_kg;
  END IF;
END $$;

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS blood_group VARCHAR(5),
  ADD COLUMN IF NOT EXISTS profile_photo TEXT;