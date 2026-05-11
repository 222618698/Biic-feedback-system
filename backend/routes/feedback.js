// backend/routes/feedback.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/feedbackController');
const { protect, adminOnly } = require('../middleware/auth');

// Public
router.get('/feedback/categories',  ctrl.getCategories);
router.get('/feedback/departments', ctrl.getDepartments);

// Authenticated users
router.post('/feedback',     protect, ctrl.submit);
router.get('/feedback/my',   protect, ctrl.getMySubmissions);  // ← NEW: user's own history

// Admin only
router.get('/admin/submissions',              protect, adminOnly, ctrl.getAllSubmissions);
router.put('/admin/submissions/:id/status',   protect, adminOnly, ctrl.updateStatus);
router.get('/admin/users',                    protect, adminOnly, ctrl.getAllUsers);

module.exports = router;