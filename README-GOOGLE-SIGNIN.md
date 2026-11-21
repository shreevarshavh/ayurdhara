# AyurDhara — Patient Google Sign-In Patch

## What this adds
- Google Identity Services button on the existing login page.
- Backend verification of Google's ID token and verified email.
- Existing patient accounts are linked using Google's stable `sub` identifier.
- New Google users are created as `patient` and receive a row in `patients`.
- Practitioner, therapist, and admin accounts cannot use this patient Google sign-in route.

## 1. Google Cloud setup
1. Open https://console.cloud.google.com/
2. Create/select your AyurDhara project.
3. Configure Google Auth Platform / OAuth consent screen.
4. Create an OAuth Client ID with application type **Web application**.
5. Add `http://localhost:5173` under **Authorized JavaScript origins**.
6. Copy the Client ID (not a client secret).

## 2. Apply the files
Copy the files in this patch into the matching paths in your project, replacing those files.
Do not replace your existing backend `.env`.

## 3. Configure environment variables
In `frontend/.env`, add:
`VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID`

In your existing `backend/.env`, add:
`GOOGLE_CLIENT_ID=YOUR_CLIENT_ID`

Use the same Client ID in both places. Do not add a Google client secret; this ID-token flow does not need one.

## 4. Run the database migration
In pgAdmin, select the AyurDhara database and execute:
`backend/sql/google_signin.sql`

This adds an optional Google subject ID column and a unique index. It does not delete or modify existing patient records.

## 5. Install backend dependency
From the backend folder:
`npm install google-auth-library`

## 6. Restart both servers
Backend:
`npm run dev`

Frontend (new terminal):
`npm run dev`

Open the app at `http://localhost:5173`.

## Notes
- The Google button is rendered by Google's Identity Services library.
- The backend independently verifies the Google ID token and verified email.
- Google sign-in is patient-only. Staff accounts must continue using staff login.
- Existing email/password login and registration are preserved.
- Never commit `.env` files or share OAuth credentials.
