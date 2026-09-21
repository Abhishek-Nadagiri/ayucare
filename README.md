# Ayucare — Patient Case Monitoring & Management System

Ayucare is a healthcare web application built for authorized healthcare professionals (Doctors, Nurses, Administrators, and Medical Trainees) to record, organize, monitor, and manage patient cases throughout the care journey.

Built strictly in accordance with clinical governance standards with modern dark theme and orange brand palette.

---

## 🌟 Key Features

- **🛡️ Least-Privilege Role-Based Access Control (RBAC):**
  - **Doctor:** Case creation, clinical documentation, order updates, and follow-up management.
  - **Nurse:** Patient observations, nursing notes, and assigned follow-up updates.
  - **Administrator:** User management, account activation, and immutable audit logs.
  - **Student / Trainee:** Educational and simulated clinical case reviews.
  - Includes an interactive **Demo Persona Switcher** in the top navigation bar.

- **🏥 Patient Records Directory (`/patients` & `/patients/[id]`):**
  - Unique identifier generation: `AYU-PT-2026-XXXX`.
  - Comprehensive clinical demographics, blood type, and allergy safety alerts (e.g. Penicillin, Sulfa).
  - Search, filter by sex/status, emergency contacts, and soft-archival controls.

- **📋 Clinical Case Workspace (`/cases`, `/cases/new`, `/cases/[id]`):**
  - Unique case numbering: `CASE-2026-XXXX`.
  - **Quick Status Transitions:** 1-click status updates (`New`, `Under Review`, `Active`, `On Hold`, `Follow-up Required`, `Resolved`, `Closed`).
  - **5 Clinical Workspace Tabs:**
    1. *Clinical Documentation:* Chief complaint, HPI, medical history, exam findings, investigations, and care plan.
    2. *Case Notes:* Structured notes with author role badges, timestamps, and clinical amendment flags.
    3. *Timeline:* Chronological event history showing actors and state transitions.
    4. *Follow-ups:* Scheduled milestones with overdue tracking.
    5. *Attachments:* Controlled document management (PDF lab reports, imaging scans).

- **⏰ Central Follow-up Workspace (`/followups`):**
  - Categorized into Overdue, Due Today, Upcoming, and Completed milestones.
  - Completion modal to record outcomes and verify care plan execution.

- **📊 Clinical Monitoring Dashboard (`/dashboard`):**
  - High-visibility KPI cards (Active Cases, Active Patients, Milestones, Overdue Actions).
  - Overdue Alert Banner, case priority stratification, and department workload breakdown.

- **📈 Reports & Exports (`/reports`):**
  - Case acuity metrics, department distribution, printable summary view, and **one-click CSV report export**.

- **🔒 Audit Logging & Administration (`/audit` & `/users`):**
  - Full auditability for patient creates, case transitions, notes, and user sign-ins.
  - Healthcare staff account provisioning and role management.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher, tested on v22)
- npm (v9 or higher)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/ayucare.git
cd ayucare
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

### 4. Run Automated Test Suite
```bash
npx tsx scripts/test-api.mjs
```

---

## 👥 Demo Clinical Personas

The application includes pre-seeded realistic clinical scenarios (Cardiology, Neurology, Emergency, General Surgery). You can log in with 1-click using the persona cards on the Login page or use these credentials:

| Persona | Role | Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. Sarah Chen, MD** | Doctor | `dr.sarah@ayucare.health` | `Ayucare2026!` | Full clinical case management, documentation, follow-ups |
| **James Rodriguez, RN** | Nurse | `nurse.james@ayucare.health` | `Ayucare2026!` | Patient observations, care notes, follow-up execution |
| **Elena Rostova** | Administrator | `admin.elena@ayucare.health` | `Ayucare2026!` | User provisioning, role policies, system audit logs |
| **Alex Kim** | Student | `student.alex@ayucare.health` | `Ayucare2026!` | Supervised training records & notes |

---

## 🗄️ Database Architecture

- **Local Zero-Config Persistence:**
  - Uses an ACID-safe JSON/SQLite repository layer (`src/lib/db/store.ts`) that runs out of the box with zero configuration required.
  - Automatically initializes with realistic clinical seed data if no database file exists.
  - In Settings (`/settings`), you can click **"Reset Database to Clean Demo State"** at any time.

- **Production PostgreSQL / Supabase Schema:**
  - The complete production DDL schema is provided in `src/lib/db/schema.sql`.
  - Includes tables for `roles`, `permissions`, `users`, `patients`, `patient_cases`, `case_notes`, `case_events`, `case_followups`, `attachments`, `notifications`, and `audit_logs` with UUID primary keys, foreign keys, and indexes.

---

## ☁️ Deployment (Vercel / Cloud)

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Ayucare clinical case management system"
   git branch -M main
   git remote add origin https://github.com/<your-username>/ayucare.git
   git push -u origin main
   ```

2. Import the repository into **Vercel** or your preferred cloud host.
3. Build Command: `npm run build`
4. Output Directory: `.next`
5. Click **Deploy**. The application will work immediately with all pre-seeded clinical scenarios and API endpoints.

---

## ⚖️ Clinical Disclaimer

Ayucare is a software workspace for organizing and monitoring patient cases. It does not independently diagnose diseases, prescribe medication, or replace professional clinical judgment.
