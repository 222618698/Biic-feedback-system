// backend/routes/feedback.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middleware/auth');

// ── Public ────────────────────────────────────────────────────
// GET /api/feedback/categories
router.get('/categories',  ctrl.getCategories);
// GET /api/feedback/departments
router.get('/departments', ctrl.getDepartments);

// ── Authenticated users ───────────────────────────────────────
// POST /api/feedback  — submit new feedback
router.post('/', protect, ctrl.submit);

// ── Admin only ────────────────────────────────────────────────
// GET  /api/admin/submissions        — list all with filters
router.get( '/admin/submissions',         protect, adminOnly, ctrl.getAllSubmissions);
// GET  /api/admin/submissions/:id    — detail view
router.get( '/admin/submissions/:id',     protect, adminOnly, ctrl.getSubmissionById);
// PUT  /api/admin/submissions/:id/status — update status
router.put( '/admin/submissions/:id/status', protect, adminOnly, ctrl.updateStatus);
// GET  /api/admin/users              — all registered users
router.get( '/admin/users',               protect, adminOnly, ctrl.getAllUsers);

module.exports = router;
