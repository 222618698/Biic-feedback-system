// backend/scripts/migrate.js
// Idempotent startup migration: creates the database/schema and seed data
// on first boot only. Runs before the app starts listening. Self-contained
// (no external file reads) since the deployed backend service doesn't have
// access to the repo's top-level database/ folder.
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'p5_feedback';

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    emp_number VARCHAR(50) NULL,
    department_id INT NULL,
    role ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference_num VARCHAR(30) NOT NULL UNIQUE,
    type ENUM('complaint','compliment') NOT NULL,
    category_id INT NULL,
    message TEXT NOT NULL,
    status ENUM('new','in review','resolved') NOT NULL DEFAULT 'new',
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS proof_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feedback_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_proof_feedback FOREIGN KEY (feedback_id) REFERENCES feedback(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX idx_feedback_type ON feedback(type)`,
  `CREATE INDEX idx_feedback_status ON feedback(status)`,
  `CREATE INDEX idx_feedback_user ON feedback(user_id)`,
  `CREATE INDEX idx_feedback_created ON feedback(created_at DESC)`,
  `CREATE INDEX idx_proof_feedback ON proof_files(feedback_id)`,
];

async function migrate() {
  const conn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
  });

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await conn.changeUser({ database: DB_NAME });

  const [rows] = await conn.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ? AND table_name = 'departments'`,
    [DB_NAME]
  );

  if (rows[0].cnt > 0) {
    console.log('✅  Database already migrated — skipping schema/seed.');
    await conn.end();
    return;
  }

  console.log('⏳  First boot — running schema migration...');
  for (const stmt of SCHEMA_STATEMENTS) {
    await conn.query(stmt);
  }
  console.log('✅  Schema created.');

  console.log('⏳  Seeding demo data...');
  const adminHash = await bcrypt.hash('pillar52025', 10);
  const demoHash = await bcrypt.hash('demo123', 10);

  await conn.query(
    `INSERT IGNORE INTO departments (dept_name) VALUES ('Management'),('Human Resources'),('Finance'),('IT'),('Operations'),('Sales'),('Customer Service'),('Legal'),('Other')`
  );
  await conn.query(
    `INSERT IGNORE INTO categories (category_name) VALUES ('Management'),('HR / People'),('Facilities'),('IT / Systems'),('Safety'),('Communication'),('Customer Service'),('Other')`
  );
  await conn.query(
    `INSERT IGNORE INTO users (first_name, last_name, email, password_hash, emp_number, department_id, role)
     VALUES ('Pillar5', 'Admin', 'admin@pillar5group.co.za', ?, 'ADMIN-001', 1, 'admin')`,
    [adminHash]
  );
  await conn.query(
    `INSERT IGNORE INTO users (first_name, last_name, email, password_hash, emp_number, department_id, role) VALUES
       ('Sarah', 'Mthembu', 's.mthembu@pillar5group.co.za', ?, 'EMP-00101', 2, 'user'),
       ('James', 'van der Berg', 'j.vdberg@pillar5group.co.za', ?, 'EMP-00042', 4, 'user'),
       ('Nomvula', 'Dlamini', 'n.dlamini@pillar5group.co.za', ?, 'CON-2024-017', 5, 'user')`,
    [demoHash, demoHash, demoHash]
  );
  await conn.query(
    `INSERT IGNORE INTO feedback (reference_num, type, category_id, message, status, user_id) VALUES
       ('P5-DEMO-001', 'complaint', 3, 'The air conditioning in the open-plan office has been broken for two weeks.', 'in review', 2),
       ('P5-DEMO-002', 'compliment', 1, 'Our team lead handled the recent deadline extension excellently.', 'resolved', 3),
       ('P5-DEMO-003', 'complaint', 4, 'VPN connectivity has been unstable for remote workers all month.', 'new', 4)`
  );
  console.log('✅  Seed data inserted.');

  await conn.end();
}

module.exports = migrate;
