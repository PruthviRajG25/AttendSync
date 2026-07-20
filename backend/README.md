<div align="center">
  <img src="../frontend/public/logo.png" width="140" alt="Attend Sync System Logo" style="border-radius: 16px;" />
  <h2>Attend Sync System — Backend API Service</h2>
</div>

> **Note:** For the full project overview, live demo links, and architecture details, please refer to the main [Root README.md](../README.md).

---

## 🚀 Live API Server

- **Production API URL:** `https://attendsync-api.onrender.com` *(Replace with your deployed API URL)*
- **Local API Base:** `http://localhost:5000`

---

## ⚡ Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/attendsync
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

---

## 📡 API Endpoints

- `POST /api/auth/register` — User Registration
- `POST /api/auth/login` — User Login (Returns JWT)
- `GET /api/auth/me` — Authenticated User Info
- `GET /api/subjects` — Get User Subjects
- `POST /api/attendance` — Log Class Attendance
- `GET /api/planner/summary` — Get Bunk Calculation & Threshold Data
- `POST /api/seed` — Seed Demo Mock Data
