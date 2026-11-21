-- Google Sign-In identity mapping for AyurDhara patients.
-- Run once in pgAdmin against the same database used by the backend.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS google_sub TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_unique
  ON public.users (google_sub)
  WHERE google_sub IS NOT NULL;
