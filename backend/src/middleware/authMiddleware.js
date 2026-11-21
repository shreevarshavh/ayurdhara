const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "ayurdhara-local-development-secret";

function normalizeRole(role) {
  const value = String(role || "").trim().toLowerCase();

  // Treat Practitioner as Doctor throughout backend authorization.
  if (value === "practitioner") {
    return "doctor";
  }

  return value;
}

function authenticateToken(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Authentication required. Please log in."
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);

    // Normalize role before checking permissions.
    req.user.role = normalizeRole(req.user.role);

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Your login session is invalid or expired. Please log in again."
    });
  }
}

function authorizeRoles(...allowedRoles) {
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.role);

    if (!req.user || !normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource."
      });
    }

    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};