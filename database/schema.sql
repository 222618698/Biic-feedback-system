-- ============================================================
--  Pillar 5 Group Feedback Portal — MySQL Schema (v2)
--  Run: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS pillar5_feedback CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pillar5_feedback;

-- ── 1. Departments ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  dept_name  VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. Categories ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. Users ─────────────────────────────────────────────────
-- emp_no: employee number or contract number (e.g. EMP-00142 / CON-2024-017)
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(80)  NOT NULL,
  last_name     VARCHAR(80)  NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  emp_no        VARCHAR(50)  NULL,           -- employee / contract number
  department_id INT          NULL,
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_dept FOREIGN KEY (department_id)
    REFERENCES departments(id) ON DELETE SET NULL
);

-- ── 4. Feedback ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  reference_num VARCHAR(30)  NOT NULL UNIQUE,
  type          ENUM('complaint','compliment') NOT NULL,
  category_id   INT  NULL,
  message       TEXT NOT NULL,
  status        ENUM('new','in review','resolved') NOT NULL DEFAULT 'new',
  user_id       INT  NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- ── 5. Proof Files ───────────────────────────────────────────
-- Stores file metadata + base64 data for uploaded proof attachments
-- In production: replace `file_data` with a file path / S3 URL
CREATE TABLE IF NOT EXISTS proof_files (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  feedback_id INT          NOT NULL,
  file_name   VARCHAR(255) NOT NULL,
  file_type   VARCHAR(100) NOT NULL,   -- e.g. image/jpeg, application/pdf
  file_data   LONGTEXT     NOT NULL,   -- base64-encoded file content
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_proof_feedback FOREIGN KEY (feedback_id)
    REFERENCES feedback(id) ON DELETE CASCADE
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_feedback_type    ON feedback(type);
CREATE INDEX idx_feedback_status  ON feedback(status);
CREATE INDEX idx_feedback_user    ON feedback(user_id);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);
CREATE INDEX idx_proof_feedback   ON proof_files(feedback_id);