-- ============================================================
--  Pillar 5 Group — Seed Data
--  Run AFTER schema.sql
-- ============================================================
USE biic_feedback;

-- ── Departments ──────────────────────────────────────────────
INSERT IGNORE INTO departments (dept_name) VALUES
  ('Management'),('Human Resources'),('Finance'),
  ('IT'),('Operations'),('Sales'),
  ('Customer Service'),('Legal'),('Other');

-- ── Categories ───────────────────────────────────────────────
INSERT IGNORE INTO categories (category_name) VALUES
  ('Management'),('HR / People'),('Facilities'),
  ('IT / Systems'),('Safety'),('Communication'),
  ('Customer Service'),('Other');

-- ── Admin (password: pillar52025) ────────────────────────────
INSERT IGNORE INTO users (first_name, last_name, email, password_hash, emp_number, department_id, role)
VALUES ('Pillar5', 'Admin', 'admin@pillar5group.co.za',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'ADMIN-001', 1, 'admin');

-- ── Demo employees (password: demo123) ───────────────────────
INSERT IGNORE INTO users (first_name, last_name, email, password_hash, emp_number, department_id, role)
VALUES
  ('Sarah',   'Mthembu',      's.mthembu@pillar5group.co.za',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMP-00101', 2, 'user'),
  ('James',   'van der Berg', 'j.vdberg@pillar5group.co.za',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMP-00042', 4, 'user'),
  ('Nomvula', 'Dlamini',      'n.dlamini@pillar5group.co.za',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CON-2024-017', 5, 'user');

-- ── Demo feedback ─────────────────────────────────────────────
INSERT IGNORE INTO feedback (reference_num, type, category_id, message, status, user_id)
VALUES
  ('P5-DEMO-001', 'complaint',   3,
   'The air conditioning in the open-plan office has been broken for two weeks.',
   'in review', 2),
  ('P5-DEMO-002', 'compliment',  1,
   'Our team lead handled the recent deadline extension excellently.',
   'resolved', 3),
  ('P5-DEMO-003', 'complaint',   4,
   'VPN connectivity has been unstable for remote workers all month.',
   'new', 4);