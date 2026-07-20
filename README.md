# 🎓 AttendSync — Smart Attendance Tracker 

<div align="center">

  <img src="logo.png" width="180" alt="Attend Sync System Logo" style="border-radius: 24px; margin-bottom: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);" />

  <h1><b>ATTEND SYNC SYSTEM</b></h1>
  <h3>Smart Attendance Tracker & Bunk Planner</h3>

  ![AttendSync Banner](https://img.shields.io/badge/AttendSync-Smart%20Attendance%20Tracker-6366f1?style=for-the-badge&logo=react&logoColor=white)

  [![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Click_Here-22c55e?style=for-the-badge&logo=vercel&logoColor=white)](#-live-demo--quick-links)
  [![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=for-the-badge&logo=next.js)](frontend/)
  [![Backend](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-339933?style=for-the-badge&logo=nodedotjs)](backend/)
  [![Database](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)](backend/)
  [![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)](LICENSE)

  <p align="center">
    <b>Empowering students to track attendance, calculate minimum criteria, and intelligently plan bunks without falling below attendance thresholds.</b>
  </p>

  <sub>Built with React 19, Next.js 16 (App Router), Express.js, TypeScript, Tailwind CSS, Framer Motion & MongoDB</sub>

</div>

---

## 🔗 Live Demo & Quick Links

> [!IMPORTANT]
> ### 🌐 Live Application URLs
> - **Frontend Web App (Live Demo):** `https://attendsync-demo.vercel.app` *(Replace with your deployed frontend URL)*
> - **Backend REST API:** `https://attendsync-api.onrender.com` *(Replace with your deployed API URL)*
> - **API Health Check:** `https://attendsync-api.onrender.com/`

---

### 🔑 Quick Test Credentials
To explore the live demo without creating a new account, use the pre-seeded demo login:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Demo Student** | `demo@attendsync.com` | `demo12345` |

---

## ⚡ Interactive Quick Navigation

- [✨ Features](#-features)
- [🌐 Live Demo & Quick Links](#-live-demo--quick-links)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [🔑 Environment Configuration](#-environment-configuration)
- [📡 API Documentation](#-api-documentation)
- [📂 Folder Structure](#-folder-structure)
- [💡 Usage Walkthrough](#-usage-walkthrough)

---

## ✨ Features

<details open>
<summary><b>📊 Dashboard & Real-Time Analytics</b></summary>
<br>

- **Overview Cards:** Instant view of total classes, overall attendance percentage, and status indicators.
- **Visual Analytics:** Interactive Recharts charts detailing subject-wise attendance distributions and trends.
- **Status Badges:** Dynamic color-coded indicators highlighting safe subjects vs subjects requiring attention (<75%).
</details>

<details>
<summary><b>🧮 Smart Bunk Calculator & Planner</b></summary>
<br>

- **"Can I Bunk?" Calculator:** Calculates exact number of classes you can safely miss while remaining above target percentage (e.g. 75%).
- **Recovery Planner:** Determines how many consecutive future classes you must attend to recover from low attendance.
- **Goal Customization:** Adjust target criteria dynamically per subject or globally.
</details>

<details>
<summary><b>📅 Interactive Timetable & Daily Schedule</b></summary>
<br>

- **Weekly Schedule:** Manage class schedules by day of the week with time slots and room numbers.
- **One-Click Attendance Logging:** Quickly mark classes as Present, Absent, Cancelled, or Late directly from schedule view.
</details>

<details>
<summary><b>📚 Subject & Attendance Management</b></summary>
<br>

- **Subject CRUD:** Create, update, or remove subjects with target percentages and total credit hours.
- **Attendance History Logs:** Filter and review attendance records by date range, status, or subject.
- **Mock Data Seeder:** Built-in dev tool to populate realistic attendance records for instant testing.
</details>

<details>
<summary><b>🔐 User Authentication & Profile Customization</b></summary>
<br>

- **JWT Authentication:** Secure user signup, login, and token-based session handling with bcrypt password hashing.
- **Personalized Profile:** Save student details, semester information, and target criteria defaults.
</details>

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** Next.js 16 (React 19 App Router)
- **Styling:** Tailwind CSS v4 & Lucide React Icons
- **Animations:** Framer Motion & Canvas Confetti
- **Charts:** Recharts
- **Form Validation:** React Hook Form & Zod
- **Language:** TypeScript

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js (TypeScript)
- **Database:** MongoDB with Mongoose ORM
- **Auth & Security:** JSON Web Tokens (JWT), bcryptjs, CORS
- **Dev Tools:** ts-node-dev

---

## 🚀 Getting Started

Follow these steps to run AttendSync locally on your machine.

### 📋 Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** or **pnpm** / **yarn**
- **MongoDB**: Local instance running at `mongodb://127.0.0.1:27017/` or MongoDB Atlas URI

---

### 📥 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/attendsync.git
cd attendsync
```

---

### ⚙️ 2. Setup Environment Variables

<details open>
<summary><b>Click to expand environment file setup</b></summary>

#### Backend setup:
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/attendsync
JWT_SECRET=your_super_secret_jwt_key_here
```

#### Frontend setup:
Create a `.env.local` file in the `frontend/` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
</details>

---

### 🏃 3. Run Backend API Server

```bash
cd backend
npm install
npm run dev
```
> The API server will start on **`http://localhost:5000`**

---

### 🎨 4. Run Frontend Web App

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
> The web app will open at **`http://localhost:3000`**

---

## 📡 API Documentation

<details>
<summary><b>🔍 View Endpoint Reference</b></summary>

<br>

| Module | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/auth/register` | Register a new user | ❌ |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & receive JWT | ❌ |
| **Auth** | `GET` | `/api/auth/me` | Fetch authenticated user profile | ✅ |
| **Subjects** | `GET` | `/api/subjects` | List user subjects | ✅ |
| **Subjects** | `POST` | `/api/subjects` | Add a new subject | ✅ |
| **Attendance**| `GET` | `/api/attendance` | Get attendance records | ✅ |
| **Attendance**| `POST` | `/api/attendance` | Log attendance entry | ✅ |
| **Timetable** | `GET` | `/api/timetable` | Get weekly timetable | ✅ |
| **Planner** | `GET` | `/api/planner/summary` | Get bunk calculation summary | ✅ |
| **Analytics** | `GET` | `/api/analytics` | Fetch chart & stats payload | ✅ |
| **Seeder** | `POST` | `/api/seed` | Seed test mock data | ✅ |

</details>

---

## 📂 Folder Structure

```
attendsync/
├── 📄 README.md                 # Project README with Interactive Guide & Demo links
├── 📁 frontend/                 # Next.js 16 Client Application
│   ├── 📁 src/
│   │   ├── 📁 app/              # Next.js App Router Pages (dashboard, calculator, timetable, etc.)
│   │   ├── 📁 components/       # Reusable UI Components & Widgets
│   │   ├── 📁 context/          # React Context (AuthContext)
│   │   └── 📁 lib/              # Utilities & API Axios client
│   ├── 📄 package.json
│   └── 📄 next.config.ts
└── 📁 backend/                  # Node.js + Express API Server
    ├── 📁 src/
    │   ├── 📁 controllers/      # Route logic & Seeder
    │   ├── 📁 middleware/       # JWT Auth Middleware
    │   ├── 📁 models/           # Mongoose Data Models (User, Subject, Attendance, etc.)
    │   ├── 📁 routes/           # API Endpoint Routers
    │   └── 📄 index.ts          # Server entrypoint
    ├── 📄 .env.example
    └── 📄 package.json
```

---

## 📝 Demo URL Placement Guide

To plug in your own Live Demo and Deployment links, edit the top section of [`README.md`](file:///c:/Users/ADMIN/OneDrive/Desktop/sec/README.md):

```markdown
<!-- Update demo links here -->
- **Frontend Live Demo:** [https://your-app-name.vercel.app](https://your-app-name.vercel.app)
- **Backend API Server:** [https://your-api-name.onrender.com](https://your-api-name.onrender.com)
```

---





<div align="center">
  <sub>Made with ❤️ for students everywhere. Star ⭐️ this repository if you find it helpful!</sub>
</div>
