-- ============================================================
--  BIIC Feedback Portal — MySQL Schema
--  Run this file in MySQL Workbench or via: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS biic_feedback CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biic_feedback;

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
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(80)  NOT NULL,
  last_name     VARCHAR(80)  NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  department_id INT          NULL,
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_dept FOREIGN KEY (department_id)
    REFERENCES departments(id) ON DELETE SET NULL
);

-- ── 4. Feedback ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  reference_num VARCHAR(30) NOT NULL UNIQUE,
  type         ENUM('complaint','compliment') NOT NULL,
  category_id  INT  NULL,
  message      TEXT NOT NULL,
  status       ENUM('new','in review','resolved') NOT NULL DEFAULT 'new',
  user_id      INT  NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_feedback_type    ON feedback(type);
CREATE INDEX idx_feedback_status  ON feedback(status);
CREATE INDEX idx_feedback_user    ON feedback(user_id);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);
