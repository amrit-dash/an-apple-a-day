'use client'

import { createClient } from '@/utils/supabase/client'
import { PatientsClient } from './PatientsClient'
import { useEffect, useState } from 'react'
import { useDashboardContext } from '@/components/AuthGuard'

export default function PatientsPage() {
    const { user, doctor } = useDashboardContext()
    const [loading, setLoading] = useState(true)
    const [patients, setPatients] = useState<any[]>([])

    useEffect(() => {
        const fetchPatients = async () => {
            const supabase = createClient()

            const { data: patientsList, error } = await supabase
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

            setPatients(patientsList || [])
            setLoading(false)
        }

        fetchPatients()
    }, [user.id])

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#1A202C]">My Patients</h2>
                <p className="mt-1 text-sm text-slate-500">View and manage your patient records.</p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4C8EAB] border-t-transparent"></div>
                </div>
            ) : (
                <PatientsClient doctor={doctor} patients={patients} />
            )}
        </div>
    )
}
