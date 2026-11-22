# AyurDhara — Panchakarma Care Coordination

AyurDhara is a React + Vite frontend and Node.js + Express + PostgreSQL backend for managing Panchakarma treatment plans, therapist allocation, constraint-based scheduling, session progress, and patient treatment history.

## Project objectives implemented

1. **Centralized treatment management** — patient and care-team records, doctor-owned treatment plans, treatment requirements, duration, and priority.
2. **Constraint-based scheduling** — therapist expertise matching, configured work days and working hours, duration-aware appointment conflict detection, automatic feasible-slot selection, priority-aware selection, and transactional database writes. Existing appointments are never silently moved to make room for a new booking.
3. **Patient care monitoring** — scheduled/ongoing/completed/missed/interrupted statuses, session notes, patient-wise history, progress metrics, alerts, and CSV reporting.

## Technology

- Frontend: React, Vite, CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: bcrypt password hashing and JWT-based API authorization
- Scheduler: deterministic constraint engine in JavaScript; no separate Python or OR-Tools installation is required

## Folder structure

```text
ayurdhara/
├── backend/
│   ├── sql/
│   │   ├── patient_registration_profile.sql
│   │   ├── frontend_integration.sql
│   │   └── ayurdhara_objectives.sql
│   ├── src/
│   │   ├── config/db.js
│   │   ├── middleware/authMiddleware.js
│   │   ├── routes/authRoutes.js
│   │   ├── treatment/constraintScheduler.js
│   │   ├── treatment/router.js
│   │   ├── treatment/service.js
│   │   ├── users/router.js
│   │   └── users/service.js
│   └── test/constraintScheduler.test.js
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/
        ├── services/api.js
        └── styles.css
```

## Setup on Windows

### 1. Configure PostgreSQL

1. Create or select the PostgreSQL database already used by your AyurDhara project.
2. In `backend/`, copy `.env.example` to `.env`.
3. Fill in your local database name, username, password, and a strong random `JWT_SECRET`. Never share or commit `.env`.
4. Open pgAdmin Query Tool against that exact database and run the migrations in this order:
   - `sql/patient_registration_profile.sql`
   - `sql/frontend_integration.sql`
   - `sql/ayurdhara_objectives.sql`
   - `sql/treatment_sessions.sql` (new: normalizes therapist expertise and creates/backfills individual session history)

The migrations are additive and designed to preserve existing patient/treatment data. Review the SQL and keep a database backup before applying changes to important data.

### 2. Start the backend

Open a terminal in `ayurdhara/backend`:

```powershell
npm install
npm run dev
```

The API uses port `5000` by default. Visit `http://localhost:5000/api/health` to verify the API and PostgreSQL connection. The health endpoint reports database availability without exposing credentials.

### 3. Start the frontend

Open a second terminal in `ayurdhara/frontend`:

```powershell
npm install
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`. Vite proxies `/api` requests to `http://localhost:5000`.

### 4. Create an administrator

Use the existing `backend/createAdmin.js` script if it matches your database schema, or create an administrator using your existing approved setup process. Do not use public patient registration to create an administrator. Review `createAdmin.js` before running it and ensure the credentials are local-only.

## Core workflow

1. A patient registers; the API creates the `users` row and linked `patients` row in one transaction.
2. An administrator creates therapist accounts and records their specialization, expertise keywords, working days, and working hours.
3. A doctor selects a patient and creates a treatment plan with treatment requirements, duration, and priority.
4. The doctor opens Scheduling, chooses a requested date/time and optionally a preferred therapist, then submits the schedule.
5. The scheduling engine checks expertise, workday rules, duration, and existing bookings. If the requested slot conflicts, it finds a feasible alternative within 14 days. It records the chosen therapist/time without shifting existing appointments.
6. Scheduling creates a row in `treatment_sessions`; rescheduling updates the active scheduled row without overwriting completed history.
7. A therapist or doctor records each session's status, observation notes, and outcome. Doctors and patients can review role-permitted chronological session history and progress based on actual session rows.

## API endpoints used by the application

- `POST /api/auth/register` — patient registration
- `POST /api/auth/login` and `GET /api/auth/me` — login and token identity
- `GET /api/treatment` — role-filtered treatment-plan list
- `POST /api/treatment/plans` — create a treatment plan (doctor/admin)
- `POST /api/treatment/schedule` — find and save a feasible appointment (doctor/admin)
- `GET /api/treatment/therapists` — therapist expertise and availability
- `GET /api/treatment/sessions` — role-filtered individual session history
- `PATCH /api/treatment/sessions/:session_id` — update a session's status, observation notes, and outcome
- `PATCH /api/treatment/:uuid/session` — backward-compatible route that updates the latest session-history row
- `GET /api/treatment/patients` and `GET /api/treatment/patients/me` — role-appropriate patient records
- `GET /api/treatment/alerts`, `POST /api/treatment/alerts`, `PATCH /api/treatment/alerts/:id` — care alerts
- `/api/users` — protected user administration/profile routes
- `GET /api/health` — API/database health check

## Tests

The pure scheduling constraint tests use Node's built-in test runner and do not require a running database:

```powershell
cd backend
npm test
```

They cover expertise matching, honoring clinic working hours, shifting a conflicting request to the next feasible 15-minute slot, skipping non-working days, and priority-aware therapist selection.

## Important behavior and limitations

- `CLINIC_UTC_OFFSET_MINUTES` defaults to `330` (India Standard Time). Change it in `.env` if the clinic operates in another timezone.
- Workdays are stored using JavaScript/PostgreSQL weekday numbers: Sunday `0`, Monday `1`, ..., Saturday `6`.
- Therapist expertise is stored as a PostgreSQL `TEXT[]` and matched against treatment requirements. Keep keywords consistent (for example, `Abhyanga`, `Shirodhara`, `Basti`). Therapists without declared expertise/specialization are not eligible for a specific treatment requirement.
- The active API scheduler is `backend/src/treatment/constraintScheduler.js`, a deterministic JavaScript constraint engine. The production scheduling route does not invoke Python or OR-Tools; project documentation and claims should reflect that implementation.
- The included `seedTestUsers.js` script is for local demonstrations only and uses a known temporary password; do not use those accounts or run the script in a deployed environment. The application does not provide medical diagnosis or replace clinical judgment. Treatment decisions and priority are entered by authorized care staff.
- No live production database was available during packaging. Apply migrations and run the local end-to-end test checklist before presenting this as deployed/production-verified.
