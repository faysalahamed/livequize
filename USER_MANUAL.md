# 📖 MagicQuize — User Manual & Operations Guide

Welcome to the **MagicQuize User Manual**. MagicQuize is a real-time, interactive presentation and live quiz platform inspired by Mentimeter and Kahoot. It enables presenters to engage audiences in real time through interactive quizzes, live polls, and dynamic word clouds using **Next.js**, **PostgreSQL (Prisma ORM)**, and **WebSockets (Socket.io)**.

---

## 📑 Table of Contents

1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Quick Start & Server Operations](#2-quick-start--server-operations)
3. [PostgreSQL Database Setup](#3-postgresql-database-setup)
4. [Host Guide: Creating & Editing Presentations](#4-host-guide-creating--editing-presentations)
5. [Host Guide: Running Live Presenter Mode](#5-host-guide-running-live-presenter-mode)
6. [Audience Guide: Joining & Participating](#6-audience-guide-joining--participating)
7. [Testing Locally & On Mobile Devices](#7-testing-locally--on-mobile-devices)
8. [Database Tools & Prisma Studio](#8-database-tools--prisma-studio)
9. [Troubleshooting & FAQ](#9-troubleshooting--faq)

---

## 1. System Overview & Architecture

MentiPulse is divided into three interconnected layers:

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend & UI** | Next.js 14 (App Router), Tailwind CSS, Framer Motion | Provides mobile-first participant views and high-resolution projector screens. |
| **Real-Time Engine** | Socket.io WebSockets (`server.ts`) | Delivers sub-50ms synchronized state updates between host and all connected audience devices. |
| **Database & Persistence** | PostgreSQL, Prisma ORM | Stores quizzes, questions, options, game sessions, participant scores, and responses. |

---

## 2. Quick Start & Server Operations

### Prerequisites
* **Node.js** v18+ or v20+ (Node v22 installed on this machine).
* Windows PowerShell or terminal.

### Starting the Application
Open PowerShell in the project directory:
```powershell
cd d:\ANTIGRAVITY_PROJECTS\mentimeter-clone
npm run dev
```

The server starts both the Next.js App Router and the Socket.io WebSocket server on **port 3000**:
* **Home Page**: [http://localhost:3000](http://localhost:3000)
* **Host Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
* **Audience Join Screen**: [http://localhost:3000/join](http://localhost:3000/join)

### Stopping the Server
Press `Ctrl + C` in your terminal to stop the server.

---

## 2.1 Customizing the Application Name & Branding

You can change the application name at any time without editing any component code!

### Method 1: Via `.env` (Quickest)
Open `.env` and set:
```env
NEXT_PUBLIC_APP_NAME="YourCustomName"
NEXT_PUBLIC_APP_DESC="Your Custom Tagline"
```

### Method 2: Via Configuration File
Open [`src/config/app.ts`](file:///d:/ANTIGRAVITY_PROJECTS/mentimeter-clone/src/config/app.ts):
```ts
export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'YourCustomName',
  description: 'Your Custom Tagline',
  tagline: 'Live Interactive Quiz',
  footerText: 'Interactive Presentation Platform',
};
```
The entire application (Navbar logo, browser tab title, mobile audience views, server logs, and footer) will automatically update everywhere!

---

## 3. PostgreSQL Database Setup

MentiPulse is fully configured for PostgreSQL via Prisma.

### Connecting Your Database
Open the `.env` file in `d:\ANTIGRAVITY_PROJECTS\mentimeter-clone\.env`:

```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>?schema=public"
```

#### Option A: Cloud PostgreSQL (Recommended - 1-Click Free Setup)
1. Create a free PostgreSQL instance on **[Neon.tech](https://neon.tech)** or **[Supabase.com](https://supabase.com)**.
2. Copy the pooled connection string into `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-sample-1234.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

#### Option B: Local PostgreSQL
If you have PostgreSQL installed locally on your Windows machine:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mentimeter?schema=public"
```

### Initializing Tables & Seeding
Once `.env` is saved, run the following commands in the project folder:

```powershell
# 1. Push database tables and relationships
npm run prisma:push

# 2. Populate PostgreSQL with rich sample quizzes
npm run prisma:seed
```

> **Note on In-Memory Fallback:** If your PostgreSQL database is offline or not yet configured, MentiPulse automatically activates its built-in in-memory fallback. You can still create quizzes, launch live sessions, and vote immediately without server crashes.

---

## 4. Host Guide: Creating & Editing Presentations

### Accessing the Dashboard
Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard). From here you can:
* View all existing presentations with question counts.
* Check database connection status (Green = Connected, Yellow = Live In-Memory mode).
* Launch a live room with a single click.
* Edit, duplicate, or delete quizzes.

### Creating a New Quiz
Click **"+ New Presentation"** (or go to [http://localhost:3000/quiz/new](http://localhost:3000/quiz/new)):

1. **Title & Description**: Click on the title at the top to rename your quiz (e.g., *"Quarterly Team Trivia"*).
2. **Left Slide Panel**:
   * View all slides in sequence.
   * Click **"+ Add"** or choose **Poll** / **Word Cloud** quick-buttons to insert new slides.
   * Duplicate or delete slides using the hover icons.
3. **Right Settings Panel**:
   * **Slide Type**:
     * **Quiz (Multiple Choice)**: Competitive question with points, speed multipliers, and a single or multiple correct answers.
     * **Poll**: Survey question displaying live distribution bars and percentages without right/wrong penalties.
     * **Word Cloud**: Free-form text submission where audience responses cluster and scale in size based on submission frequency.
   * **Time Limit**: Select 10s, 15s, 20s, 30s, 45s, or 60s per question.
   * **Points**: Standard (1,000 pts), Double (2,000 pts), or 0 pts (for polls).
   * **Options**: Add up to 6 choices, type custom answers, and click the checkmark circle to designate the correct answer.
4. **Save**: Click **"Save Presentation"** in the top right to persist your changes.

---

## 5. Host Guide: Running Live Presenter Mode

When you are ready to present in a meeting, classroom, or webinar:

### 1. Launching the Session
On the dashboard, click **"Start Live Quiz"** on your presentation card. This opens `/host/[pin]` in presenter mode (e.g. `/host/492813`).

### 2. Presenter Screen Interface
* **Top Bar**:
  * Displays the website join URL (`localhost:3000/join`) and the **6-digit Game PIN**.
  * **Show QR**: Opens a high-resolution QR Code modal for audience members to scan with their smartphone camera.
  * **Player Counter**: Live badge displaying the number of connected players.
  * **Volume Toggle**: Mutes or unmutes synthesized sound effects.
  * **Fullscreen Button**: Expands the view across the full monitor/projector screen (`F11` equivalent).

### 3. Stage Progression & Controls

```
[LOBBY] ➔ [QUESTION] ➔ [REVEAL] ➔ [LEADERBOARD] ➔ [FINISHED]
```

1. **Lobby State**:
   * Displays the Game PIN and joined participants popping in with custom avatar emojis in real time.
   * When participants are in, click **"Start Presentation"**.
2. **Question State**:
   * The countdown timer starts automatically.
   * As audience members submit answers, the live response tally updates (`X / Y answered`).
   * Dynamic vertical bars rise in real time as votes come in.
   * The host can click **"Reveal Answer & Results"** at any time, or wait for the countdown timer to hit `0s`.
3. **Reveal State**:
   * Highlights the correct answer in luminous green.
   * Displays exact vote counts and percentage distributions for each choice.
   * Click **"Show Leaderboard"** to proceed.
4. **Leaderboard State**:
   * Displays the 3-step animated podium (1st, 2nd, 3rd) with trophies and points tally.
   * Displays the top 10 runners-up with current streaks (🔥 x3).
   * Click **"Next Question"** to move to the next slide.
5. **Grand Finale**:
   * Celebrates the final champions with an animated victory fanfare and canvas confetti explosion.
   * Click **"Return to Dashboard"** when the session concludes.

---

## 6. Audience Guide: Joining & Participating

Audience members do not need to install an app; any mobile browser, tablet, or laptop works.

### Step 1: Join the Room
1. Visit **[http://localhost:3000/join](http://localhost:3000/join)** (or scan the presenter's QR code).
2. Enter the **6-digit Game PIN**.
3. Choose a **Nickname** (up to 20 characters).
4. Pick an **Avatar Emoji** (🚀, 🦊, ⚡, 🦄, 🎯, 👾, 🦁, 🔮, etc.) or click **Random**.
5. Click **"Enter Live Room"**.

### Step 2: Waiting in Lobby
* The screen displays: *"You're in! See your nickname on the presenter's screen."*
* When the presenter starts the quiz, your phone automatically transitions to the first question.

### Step 3: Submitting Answers
* **Multiple Choice / Poll**:
  * 4 large, vibrant touch tiles appear with distinct shapes:
    * 🔴 **Red Triangle (▲)** — Option 1
    * 🔵 **Blue Diamond (◆)** — Option 2
    * 🟡 **Yellow Circle (●)** — Option 3
    * 🟢 **Green Square (■)** — Option 4
  * Tap your choice. Your answer locks in instantly and a lock confirmation appears (*"Answer Locked In! 🔒"*).
* **Word Cloud**:
  * Type a word or short phrase and click **"Submit Word"**.

### Step 4: Instant Feedback & Scoring
* When the presenter reveals results:
  * **Correct**: Displays green celebration badge, points earned, speed bonus, and updated total score.
  * **Incorrect**: Displays feedback message encouraging focus for the next slide.
* Speed bonus formula: The faster you answer correctly, the higher your score (up to 100% of available points).

---

## 7. Testing Locally & On Mobile Devices

### Testing on a Single PC (Split-Screen / Two Tabs)
1. Open Chrome window 1 at **[http://localhost:3000/dashboard](http://localhost:3000/dashboard)** and click **"Start Live Quiz"**.
2. Open Chrome window 2 (or an Incognito window) at **[http://localhost:3000/join](http://localhost:3000/join)**.
3. Enter the 6-digit PIN and join. Place both windows side-by-side to watch live synchronization!

### Testing on a Real Smartphone (Same Wi-Fi Network)
1. Find your computer's local IP address in PowerShell:
   ```powershell
   ipconfig
   ```
   *(Look for `IPv4 Address`, e.g., `192.168.1.50`)*.
2. Ensure your phone is connected to the same Wi-Fi network.
3. Open your mobile browser and type:
   `http://<YOUR_IP>:3000/join` (e.g. `http://192.168.1.50:3000/join`).
4. Type the PIN and participate directly from your phone!

---

## 8. Database Tools & Prisma Studio

Prisma includes a visual database GUI to inspect and edit your PostgreSQL data directly in your browser.

In PowerShell, run:
```powershell
cd d:\ANTIGRAVITY_PROJECTS\mentimeter-clone
npm run prisma:studio
```

This launches Prisma Studio at **http://localhost:5555**, where you can browse tables for `Quiz`, `Question`, `Option`, `GameSession`, `Participant`, and `Response`.

---

## 9. Troubleshooting & FAQ

### Q: Port 3000 is already in use
**Solution**: If another program is occupying port 3000, specify a different port in `.env`:
```env
PORT=3001
```
Then start the server with `npm run dev`.

### Q: "Can't reach database server at localhost:5432"
**Solution**:
1. Check that PostgreSQL is running or verify your cloud connection string in `.env`.
2. The application will continue to work seamlessly using its active in-memory store so you are never blocked during live demos.

### Q: Sounds are not playing on the presenter screen
**Solution**: Modern browsers require an initial click or user interaction on the page before allowing Web Audio playback. Click anywhere on the host screen or toggle the sound button in the top bar.

### Q: How do I seed fresh sample quizzes?
**Solution**: Navigate to `/dashboard` and click the **"Load Sample Quizzes"** button at the top, or run:
```powershell
npm run prisma:seed
```
