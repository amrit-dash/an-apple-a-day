# Project: an-apple-a-day
**Description:** A modern, SaaS-style Prescription Generator App for medical doctors. 
**Tech Stack:** Next.js (App Router), Tailwind CSS, Shadcn UI (or standard Tailwind Material Design), Supabase (Auth, PostgreSQL, Storage), Firebase Hosting (Frontend), @react-pdf/renderer.

## Core Rules
1. **Design:** Implement a clean, modern, Material Design-inspired dashboard (Sidebar + Main Content). DO NOT copy the exact layout of any screenshots the user might have provided previously. The UI must look professional and distinct.
2. **Components:** Use Server Components where possible, and Client Components (`"use client"`) for interactivity (forms, PDF rendering, canvas).

## Database Schema (Supabase PostgreSQL)
*   `doctors`: `id` (UUID, matches auth.users UUID), `full_name`, `degree`, `registration_number`, `phone`, `clinic_name`, `clinic_address`, `signature_url`.
*   `patients`: `id` (UUID), `doctor_id` (FK to doctors), `custom_patient_id` (e.g., PAT001), `name`, `age`, `gender`, `contact`, `created_at`, `updated_at`.
*   `prescriptions`: `id` (UUID), `patient_id` (FK to patients), `doctor_id` (FK to doctors), `diagnosis` (text), `additional_notes` (text), `suggested_lab_tests` (text), `created_at`.
*   `prescription_items`: `id` (UUID), `prescription_id` (FK to prescriptions), `medicine_name` (text), `frequency` (text), `duration` (text).
*   `global_medicines`: `id` (UUID), `name` (text, UNIQUE). (Used for global auto-complete).

## Core Flows
1. **Auth:** Supabase Email/Password authentication.
2. **Profile:** Update doctor details, clinic details, and a Canvas element to draw a signature (upload to Supabase Storage, save URL to `doctors` table).
3. **My Patients:** Dashboard view of saved patients. Click a patient to see their info and history of prescriptions.
4. **Generator (New Rx):** 
    * Patient section: Search existing patients. If selected, auto-fill. If modified during Rx creation, update the patient record. If new, create new patient.
    * Medicine section: Input field for medicine name must fuzzy-search `global_medicines`. When prescription is saved, save items to `prescription_items` AND upsert new names into `global_medicines`.
5. **PDF Generation:** Use `@react-pdf/renderer`. Must look like a professional, printed hospital pad (Header, Patient Details Grid, Rx Table, Notes, Signature at bottom).