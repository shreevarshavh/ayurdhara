# AyurDhara — Panchakarma Care Coordination

This project includes the existing Node.js/Express + PostgreSQL backend and a new React/Vite frontend inspired by the supplied AyurDhara reference UI.

## Included working flows

- Email/password login using the existing `users` table and bcrypt password hashes.
- Role-aware sidebar for patient/doctor/therapist/admin experiences.
- Dashboard metrics derived from live API data.
- Patient list and create-patient action.
- Treatment plan list from the existing `treatment` table.
- Scheduling/rescheduling through `POST /api/treatment/schedule`, which invokes the Python OR-Tools scheduler and writes times to PostgreSQL.
- Session status and observation notes.
- Emergency alert create, list, acknowledge, and resolve.
- Progress summary derived from saved session statuses.
- CSV report export.
- Admin user list, create, and delete actions.

## Important notes

1. The uploaded archive contained the backend but no frontend source. The `frontend/` folder here is newly created.
2. Before running the new treatment/session/alert screens, apply `backend/sql/frontend_integration.sql` to the same PostgreSQL database. It adds `session_status` and `session_notes` columns to `treatment` and creates `emergency_alerts`. It does not drop existing clinical records.
3. Login returns a JWT, but the existing API routes have not yet been protected by JWT/role authorization middleware. The UI hides some navigation by role, but that is not a security boundary. Add and apply server-side authorization before deploying to production.
4. The project deliberately does not add Prakriti/Dosha assessment pages. The supplied reference image includes them, but the current project direction excludes those pages.
5. Features such as email OTP, doctor approval workflow, a clinical report PDF, and a detailed longitudinal symptom/outcome model are not implemented by the backend code in the uploaded archive.

## Setup on Windows

### 1. Backend

Open a terminal in the `backend` folder:

```powershell
npm install
```

Create `backend/.env` using `backend/.env.example` as a template. Fill in your actual PostgreSQL connection values and set a strong `JWT_SECRET`. Do not commit `.env`.

Apply the additive migration using pgAdmin Query Tool, connected to the same database as your backend:

- Open `backend/sql/frontend_integration.sql`.
- Execute the SQL.
- Confirm it completes without errors.

Confirm Python and OR-Tools are available in the backend terminal:

```powershell
python --version
python -c "from ortools.sat.python import cp_model; print('OR-Tools ready')"
```

If `python` is not the Python environment containing OR-Tools, set `PYTHON_PATH` in `.env` to the full path of that Python executable.

Start the backend:

```powershell
npm run dev
```

It should report that the AyurDhara server is running on port 5000.

### 2. Frontend

Open a second terminal in `frontend/`:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

The Vite development server proxies `/api` requests to `http://localhost:5000`.

## API endpoints used by the frontend

- `POST /api/auth/login`
- `GET /api/treatment/patients`
- `GET /api/treatment`
- `GET /api/treatment/therapists`
- `POST /api/treatment/schedule`
- `PATCH /api/treatment/:uuid/session`
- `GET /api/treatment/alerts`
- `POST /api/treatment/alerts`
- `PATCH /api/treatment/alerts/:id`
- `GET /api/users`
- `POST /api/users`
- `DELETE /api/users/:id`

## Troubleshooting

- **Login fails:** confirm the user exists in `users`, the password was stored as a bcrypt hash, and the backend is connected to the expected database.
- **Treatment screen returns a database error:** run the SQL migration and verify the `treatment`, `patients`, `doctors`, `therapists`, and `users` tables have the expected columns.
- **Scheduling fails to start Python:** confirm `scheduler.py` is at `backend/src/treatment/scheduler.py` and set `PYTHON_PATH` if needed.
- **No therapists in the scheduling dropdown:** add a valid therapist user and corresponding `therapists` row.
- **Port 5000 is busy:** change `PORT` in backend `.env` and update the proxy target in `frontend/vite.config.js` to match.

## Security reminder

This is a local development integration. Do not expose it publicly until server-side JWT validation, role authorization, input validation, audit logging, and appropriate account approval rules are enforced.
