# AyurDhara frontend split

This copy keeps the existing UI and backend API paths, while moving the long App.jsx UI pieces into separate files.

## Files changed/added
- `frontend/src/App.jsx` — application state, page navigation, API workflow, modal forms.
- `frontend/src/services/api.js` — common fetch helper, including auth token.
- `frontend/src/utils.js` — navigation list and date/ID formatting helpers.
- `frontend/src/components/Login.jsx` — login screen.
- `frontend/src/components/Pages.jsx` — dashboard, patients, treatment plans, sessions, progress, alerts, reports, notifications and user management.
- `frontend/src/components/Scheduling.jsx` — scheduling form and current schedule table.
- `frontend/src/components/Modal.jsx` — reusable modal wrapper.

## Apply the files
1. Make a backup of your current project first.
2. Extract this ZIP.
3. Copy the files inside `frontend/src/` into the same locations in your project, replacing the old `App.jsx` and adding the new folders/files.
4. Keep your existing `frontend/src/styles.css`, `main.jsx`, backend, `.env`, and database unchanged.
5. From the frontend folder run `npm run dev`. In another terminal, start the backend as you normally do.

The existing Vite proxy sends `/api` requests to `http://localhost:5000`, so the shared API helper continues using relative `/api/...` URLs.

## Scheduling
The existing Scheduling page submits to `POST /api/treatment/schedule` and reloads treatments via `loadData()` after success. The backend must be running and the Python OR-Tools dependency must be installed in the environment used by the backend.

This is a code organization change, not a guarantee that the scheduler's constraints are correct; test with overlapping appointments before relying on it.
