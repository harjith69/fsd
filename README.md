# Faculty Performance & Academic Activity Dashboard

A modern, production-grade MERN web platform for engineering colleges and universities that unifies **teaching workload, publications, FDPs (Faculty Development Programmes), consultancy projects, patents, and appraisal metrics** into an accredited performance dashboard.

Built with an aesthetic light theme (`Plus Jakarta Sans`), automated NAAC (Criteria 2 & 3) / NBA compliance reporting, and a normalized 0–100 Performance Index calculation engine.

---

## 🌟 Key Features

1. **Normalized Performance Scoring Engine (0–100 Index):**
   - Calculates real-time scores per academic category strictly using **Approved** records.
   - Normalizes points against institutional target benchmarks (capped at 100%).
   - Categorizes faculty into accreditation grades: `Outstanding (≥85)`, `Very Good (70-84)`, `Good (55-69)`, `Needs Improvement (<55)`.
   - Computes department rank and year-over-year progression.

2. **Role-Based Workflows:**
   - **Faculty:** Submit and track activity records across 5 core modules, upload proof certificates (PDF/images), view personal analytics, and download official PDF/Excel reports.
   - **Head of Department (HoD):** Review department faculty submissions, approve/reject with official audit remarks, monitor department leaderboard, and export department matrices.
   - **Administrator (Dean Academic):** Institutional analytics, department comparisons, manage faculty user directory, and dynamically adjust scoring weights and benchmark targets.

3. **Status Workflow:**
   - Records follow a state machine: `Draft → Submitted → Approved / Rejected` (with HoD audit remarks).
   - Only approved records feed into scores and institutional rankings.

4. **Accreditation-Ready Exports:**
   - **PDF Reports:** Generated with `pdfkit` in NAAC/NBA formatted dossiers.
   - **Excel Workbooks:** Multi-sheet workbooks created via `exceljs` with tabs for Publications, Teaching, FDPs, Consultancy, and Patents.

5. **Aesthetic Light Design System:**
   - Soft indigo palette (`#5B6CFF`), tinted pastel badges, rounded-2xl cards with soft shadows, glassmorphism headers, and interactive Recharts visualizations (Radar, Line, Donut, and Bar charts).

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Admin (Dean Academic)** | `admin@college.edu` | `Admin@123` | Full institution analytics, scoring rules, user management |
| **HoD (CSE Dept)** | `hod.cse@college.edu` | `Hod@123` | Department approval queue, faculty leaderboard, comparison |
| **Faculty Member** | `faculty1@college.edu` | `Faculty@123` | Personal dashboard, record submission, self-appraisal |

> **Tip:** The login page includes a **One-Click Quick Login** bar to autofill and switch between demo roles instantly.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 18+** installed
- **MongoDB** (Local instance, MongoDB Atlas URI, or automatic built-in zero-config in-memory fallback)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd faculty-dashboard
npm run install:all
```

### 2. Environment Variables
Create `server/.env` (or copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/faculty_dashboard
JWT_SECRET=super_secret_faculty_academic_dashboard_jwt_key_2026_xyz
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
*(Note: If local MongoDB is not running, the server automatically starts an in-memory MongoDB instance with zero manual setup required).*

### 3. Seed Database
```bash
npm run seed
```
This populates 1 Admin, 3 Departments, 3 HoDs, 12 Faculty members, 3 Academic Years, and 80+ realistic records across all modules.

### 4. Start the Application
Run both backend API and frontend client concurrently with a single command:
```bash
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## 📂 Project Structure

```
faculty-dashboard/
├── package.json              # Monorepo root orchestrator with concurrently scripts
├── .env.example              # Environment variables template
├── README.md                 # Full documentation & setup guide
├── server/
│   ├── config/
│   │   └── db.js             # Mongo connection + zero-config fallback
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── departmentController.js
│   │   ├── academicYearController.js
│   │   ├── activityController.js # Workflow engine (submit/approve/reject)
│   │   ├── analyticsController.js
│   │   ├── scoringController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT httpOnly cookies & role guards
│   │   ├── upload.js         # Multer proof file validator (max 5MB)
│   │   └── errorHandler.js   # Centralized error handler
│   ├── models/               # 11 Mongoose Schemas with indexes
│   ├── routes/               # Express REST routers
│   ├── services/
│   │   ├── scoring.js        # Performance Index 0-100 calculation
│   │   └── reports.js        # PDFKit & ExcelJS generator
│   ├── seed/
│   │   └── seed.js           # Realistic data seeder
│   ├── uploads/              # Proof files repository
│   └── server.js             # Express entrypoint
└── client/
    ├── src/
    │   ├── api/client.js     # Axios API service
    │   ├── components/
    │   │   ├── ui/           # Reusable UI kit (Button, Card, StatCard, Badge, Modal, Drawer, Table, Tabs, etc.)
    │   │   ├── layout/       # Sidebar, Navbar, AppLayout
    │   │   └── charts/       # Radar, Line, Donut, and Bar charts
    │   ├── context/          # AuthContext & academic year state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── FacultyDashboard.jsx
    │   │   ├── TeachingPage.jsx
    │   │   ├── PublicationsPage.jsx
    │   │   ├── FdpsPage.jsx
    │   │   ├── ConsultancyPage.jsx
    │   │   ├── PatentsPage.jsx
    │   │   ├── HodDashboard.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── ReportsPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── routes/           # ProtectedRoute & RoleRoute
    │   └── main.jsx
    └── vite.config.js
```

---

## 📡 REST API Reference

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Authenticate user & issue httpOnly cookie |
| `/api/auth/logout` | `POST` | Authenticated | Terminate session & clear cookies |
| `/api/auth/me` | `GET` | Authenticated | Return active user profile |
| `/api/teaching` | `CRUD` | Faculty/HoD | Teaching workload records |
| `/api/publications` | `CRUD` | Faculty/HoD | Research and publication records |
| `/api/fdps` | `CRUD` | Faculty/HoD | Faculty Development Programmes |
| `/api/consultancy` | `CRUD` | Faculty/HoD | Industrial consultancy & grants |
| `/api/patents` | `CRUD` | Faculty/HoD | Patent filings & grants |
| `/api/:module/:id/submit` | `POST` | Faculty | Submit record for HoD verification |
| `/api/:module/:id/approve` | `POST` | HoD / Admin | Approve record (triggers score update) |
| `/api/:module/:id/reject` | `POST` | HoD / Admin | Reject record with audit remarks |
| `/api/upload` | `POST` | Authenticated | Upload certificate proof (PDF/JPG/PNG) |
| `/api/analytics/faculty/:id` | `GET` | Faculty/HoD | KPI metrics, radar breakdown & YoY |
| `/api/analytics/department/:id` | `GET` | HoD / Admin | Department KPI & faculty leaderboard |
| `/api/analytics/institution` | `GET` | Admin | Institutional accreditation overview |
| `/api/scoring-config` | `GET/PUT`| Admin | Retrieve or modify scoring weights |
| `/api/reports/faculty/:id` | `GET` | Faculty/HoD | Export individual report (PDF or XLSX) |
| `/api/reports/department/:id` | `GET` | HoD / Admin | Export department summary (.xlsx) |
