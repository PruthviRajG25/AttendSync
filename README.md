# 🗓️ AttendSync — Smart Attendance  Planner

<div align="center">
  <img src="./logo.png" width="160" alt="AttendSync Logo" style="border-radius: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.15);" />
  
  <p align="center">
    A premium, full-stack Next.js and Express application designed to track college class attendance, schedule timetables, analyze attendance trends, and dynamically calculate attendance requirements.
  </p>
--------
 <div>
  <h1>
    <a 
      href="https://drive.google.com/file/d/1Qb7B5BHG9P95WFtmTn0xXpfpfNulheHk/view?usp=drivesdk" 
      target="_blank" 
      rel="noopener noreferrer"
      style="text-decoration: none; color: inherit;">
      📽️ Video Demo
    </a>
  </h1>
</div>


---

## 🗺️ Interactive Navigation

Click on any section to jump directly to it:

*   [🏗️ System Architecture](#%EF%B8%8F-system-architecture)
*   [✨ Interactive Feature Tour](#-interactive-feature-tour)
*   [📡 API Endpoints Explorer](#-api-endpoints-explorer)
*   [⚡ Local Quick Start](#-local-quick-start)
*   [🚀 Vercel Production Deployment](#-vercel-production-deployment)
*   [🛠️ Tech Stack Directory](#%EF%B8%8F-tech-stack-directory)

---

## 🏗️ System Architecture

This diagram shows how the frontend web application communicates with the server API and how it stores data dynamically in MongoDB Atlas:

```mermaid
graph TD
    subgraph Client [Client Application - Next.js]
        FE[Interactive UI / Pages] <--> Context[Auth & State Context]
        Context <--> ClientAPI[API Fetch Wrapper - api.js]
    end

    subgraph Server [Backend Service - Express]
        ClientAPI <--> CORS[CORS Middleware]
        CORS <--> AuthMW[JWT Authentication Middleware]
        AuthMW <--> Router[Express Router]
        Router <--> Controller[Feature Controllers]
    end

    subgraph Database [Database - MongoDB Atlas]
        Controller <--> Mongoose[Mongoose Models]
        Mongoose <--> MongoDB[(MongoDB Cloud Cluster)]
    end

    style FE fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style MongoDB fill:#47A248,stroke:#333,stroke-width:2px,color:#fff
    style Server fill:#f9f,stroke:#333,stroke-width:1px
    style Client fill:#bbf,stroke:#333,stroke-width:1px
```

---

## ✨ Interactive Feature Tour

<details>
<summary><b>📊 Dashboard & Real-Time Analytics (Click to Expand)</b></summary>

*   **Overall Attendance Score**: Displays your overall percentage with visual radial progress meters.
*   **Status Trackers**: Color-coded cards reflecting *Safe* (above threshold), *Warning* (borderline), and *Critical* (bunk alert) subjects.
*   **Dynamic Trend Charts**: Uses Recharts to plot weekly attendance progress and compare subjects visually.
</details>

<details>
<summary><b>🧮 Smart Bunk Calculator (Click to Expand)</b></summary>

*   **Bunk Planner**: Input how many future classes you wish to bunk, and the calculator instantly tells you if your attendance will remain above the threshold (e.g., 75%).
*   **Recovery Steps**: If you are short on attendance, the system computes the exact number of consecutive classes you must attend to restore your status.
*   **Interactive Simulation**: Toggle slide widgets to run what-if scenarios on the fly.
</details>

<details>
<summary><b>📅 Weekly Timetable (Click to Expand)</b></summary>

*   **Day-wise Schedules**: Interactive class schedules categorized by hours and subject names.
*   **Quick Logging**: Click a timetable class to log attendance (Present/Absent/Cancelled) directly from the schedule!
</details>

---

## 📡 API Endpoints Explorer

<details>
<summary><b>🔐 Authentication Routes (Click to Expand)</b></summary>

| Method | Endpoint | Description | Headers |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new student | None |
| `POST` | `/api/auth/login` | Login and receive JSON Web Token (JWT) | None |
| `GET` | `/api/auth/profile` | Retrieve profile of authenticated user | `Authorization: Bearer <JWT>` |
</details>

<details>
<summary><b>📚 Subjects & Timetable Routes (Click to Expand)</b></summary>

| Method | Endpoint | Description | Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/subjects` | Fetch all active subjects and current percentages | `Authorization: Bearer <JWT>` |
| `POST` | `/api/subjects` | Create a new subject | `Authorization: Bearer <JWT>` |
| `GET` | `/api/timetable` | Fetch weekly schedule | `Authorization: Bearer <JWT>` |
| `POST` | `/api/timetable` | Add a class to schedule | `Authorization: Bearer <JWT>` |
</details>

<details>
<summary><b>📊 Attendance Logs & Analytics (Click to Expand)</b></summary>

| Method | Endpoint | Description | Headers |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance` | Fetch all historical logs | `Authorization: Bearer <JWT>` |
| `POST` | `/api/attendance` | Log attendance record | `Authorization: Bearer <JWT>` |
| `GET` | `/api/analytics` | Retrieve attendance graphs data | `Authorization: Bearer <JWT>` |
| `POST` | `/api/seed` | Seed demo data for instant dashboard preview | `Authorization: Bearer <JWT>` |
</details>

---

## ⚡ Local Quick Start

Follow these steps to run both the frontend and backend simultaneously in your local dev environment:

### 1. Configure the Backend `.env`
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGODB_URI=mongodb+srv://pruthvirajgispro_db_user:jkyXJBKy08hSEQp7@cluster0.xkdnvhj.mongodb.net/?appName=Cluster0
JWT_SECRET=attendsync_super_secret_session_token_key_998877
```

### 2. Configure the Frontend `.env.local`
Create a `.env.local` file in the `frontend` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Commands
From the **root folder**, install all packages and boot both apps concurrently:
```bash
# Install workspace dependencies
npm install

# Run backend and frontend concurrently
npm run dev
```
*   Your frontend will run at [http://localhost:3000](http://localhost:3000)
*   Your backend API will run at [http://localhost:5000](http://localhost:5000)

---

## 🚀 Vercel Production Deployment

To deploy this monorepo to Vercel, ensure the following steps are taken:

1.  **CORS Compatibility**: The backend CORS settings are configured with `origin: true` to support credentials transmission in production without wildcard security errors.
2.  **DNS SRV Resolution**: Node.js has been configured with explicit public DNS fallbacks (`8.8.8.8`/`1.1.1.1`) inside the backend index to prevent connection drops.
3.  **Environment Variables**:
    *   Set `MONGODB_URI` and `JWT_SECRET` in the Vercel Project Environment Settings.
    *   Set `NEXT_PUBLIC_API_URL` to your production API base URL.
4.  For detailed step-by-step instructions, please read our dedicated **[Vercel Deployment Guide](./vercel_deployment_guide.md)**.

---

## 🛠️ Tech Stack Directory

*   **Frontend**: Next.js 16 (App Router), React 19, Lucide Icons, Recharts, Framer Motion.
*   **Backend**: Node.js, Express, Mongoose, JWT.
*   **Database**: MongoDB Atlas Cloud.
*   **Styling**: Modern CSS variables with custom dark-mode glassmorphic theme.
