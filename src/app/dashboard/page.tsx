'use client'

import { createClient } from '@/utils/supabase/client'
import { Users, FileText, Pill, Plus, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDashboardContext } from '@/components/AuthGuard'

function StatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 animate-pulse">
                    <div className="p-4 bg-slate-100 rounded-xl w-16 h-16 flex-shrink-0"></div>
                    <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-100 rounded w-24"></div>
                        <div className="h-8 bg-slate-100 rounded w-16"></div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function TableSkeleton() {
    return (
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 animate-pulse">
            <div className="h-8 bg-slate-100 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-slate-100 rounded w-full"></div>
                ))}
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const { user, doctor } = useDashboardContext()
    const [isProfileIncomplete, setIsProfileIncomplete] = useState<boolean>(false)
    const [stats, setStats] = useState({ patients: 0, prescriptions: 0, medicines: 0 })
    const [patients, setPatients] = useState<any[]>([])
    const [loadingStats, setLoadingStats] = useState(true)
    const [loadingPatients, setLoadingPatients] = useState(true)

    useEffect(() => {
        setIsProfileIncomplete(!doctor || !doctor.full_name?.trim() || !doctor.registration_number?.trim() || !doctor.phone?.trim() || !doctor.clinic_name?.trim())

        const fetchDashboardData = async () => {
            const supabase = createClient()

            // Fetch Stats
            const [patientRes, rxRes, medRes] = await Promise.all([
                supabase.from('patients').select('id', { count: 'exact', head: true }).eq('doctor_id', user.id),
                supabase.from('prescriptions').select('id', { count: 'exact', head: true }).eq('doctor_id', user.id),
                supabase.from('global_medicines').select('id', { count: 'exact', head: true })
            ])

            setStats({
                patients: patientRes.count || 0,
                prescriptions: rxRes.count || 0,
                medicines: medRes.count || 0
            })
            setLoadingStats(false)

            // Fetch Patients
            const { data: recentPatients } = await supabase
                .from('patients')
                .select('id, name, custom_patient_id, created_at')
                .eq('doctor_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5)

            setPatients(recentPatients || [])
            setLoadingPatients(false)
        }

        fetchDashboardData()
    }, [user.id, doctor])

    return (
        <div className="space-y-8 pb-10">
            {isProfileIncomplete && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-full flex-shrink-0">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-amber-800 font-semibold">Profile Incomplete</h3>
                            <p className="text-amber-700 text-sm mt-0.5">Complete your profile to start generating prescriptions.</p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/profile"
                        className="whitespace-nowrap inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        Complete Profile
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}

            <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#1A202C]">Dashboard</h2>
                <p className="mt-1 text-sm text-slate-500">Welcome to your Rx Workspace.</p>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Quick Actions</h3>
                <Link
                    href="/dashboard/new-rx"
                    className="inline-flex items-center justify-center gap-2 bg-[#4C8EAB] hover:bg-[#3A738F] text-white font-semibold py-4 px-8 rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    Create New Prescription
                </Link>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Overview</h3>
                {loadingStats ? <StatsSkeleton /> : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                            <div className="p-4 bg-[#F2F7F9] text-[#4C8EAB] rounded-xl flex-shrink-0">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Patients</p>
                                <p className="text-3xl font-bold text-[#1A202C]">{stats.patients}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl flex-shrink-0">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Prescriptions</p>
                                <p className="text-3xl font-bold text-[#1A202C]">{stats.prescriptions}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
                            <div className="p-4 bg-yellow-100 text-[#EDAC3F] rounded-xl flex-shrink-0">
                                <Pill className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Medicine Directory</p>
                                <p className="text-3xl font-bold text-[#1A202C]">{stats.medicines}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4">Recently Added Patients</h3>
                {loadingPatients ? <TableSkeleton /> : (
                    patients.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                            <p className="text-slate-500 text-sm">No patients found. Create your first prescription to add a patient.</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Added</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {patients.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A202C]">{p.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.custom_patient_id || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                    {new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
