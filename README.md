# BIIC Feedback Portal — Full-Stack Application

A production-ready internal feedback system built with **React**, **Node.js/Express**, and **MySQL**.

---

## Project Structure

```
biic-feedback-portal/
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe
│   │   └── feedbackController.js  # Submit, list, update, users
│   ├── middleware/
│   │   └── auth.js                # JWT protect + adminOnly guards
│   ├── routes/
│   │   ├── auth.js                # /api/auth/*
│   │   └── feedback.js            # /api/feedback/* + /api/admin/*
│   ├── .env.example               # Copy to .env and fill in
│   ├── package.json
│   └── server.js                  # Express entry point
│
├── frontend/
│   └── src/
│       ├── services/
│       │   ├── api.js             # Axios instance + all API calls
│       │   └── AuthContext.js     # Global auth state (React Context)
│       ├── views/
│       │   ├── LandingPage.jsx    # Animated marketing page
│       │   ├── LoginPage.jsx      # Employee sign-in
│       │   ├── RegisterPage.jsx   # New account creation
│       │   ├── SubmitPage.jsx     # Feedback submission form
│       │   ├── AdminLoginPage.jsx # Admin sign-in
│       │   └── AdminDashboard.jsx # Full admin interface
│       └── App.js                 # Routes + guards
│
└── database/
    ├── schema.sql                 # All table definitions
    └── seed.sql                   # Demo departments, users, feedback
```

---

## Tech Stack

| Layer      | Technology        | Purpose                                    |
|------------|-------------------|--------------------------------------------|
| Frontend   | React 18          | Component-based UI, routing, state         |
| Styling    | CSS Variables     | Design tokens matching the original design |
| HTTP       | Axios             | API calls with auto JWT attachment         |
| Backend    | Node.js + Express | REST API, business logic                   |
| Auth       | JWT + bcryptjs    | Stateless authentication, hashed passwords |
| Database   | MySQL             | Relational storage with foreign keys       |
| Dev tool   | nodemon           | Auto-restart backend on file changes       |

---

## Database Schema (ERD)

```
departments          categories
───────────          ──────────
id (PK)              id (PK)
dept_name            category_name

users                           feedback
─────                           ────────
id (PK)                         id (PK)
first_name                      reference_num (UNIQUE)
last_name                       type  ENUM(complaint, compliment)
email (UNIQUE)                  category_id → categories.id
password_hash                   message (TEXT)
department_id → departments.id  status ENUM(new, in review, resolved)
role ENUM(user, admin)          user_id → users.id
created_at                      created_at / updated_at
```

---

## API Endpoints

### Auth
| Method | Endpoint            | Auth     | Description           |
|--------|---------------------|----------|-----------------------|
| POST   | /api/auth/register  | Public   | Create employee account|
| POST   | /api/auth/login     | Public   | Login, returns JWT    |
| GET    | /api/auth/me        | User/Admin | Get current user    |

### Feedback
| Method | Endpoint                            | Auth  | Description            |
|--------|-------------------------------------|-------|------------------------|
| POST   | /api/feedback                       | User  | Submit new feedback    |
| GET    | /api/feedback/categories            | Public| List categories        |
| GET    | /api/feedback/departments           | Public| List departments       |

### Admin
| Method | Endpoint                                  | Auth  | Description           |
|--------|-------------------------------------------|-------|-----------------------|
| GET    | /api/admin/submissions                    | Admin | List all (filterable) |
| GET    | /api/admin/submissions/:id                | Admin | Single submission     |
| PUT    | /api/admin/submissions/:id/status         | Admin | Update status         |
| GET    | /api/admin/users                          | Admin | All registered users  |

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8.0+ (via MySQL Workbench)
- npm

---

### Step 1 — Database Setup

Open **MySQL Workbench** and run these two files in order:

```sql
-- 1. Create tables
SOURCE /path/to/biic-feedback-portal/database/schema.sql;

-- 2. Insert demo data
SOURCE /path/to/biic-feedback-portal/database/seed.sql;
```

Or via terminal:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p biic_feedback < database/seed.sql
```

---

### Step 2 — Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=biic_feedback
JWT_SECRET=generate_a_long_random_string_here
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:3000
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the backend:
```bash
npm run dev        # development (nodemon)
npm start          # production
```

Backend runs at: **http://localhost:5000**
Health check: **http://localhost:5000/api/health**

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React dev server
npm start
```

Frontend runs at: **http://localhost:3000**

---

## Demo Credentials

After running seed.sql:

| Role     | Email                      | Password  |
|----------|----------------------------|-----------|
| Admin    | admin@biic.co.za           | biic2025  |
| Employee | s.mokoena@biic.co.za       | demo123   |
| Employee | j.vdberg@biic.co.za        | demo123   |
| Employee | n.dlamini@biic.co.za       | demo123   |

---

## Frontend Routes

| Path           | Component        | Access       |
|----------------|------------------|--------------|
| /              | LandingPage      | Public       |
| /login         | LoginPage        | Public       |
| /register      | RegisterPage     | Public       |
| /submit        | SubmitPage       | Logged-in    |
| /admin/login   | AdminLoginPage   | Public       |
| /admin         | AdminDashboard   | Admin only   |

---

## Security Features

- Passwords hashed with **bcrypt** (10 salt rounds) — never stored in plaintext
- **JWT tokens** expire after 8 hours
- Admin routes protected by **double middleware** (`protect` + `adminOnly`)
- **No IP addresses** stored — only name, email, department
- Input validation on all POST endpoints
- SQL injection prevented via **parameterised queries** (mysql2 prepared statements)
- CORS restricted to frontend origin only

---

## Common Issues

**MySQL connection refused**
- Check MySQL service is running: `sudo service mysql start`
- Verify credentials in `.env` match MySQL Workbench settings

**JWT errors on admin routes**
- Ensure `JWT_SECRET` is set in `.env` and matches between requests
- Token expires after 8h — log out and back in

**CORS errors in browser**
- Confirm `FRONTEND_URL` in `.env` matches the exact React dev server URL

**Port already in use**
- Change `PORT=5001` in `.env` and update `"proxy"` in `frontend/package.json`
