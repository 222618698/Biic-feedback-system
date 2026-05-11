// backend/controllers/feedbackController.js
const db = require('../config/db');

const genRef = () =>
  'P5-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();

// ── POST /api/feedback ────────────────────────────────────────
exports.submit = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { type, categoryId, message, proofs } = req.body;
    const userId = req.user.id;

    if (!type || !message) {
      return res.status(400).json({ success: false, message: 'Type and message are required.' });
    }
    if (!['complaint', 'compliment'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be complaint or compliment.' });
    }
    if (message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Message must be at least 10 characters.' });
    }
    // Validate proof files (max 5)
    const proofArr = Array.isArray(proofs) ? proofs : [];
    if (proofArr.length > 5) {
      return res.status(400).json({ success: false, message: 'Maximum 5 proof files allowed.' });
    }

    const refNum = genRef();

    const [result] = await conn.query(
      `INSERT INTO feedback (reference_num, type, category_id, message, status, user_id)
       VALUES (?, ?, ?, ?, 'new', ?)`,
      [refNum, type, categoryId || null, message.trim(), userId]
    );

    const feedbackId = result.insertId;

    // Insert proof files
    for (const proof of proofArr) {
      if (!proof.name || !proof.type || !proof.data) continue;
      await conn.query(
        `INSERT INTO proof_files (feedback_id, file_name, file_type, file_data) VALUES (?, ?, ?, ?)`,
        [feedbackId, proof.name, proof.type, proof.data]
      );
    }

    await conn.commit();

    res.status(201).json({
      success:      true,
      message:      'Feedback submitted successfully.',
      referenceNum: refNum,
      feedbackId,
    });
  } catch (err) {
    await conn.rollback();
    console.error('submit error:', err);
    res.status(500).json({ success: false, message: 'Server error submitting feedback.' });
  } finally {
    conn.release();
  }
};

// ── GET /api/feedback/my  (own submissions with status) ───────
exports.getMySubmissions = async (req, res) => {
  try {
    const { type } = req.query;
    let where = 'WHERE f.user_id = ?';
    const params = [req.user.id];
    if (type) { where += ' AND f.type = ?'; params.push(type); }

    const [rows] = await db.query(
      `SELECT f.id, f.reference_num, f.type, f.message, f.status, f.created_at,
              c.category_name
       FROM   feedback f
       LEFT   JOIN categories c ON c.id = f.category_id
       ${where}
       ORDER  BY f.created_at DESC`,
      params
    );

    // Attach proof files for each submission
    const submissions = await Promise.all(rows.map(async (r) => {
      const [proofs] = await db.query(
        'SELECT file_name, file_type, file_data FROM proof_files WHERE feedback_id = ?',
        [r.id]
      );
      return {
        id:           r.id,
        referenceNum: r.reference_num,
        type:         r.type,
        category:     r.category_name || 'Uncategorised',
        message:      r.message,
        status:       r.status,
        createdAt:    r.created_at,
        proofs:       proofs.map(p => ({ name: p.file_name, type: p.file_type, data: p.file_data })),
      };
    }));

    res.json({ success: true, submissions });
  } catch (err) {
    console.error('getMySubmissions error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/admin/submissions ────────────────────────────────
exports.getAllSubmissions = async (req, res) => {
  try {
    const { type, status, categoryId, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = []; let params = [];
    if (type)       { where.push('f.type = ?');        params.push(type); }
    if (status)     { where.push('f.status = ?');       params.push(status); }
    if (categoryId) { where.push('f.category_id = ?'); params.push(categoryId); }
    if (search) {
      where.push('(f.message LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.emp_no LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await db.query(
      `SELECT f.id, f.reference_num, f.type, f.message, f.status, f.created_at,
              c.category_name,
              u.id AS user_id, u.first_name, u.last_name, u.email, u.emp_no,
              d.dept_name
       FROM   feedback f
       JOIN   users u        ON u.id = f.user_id
       LEFT   JOIN categories  c ON c.id = f.category_id
       LEFT   JOIN departments d ON d.id = u.department_id
       ${whereClause}
       ORDER  BY f.created_at DESC
       LIMIT  ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM feedback f
       JOIN users u ON u.id = f.user_id
       LEFT JOIN categories c ON c.id = f.category_id
       ${whereClause}`, params
    );

    const [[stats]] = await db.query(
      `SELECT COUNT(*) AS total,
         SUM(type='complaint')   AS complaints,
         SUM(type='compliment')  AS compliments,
         SUM(status='new')       AS new_count,
         SUM(status='in review') AS review_count,
         SUM(status='resolved')  AS resolved_count
       FROM feedback`
    );

    // Attach proofs to each submission
    const submissions = await Promise.all(rows.map(async (r) => {
      const [proofs] = await db.query(
        'SELECT file_name, file_type, file_data FROM proof_files WHERE feedback_id = ?',
        [r.id]
      );
      return {
        id:           r.id,
        referenceNum: r.reference_num,
        type:         r.type,
        category:     r.category_name || 'Uncategorised',
        message:      r.message,
        status:       r.status,
        createdAt:    r.created_at,
        proofs:       proofs.map(p => ({ name: p.file_name, type: p.file_type, data: p.file_data })),
        submitter: {
          id:         r.user_id,
          firstName:  r.first_name,
          lastName:   r.last_name,
          fullName:   `${r.first_name} ${r.last_name}`,
          email:      r.email,
          empNo:      r.emp_no || '',
          department: r.dept_name || '',
        },
      };
    }));

    res.json({ success: true, stats, total: parseInt(total), page: parseInt(page), submissions });
  } catch (err) {
    console.error('getAllSubmissions error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching submissions.' });
  }
};

// ── PUT /api/admin/submissions/:id/status ─────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;
    const valid = ['new', 'in review', 'resolved'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${valid.join(', ')}` });
    }
    const [result] = await db.query('UPDATE feedback SET status = ? WHERE id = ?', [status, id]);
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }
    res.json({ success: true, message: `Status updated to "${status}".`, id: parseInt(id), status });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error updating status.' });
  }
};

// ── GET /api/admin/users ──────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.emp_no, u.role, u.created_at,
              d.dept_name, COUNT(f.id) AS submission_count
       FROM   users u
       LEFT   JOIN departments d ON d.id = u.department_id
       LEFT   JOIN feedback    f ON f.user_id = u.id
       GROUP  BY u.id ORDER BY u.created_at DESC`
    );
    res.json({
      success: true,
      users: rows.map(u => ({
        id:              u.id,
        firstName:       u.first_name,
        lastName:        u.last_name,
        fullName:        `${u.first_name} ${u.last_name}`,
        email:           u.email,
        empNo:           u.emp_no || '',
        role:            u.role,
        department:      u.dept_name || '',
        submissionCount: u.submission_count,
        createdAt:       u.created_at,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ── GET /api/feedback/categories & departments ────────────────
exports.getCategories  = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, category_name FROM categories ORDER BY category_name');
    res.json({ success: true, categories: rows });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error.' }); }
};

exports.getDepartments = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, dept_name FROM departments ORDER BY dept_name');
    res.json({ success: true, departments: rows });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error.' }); }
};