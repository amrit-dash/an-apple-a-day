# An Apple A Day (Rx Workspace)

A modern, SaaS-style Prescription Generator App designed for medical doctors. Build professional, branded hospital prescriptions effortlessly.

## Features
- **Smart Patient Management:** Autocomplete functionality saves time for returning patients, keeping track of their visit history.
- **Global Medicine Dictionary:** Fuzzy-search autocomplete that learns your frequently prescribed medicines.
- **Digital Signatures:** Draw your signature on a canvas or upload a scanned image with automatic "near-white" background removal.
- **Professional PDF Generation:** Exports fully branded prescriptions as high-quality PDFs (`@react-pdf/renderer`) directly from your browser.
- **Secure Authentication & Data:** Powered by Supabase (Auth, PostgreSQL, Row Level Security, Storage).
- **Responsive Material Design:** Crafted with Tailwind CSS and Lucide icons for a clean, intuitive UX on both desktop and mobile.

## Tech Stack
- Next.js (App Router, Server Actions)
- React & TypeScript
- Tailwind CSS
- Supabase (Auth, PostgreSQL, Storage, RLS)
- `@react-pdf/renderer`
- `react-signature-canvas`
- `sonner` for toast notifications
- Firebase Hosting (Frontend Delivery)

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
   - Set up your local environment by creating a `.env.local` file:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Run the local dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to preview the app.

## License
MIT
