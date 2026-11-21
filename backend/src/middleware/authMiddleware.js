const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "ayurdhara-local-development-secret";

// Verify the user's login token
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
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Your login session is invalid or expired. Please log in again."
    });
  }
}

// Check whether the user's role is permitted
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = String(req.user?.role || "").toLowerCase();

    const permittedRoles = allowedRoles.map(role =>
      String(role).toLowerCase()
    );

    if (!req.user || !permittedRoles.includes(userRole)) {
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
