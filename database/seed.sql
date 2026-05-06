-- ============================================================
--  BIIC Feedback Portal — Seed Data
--  Run AFTER schema.sql:  mysql -u root -p biic_feedback < seed.sql
-- ============================================================
USE biic_feedback;

-- ── Departments ──────────────────────────────────────────────
INSERT IGNORE INTO departments (dept_name) VALUES
  ('Management'),
  ('Human Resources'),
  ('Finance'),
  ('IT'),
  ('Operations'),
  ('Sales'),
  ('Customer Service'),
  ('Legal'),
  ('Other');

-- ── Categories ───────────────────────────────────────────────
INSERT IGNORE INTO categories (category_name) VALUES
  ('Management'),
  ('HR / People'),
  ('Facilities'),
  ('IT / Systems'),
  ('Safety'),
  ('Communication'),
  ('Customer Service'),
  ('Other');

-- ── Admin user (password: biic2025) ──────────────────────────
-- Hash generated with bcrypt rounds=10
INSERT IGNORE INTO users (first_name, last_name, email, password_hash, department_id, role)
VALUES ('BIIC', 'Admin', 'admin@biic.co.za',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- "biic2025"
        1, 'admin');

-- ── Demo employees (password: demo123) ───────────────────────
INSERT IGNORE INTO users (first_name, last_name, email, password_hash, department_id, role)
VALUES
  ('Sarah',   'Mokoena',       's.mokoena@biic.co.za',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 'user'),
  ('James',   'van der Berg',  'j.vdberg@biic.co.za',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 'user'),
  ('Nomvula', 'Dlamini',       'n.dlamini@biic.co.za',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 'user');

-- ── Demo feedback ─────────────────────────────────────────────
INSERT IGNORE INTO feedback (reference_num, type, category_id, message, status, user_id)
VALUES
  ('BIIC-DEMO-001', 'complaint',   3,
   'The air conditioning in the open-plan office has been broken for two weeks. The temperature is very uncomfortable in the afternoons and is noticeably affecting productivity.',
   'in review', 2),
  ('BIIC-DEMO-002', 'compliment',  1,
   'I want to acknowledge how our team lead handled the recent project deadline extension. The communication was clear, empathetic, and made a stressful situation very manageable. Truly excellent leadership.',
   'resolved',  3),
  ('BIIC-DEMO-003', 'complaint',   4,
   'The VPN connectivity has been unstable for remote workers over the past month. Constant disconnections during video calls are making effective collaboration very difficult.',
   'new',       4),
  ('BIIC-DEMO-004', 'compliment',  7,
   'The support team went above and beyond during our client visit. They were professional, well-prepared, and represented BIIC exceptionally well.',
   'new',       2);
