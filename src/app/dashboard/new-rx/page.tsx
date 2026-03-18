'use client'

import { createClient } from '@/utils/supabase/client'
import { RxForm } from './RxForm'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserCircle, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function NewRxPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<{ doctor: any, patients: any[], isProfileIncomplete: boolean } | null>(null)

    useEffect(() => {
        const fetchInitialData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            const { data: doctor } = await supabase
                .from('doctors')
                .select('*')
                .eq('id', user.id)
                .single()

            const isProfileIncomplete = !doctor || !doctor.full_name?.trim() || !doctor.registration_number?.trim() || !doctor.phone?.trim() || !doctor.clinic_name?.trim()

            // Fetch doctors patients to pre-fill autocomplete
            const { data: patients } = await supabase
                .from('patients')
                .select('id, name, custom_patient_id, age, gender, contact')
                .eq('doctor_id', user.id)
                .order('name', { ascending: true })

            setData({ doctor, patients: patients || [], isProfileIncomplete })
            setLoading(false)
        }

        fetchInitialData()
    }, [router])

    if (loading) {
        return (
            <div className="flex justify-center p-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4C8EAB] border-t-transparent"></div>
            </div>
        )
    }

    if (!data) return null

    if (data.isProfileIncomplete) {
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

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#1A202C]">New Prescription</h2>
                <p className="mt-1 text-sm text-slate-500">Fill in the details below to generate a new prescription.</p>
            </div>

            <RxForm doctor={data.doctor} initialPatients={data.patients} />
        </div>
    )
}
