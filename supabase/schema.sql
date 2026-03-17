-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: doctors
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    degree TEXT,
    registration_number TEXT,
    phone TEXT,
    clinic_name TEXT,
    clinic_address TEXT,
    signature_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: patients
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    custom_patient_id TEXT,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: prescriptions
CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    diagnosis TEXT,
    additional_notes TEXT,
    suggested_lab_tests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: prescription_items
CREATE TABLE public.prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    frequency TEXT,
    duration TEXT
);

-- Table: global_medicines
CREATE TABLE public.global_medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_medicines ENABLE ROW LEVEL SECURITY;

-- Policies for doctors
CREATE POLICY "Doctors can view their own profile" ON public.doctors
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Doctors can update their own profile" ON public.doctors
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Doctors can insert their own profile" ON public.doctors
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies for patients
CREATE POLICY "Doctors can view their own patients" ON public.patients
    FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert their own patients" ON public.patients
    FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own patients" ON public.patients
    FOR UPDATE USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete their own patients" ON public.patients
    FOR DELETE USING (auth.uid() = doctor_id);

-- Policies for prescriptions
CREATE POLICY "Doctors can view their own prescriptions" ON public.prescriptions
    FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can insert their own prescriptions" ON public.prescriptions
    FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their own prescriptions" ON public.prescriptions
    FOR UPDATE USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete their own prescriptions" ON public.prescriptions
    FOR DELETE USING (auth.uid() = doctor_id);

-- Policies for prescription_items
CREATE POLICY "Doctors can view items of their prescriptions" ON public.prescription_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions p
            WHERE p.id = prescription_items.prescription_id AND p.doctor_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can insert items to their prescriptions" ON public.prescription_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.prescriptions p
            WHERE p.id = prescription_id AND p.doctor_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can update items of their prescriptions" ON public.prescription_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions p
            WHERE p.id = prescription_items.prescription_id AND p.doctor_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can delete items of their prescriptions" ON public.prescription_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.prescriptions p
            WHERE p.id = prescription_items.prescription_id AND p.doctor_id = auth.uid()
        )
    );

-- Policies for global_medicines
CREATE POLICY "Authenticated users can read global medicines" ON public.global_medicines
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert global medicines" ON public.global_medicines
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
