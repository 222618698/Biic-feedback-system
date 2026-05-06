// backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

// ── Helper: sign a JWT ──────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

// ── POST /api/auth/register ──────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, departmentId } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check duplicate email
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, department_id, role)
       VALUES (?, ?, ?, ?, ?, 'user')`,
      [firstName.trim(), lastName.trim(), email.toLowerCase().trim(), passwordHash, departmentId || null]
    );

    const newUser = {
      id:    result.insertId,
      email: email.toLowerCase(),
      role:  'user',
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token:   signToken(newUser),
      user: {
        id:           result.insertId,
        firstName:    firstName.trim(),
        lastName:     lastName.trim(),
        email:        email.toLowerCase(),
        departmentId: departmentId || null,
        role:         'user',
      },
    });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ── POST /api/auth/login ─────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [rows] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.password_hash,
              u.role, u.department_id, d.dept_name
       FROM   users u
       LEFT   JOIN departments d ON d.id = u.department_id
       WHERE  u.email = ?`,
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    }

    res.json({
      success: true,
      token:   signToken(user),
      user: {
        id:           user.id,
        firstName:    user.first_name,
        lastName:     user.last_name,
        email:        user.email,
        role:         user.role,
        departmentId: user.department_id,
        department:   user.dept_name,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ── GET /api/auth/me ─────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role,
              u.department_id, d.dept_name, u.created_at
       FROM   users u
       LEFT   JOIN departments d ON d.id = u.department_id
       WHERE  u.id = ?`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });

    const u = rows[0];
    res.json({
      success: true,
      user: {
        id:         u.id,
        firstName:  u.first_name,
        lastName:   u.last_name,
        email:      u.email,
        role:       u.role,
        department: u.dept_name,
        createdAt:  u.created_at,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
