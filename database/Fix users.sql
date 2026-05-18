USE biic_feedback;

-- Delete all existing users and re-insert with correct hashes
DELETE FROM feedback;
DELETE FROM users;

-- Reset auto increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE feedback AUTO_INCREMENT = 1;

-- Admin (password: pillar52025)
INSERT INTO users (first_name, last_name, email, password_hash, emp_number, department_id, role)
VALUES ('Pillar5', 'Admin', 'admin@pillar5group.co.za',
'$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'ADMIN-001', 1, 'admin');

-- Employees (password: demo123)
INSERT INTO users (first_name, last_name, email, password_hash, emp_number, department_id, role)
VALUES
('Sarah', 'Mthembu', 's.mthembu@pillar5group.co.za',
'$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'EMP-00101', 2, 'user'),
('James', 'van der Berg', 'j.vdberg@pillar5group.co.za',
'$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'EMP-00042', 4, 'user'),
('Nomvula', 'Dlamini', 'n.dlamini@pillar5group.co.za',
'$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'CON-2024-017', 5, 'user');

-- Demo feedback
INSERT INTO feedback (reference_num, type, category_id, message, status, user_id)
VALUES
('P5-DEMO-001', 'complaint', 3,
'The air conditioning in the open-plan office has been broken for two weeks.',
'in review', 2),
('P5-DEMO-002', 'compliment', 1,
'Our team lead handled the recent deadline extension excellently.',
'resolved', 3),
('P5-DEMO-003', 'complaint', 4,
'VPN connectivity has been unstable for remote workers all month.',
'new', 4);

-- Verify
SELECT email, LENGTH(password_hash) AS hash_length, role FROM users;