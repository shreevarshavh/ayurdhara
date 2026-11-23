const { initializeApp, cert, getApps } = require("firebase-admin/app");
const path = require("path");

const serviceAccount = require(
  path.resolve(__dirname, "../../serviceAccountKey.json")
);

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
      })
    : getApps()[0];

module.exports = app;