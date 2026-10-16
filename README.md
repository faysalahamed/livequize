# 🚀 MagicQuize — Real-Time Live Quiz & Presentation Platform

A modern, high-performance **Mentimeter & Kahoot alternative** built with **Next.js (App Router)**, **PostgreSQL (Prisma ORM)**, and **WebSockets (Socket.io)**.

---

## ✨ Features

- **🎯 Interactive Presentation / Quiz Studio (`/quiz/new`, `/quiz/[id]/edit`)**:
  - **Multiple Choice Quiz**: Timed questions, points, customizable answer choices with speed multipliers.
  - **Live Audience Poll**: Real-time polling with instant percentage and bar distributions.
  - **Dynamic Word Cloud**: Live audience submissions dynamically scale and group into an animated word cloud.
  - Add, delete, duplicate, and reorder presentation slides with live preview.

- **📺 Host / Presenter Projector Screen (`/host/[pin]`)**:
  - Fullscreen presentation view optimized for projectors, smart TVs, and screen shares.
  - 6-digit Game PIN display and one-click QR Code modal for audience mobile joining.
  - Live Lobby showing connected audience avatars and nicknames popping in dynamically.
  - Synchronized countdown timer with audio sound effects (Web Audio API).
  - Real-time animated vertical bar charts and live response counters updating in sub-50ms.
  - Animated 3-tier Leaderboard Podium (1st, 2nd, 3rd) with trophies and canvas confetti celebration!

- **📱 Audience / Participant Mobile Experience (`/join`, `/play/[pin]`)**:
  - Mobile-first, responsive touch interface.
  - Quick join via PIN with custom nickname and avatar emoji selection.
  - Vibrantly colored touch buttons with geometric shapes (▲ Red, ◆ Blue, ● Yellow, ■ Green).
  - Word submission input for Word Cloud questions.
  - Instant score feedback with streak indicators (🔥 x3) and speed calculations.

- **🗄️ PostgreSQL Database & Prisma ORM**:
  - Complete schema for Quizzes, Questions, Options, Game Sessions, Participants, and Responses.
  - Works with any PostgreSQL provider (Local PostgreSQL, Neon, Supabase, Railway, Docker).
  - Includes transparent live in-memory fallback so you can run and test quizzes immediately before configuring your database credentials!

---

## 🛠️ Quick Start

### 1. Install & Run
In the `d:\ANTIGRAVITY_PROJECTS\mentimeter-clone` directory:

```bash
# Run the live server (Next.js + Socket.io)
npm run dev
```

The app will start at **http://localhost:3000**:
- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Host Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Join Quiz**: [http://localhost:3000/join](http://localhost:3000/join)

---

## 🐘 PostgreSQL Setup Guide

Open the `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mentimeter?schema=public"
```

### Option A: Free Cloud PostgreSQL (Neon / Supabase)
1. Create a free PostgreSQL database at [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Copy your connection string into `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-sample-1234.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
3. Push the schema to your database:
   ```bash
   npm run prisma:push
   ```
4. (Optional) Seed rich sample quizzes:
   ```bash
   npm run prisma:seed
   ```

### Option B: Local PostgreSQL
1. Ensure your local PostgreSQL service is running and create a database named `mentimeter`.
2. Update `.env` with your username and password.
3. Push the schema:
   ```bash
   npm run prisma:push
   ```
4. Seed demo quizzes:
   ```bash
   npm run prisma:seed
   ```

---

## 🎮 How to Test a Live Session

1. Open **[http://localhost:3000/dashboard](http://localhost:3000/dashboard)** in your main browser window.
2. Click **"Start Live Quiz"** on any quiz (e.g. *Tech & Web Dev Live Challenge*). This opens the Presenter Screen with a 6-digit Game PIN.
3. Open an Incognito window or second browser tab (or scan the QR code from your smartphone on the same local Wi-Fi) and navigate to **[http://localhost:3000/join](http://localhost:3000/join)**.
4. Enter the PIN, pick a nickname and avatar emoji, and click **"Enter Live Room"**.
5. Watch your name appear instantly on the Presenter screen lobby!
6. Click **"Start Presentation"** as Host, answer on your player tab, and watch the live bar chart rise in real time!
