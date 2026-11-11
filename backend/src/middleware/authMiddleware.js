const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "ayurdhara-local-development-secret";

function authenticateToken(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required. Please log in." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Your login session is invalid or expired. Please log in again." });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(String(req.user.role || "").toLowerCase())) {
      return res.status(403).json({ message: "You do not have permission to access this resource." });
    }
    return next();
  };
}

module.exports = { authenticateToken, authorizeRoles };
