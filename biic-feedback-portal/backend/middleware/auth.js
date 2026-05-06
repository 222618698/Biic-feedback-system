// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Protect any route — requires a valid JWT in the Authorization header.
 * Header format:  Authorization: Bearer <token>
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorised — no token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorised — token invalid or expired.' });
  }
};

/**
 * Restrict a route to admins only.
 * Must be used AFTER `protect`.
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied — admin only.' });
  }
  next();
};

module.exports = { protect, adminOnly };
