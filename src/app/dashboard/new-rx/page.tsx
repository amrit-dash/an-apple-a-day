import { createClient } from '@/utils/supabase/server'
import { RxForm } from './RxForm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UserCircle, AlertCircle } from 'lucide-react'

export default async function NewRxPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: doctor } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', user.id)
        .single()

    const isProfileIncomplete = !doctor || !doctor.full_name?.trim() || !doctor.registration_number?.trim() || !doctor.phone?.trim() || !doctor.clinic_name?.trim()

    if (isProfileIncomplete) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-lg mx-auto text-center space-y-6">
                <div className="bg-amber-100 text-amber-600 p-4 rounded-full">
                    <AlertCircle className="w-12 h-12" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[#1A202C] tracking-tight">Complete Your Profile</h2>
                    <p className="mt-2 text-slate-500">
                        You must complete your doctor profile (including your name and clinic details) before you can start generating prescriptions.
                    </p>
                </div>
                <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-2 bg-[#4C8EAB] hover:bg-[#3A738F] text-white font-semibold py-3 px-6 rounded-xl shadow-sm transition-all hover:shadow-md"
                >
                    <UserCircle className="w-5 h-5" />
                    Go to Profile Settings
                </Link>
            </div>
        )
    }

    // Fetch doctors patients to pre-fill autocomplete
    const { data: patients } = await supabase
        .from('patients')
        .select('id, name, custom_patient_id, age, gender, contact')
        .eq('doctor_id', user.id)

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div>
                <h2 className="text-2xl font-bold text-[#1A202C] tracking-tight">New Prescription</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Fill in the details below to generate and save a new prescription.
                </p>
            </div>

            <RxForm doctor={doctor} initialPatients={patients || []} />
        </div>
    )
}
