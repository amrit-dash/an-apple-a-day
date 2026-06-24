# An Apple A Day (Rx Workspace)

A modern, SaaS-style Prescription Generator App designed for medical doctors. Build professional, branded hospital prescriptions effortlessly.

## Features
- **Smart Patient Management:** Autocomplete functionality saves time for returning patients, keeping track of their visit history.
- **Global Medicine Dictionary:** Fuzzy-search autocomplete that learns your frequently prescribed medicines.
- **Digital Signatures:** Draw your signature on a canvas or upload a scanned image with automatic "near-white" background removal.
- **Professional PDF Generation:** Exports fully branded prescriptions as high-quality PDFs (`@react-pdf/renderer`) directly from your browser.
- **Secure Authentication & Data:** Powered by Supabase (Auth, PostgreSQL, Row Level Security, Storage).
- **Responsive Material Design:** Crafted with Tailwind CSS and Lucide icons for a clean, intuitive UX on both desktop and mobile.

## Architecture

| Layer | Service | Role |
|-------|---------|------|
| **Backend** | [Supabase](https://supabase.com) | Auth, PostgreSQL database, Row Level Security, file storage (signatures) |
| **Frontend** | Next.js (static export) | UI, PDF generation, client-side data access via Supabase SDK |
| **Hosting** | Firebase Hosting | Serves the built static site (`out/`) — CDN only; no Firebase Auth, Firestore, or Storage |

Local development talks directly to Supabase. Firebase is used only when deploying the static frontend.

## Tech Stack
- Next.js (App Router, static export)
- React & TypeScript
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage, RLS)
- `@react-pdf/renderer`
- `react-signature-canvas`
- `sonner` for toast notifications
- Firebase Hosting (static site CDN — deploy only)

## Setup & Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd an-apple-a-day
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Supabase:**
   - Create a project on [Supabase](https://supabase.com).
   - In the SQL Editor, execute the contents of `supabase/schema.sql` to build the required tables (`doctors`, `patients`, `prescriptions`, `prescription_items`, `global_medicines`) and Row Level Security (RLS) policies.
   - Execute the contents of `supabase/storage.sql` to initialize the public `signatures` storage bucket.
   - Copy `.env.example` to `.env.local` and fill in your Supabase URL and anon key (Dashboard → Project Settings → API).
   - In Supabase → Authentication → URL Configuration, add `http://localhost:3000` to **Site URL** and **Redirect URLs** (needed for password reset and Google sign-in).

4. **Run the local dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to preview the app.

## Supabase Keep-Alive (GitHub Actions)

Supabase free-tier projects **auto-pause after about 7 days without database activity**. Auth and health endpoints do not count — only real Postgres queries do.

This repo includes [`.github/workflows/supabase-keep-alive.yml`](.github/workflows/supabase-keep-alive.yml), which runs **daily** and issues a minimal `SELECT` against the `doctors` table via the Supabase REST API. You can also trigger it manually from the Actions tab (`workflow_dispatch`).

**Required GitHub Actions secrets** (Settings → Secrets and variables → Actions → Secrets):

| Secret | Where to find it |
|--------|------------------|
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → `anon` `public` key |

**Optional repository variable** (Settings → Secrets and variables → Actions → Variables):

| Variable | Default | Purpose |
|----------|---------|---------|
| `KEEP_ALIVE_TABLE` | `doctors` | Table used for the lightweight ping (must exist in your schema) |

The anon key is sufficient: RLS may return an empty row set, but the query still hits Postgres and resets the inactivity timer. Do **not** commit keys to the repo — use GitHub secrets only.

## Optional: Google Sign-In

Enable the Google provider in Supabase → Authentication → Providers, then add your OAuth client ID/secret. No extra env vars are needed in this app.

## Deploy (Firebase Hosting)

Production hosting uses Firebase Hosting to serve the static export. Auth, database, and storage remain on Supabase — no Firebase backend services are involved.

Prerequisites: [Firebase CLI](https://firebase.google.com/docs/cli) installed and authenticated (`firebase login`). No Firebase env vars are needed in the app; project mapping lives in `.firebaserc`.

```bash
npm run build
firebase deploy --only hosting
```

## License
MIT
