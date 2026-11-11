const express = require("express");
const app = express();
const { authenticateToken, authorizeRoles } = require("./middleware/authMiddleware");

app.use(express.json({ limit: "6mb" }));

// Login and registration are public; all role-specific data APIs are protected.
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/treatment", authenticateToken, require("./treatment/router"));

// User administration endpoints must not be public.
app.use("/api/users", authenticateToken, authorizeRoles("admin"), require("./users/router"));

app.get("/api/test-users", authenticateToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Users test route works" });
});

app.get("/", (req, res) => {
  res.send("Welcome to the Ayurdhara API");
});

module.exports = app;
