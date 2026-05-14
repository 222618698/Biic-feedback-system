// backend/routes/feedback.js
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middleware/auth');
const upload   = require('../middleware/upload');

// ── Public ────────────────────────────────────────────────────
router.get('/feedback/categories',  ctrl.getCategories);
router.get('/feedback/departments', ctrl.getDepartments);

// ── Serve proof files (auth required) ─────────────────────────
router.get('/proofs/:id', protect, ctrl.serveProof);

// ── Authenticated users ───────────────────────────────────────
// POST /api/feedback — submit with optional proof files
router.post('/feedback', protect, upload.array('proof_files', 5), ctrl.submit);
// GET  /api/feedback/my — own submission history
router.get('/feedback/my', protect, ctrl.getMySubmissions);

// ── Admin only ────────────────────────────────────────────────
router.get('/admin/submissions',              protect, adminOnly, ctrl.getAllSubmissions);
router.put('/admin/submissions/:id/status',   protect, adminOnly, ctrl.updateStatus);
router.get('/admin/users',                    protect, adminOnly, ctrl.getAllUsers);

module.exports = router;
