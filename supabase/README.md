# 🏥 MediCure AI - Supabase Database Integration Guide

MediCure AI is configured with full **Supabase (PostgreSQL + Realtime)** database support.

---

## 🚀 3-Minute Quick Setup

### Step 1: Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**, choose an organization, name it (e.g. `medicure-ai`), and set a secure database password.
3. Wait ~1 minute for Supabase to provision your PostgreSQL database.

---

### Step 2: Run the MediCure Schema & Seed Data
1. In your Supabase dashboard, navigate to the **SQL Editor** (terminal icon on the left menu).
2. Click **New Query**.
3. Open [`supabase/schema.sql`](file:///c:/Users/hp/MEDICURE-AI/supabase/schema.sql) from this project, copy all contents, and paste into the query window.
4. Click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`).
5. You should see `Success. No rows returned`.

> **What this sets up automatically:**
> - All 7 core clinical tables (`user_profiles`, `doctors`, `departments`, `appointments`, `prescriptions`, `medical_records`, `ai_consultations`).
> - Row Level Security (RLS) policies.
> - Realtime publication stream (`supabase_realtime`) for instant live updates.
> - Initial seed data with accredited board-certified physicians, clinical departments, and sample records.

---

### Step 3: Add Credentials to `.env`
1. In your Supabase dashboard, click the **Settings** (gear icon) -> **API** (or **Data API**).
2. Copy the **Project URL** and the **Project API Anon Key** (`anon` `public`).
3. Open your [`.env`](file:///c:/Users/hp/MEDICURE-AI/.env) file in the root of the project and paste them:

```env
# Supabase Database Configuration
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

4. Save the `.env` file.

---

### Step 4: Run the Application
Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000`. The portal header and login screen will display:
🟢 **SUPABASE CONNECTED (LIVE)**

---

## 📊 Database Architecture

| Table | Description | Realtime Sync | RLS Enabled |
| :--- | :--- | :---: | :---: |
| `user_profiles` | Clinical identity, emergency contacts, insurance & allergies | ✅ | ✅ |
| `doctors` | Physician directory, credentials, ratings, consultation fees | ✅ | ✅ |
| `departments` | Hospital departments, physician capacity, unit load | ✅ | ✅ |
| `appointments` | In-person and telehealth bookings, intake notes, copay receipt | ✅ | ✅ |
| `prescriptions` | Active medications, dosage instructions, pharmacy refill status | ✅ | ✅ |
| `medical_records` | Diagnostic lab results, metabolic panels, ECG telemetry reports | ✅ | ✅ |
| `ai_consultations` | Dr. Nova clinical triage conversation history & protocols | ✅ | ✅ |

---

## 🔄 Realtime Synchronization
Any modification made—whether an appointment booked by a patient, a prescription refill approved by a doctor, or an updated status from reception—is immediately broadcast through Supabase Realtime channels (`postgres_changes`) and synchronized across all open screens without manual page refreshes.

---

## 🛡️ Fallback Resilience
If Supabase keys are not configured or the network is offline, the application seamlessly runs using local seed state and Firebase compatibility mode so developers and reviewers can test without interruptions.
