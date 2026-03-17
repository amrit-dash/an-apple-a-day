import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PatientsClient } from './PatientsClient'

export default async function PatientsPage() {
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

    // Fetch patients and their prescriptions for the doctor
    const { data: patients, error } = await supabase
        .from('patients')
        .select(`
      id, name, custom_patient_id, age, gender, contact, created_at, updated_at,
      prescriptions (
        id,
        diagnosis,
        additional_notes,
        suggested_lab_tests,
        created_at,
        prescription_items (
          medicine_name,
          frequency,
          duration
        )
      )
    `)
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching patients:', error)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Patients</h2>
                <p className="mt-1 text-sm text-slate-500">View and manage your patient records.</p>
            </div>

            <PatientsClient doctor={doctor} patients={patients || []} />
        </div>
    )
}
