# AyurDhara – Sketch-inspired login and registration UI

The frontend authentication screen now follows the hand-drawn reference: patient login on the left and patient registration on the right. It includes name, email, password confirmation, height, weight, address, blood group, and phone number.

## Files changed
- `frontend/src/components/Login.jsx` – login and registration forms.
- `frontend/src/styles.css` – responsive layout styling.
- `backend/src/routes/authRoutes.js` – patient registration endpoint cleanup.
- `backend/sql/patient_registration_profile.sql` – adds profile fields to the `patients` table.

## Before running
1. Back up your current project.
2. Use this ZIP as the new project copy or copy the changed files into your existing project, preserving paths.
3. Open pgAdmin and run `backend/sql/patient_registration_profile.sql` against the same PostgreSQL database used by the backend.
4. Ensure the `users` table has a `phone_number` column and that `patients.user_id` references `users.user_id`.
5. Start backend and frontend in separate terminals:
   - Backend: `cd backend` then `npm run dev` (or your package's configured start command).
   - Frontend: `cd frontend` then `npm run dev`.

## Notes
- The public registration form creates **patient** accounts only. Doctor and therapist accounts should be created through an authorized admin workflow.
- Registration uses bcrypt to hash passwords, matching this project's `/api/auth/login` implementation.
- The patient registration route saves height, weight, address and blood group only after the profile migration is applied.
- This update changes the login/registration screen, not the logged-in dashboard design. Existing dashboard navigation remains in the app.
