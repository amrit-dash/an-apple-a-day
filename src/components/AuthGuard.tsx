'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type DashboardContextType = {
    user: any
    doctor: any
    refreshDoctorProfile: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function useDashboardContext() {
    const context = useContext(DashboardContext)
    if (!context) {
        throw new Error('useDashboardContext must be used within an AuthGuard')
    }
    return context
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [doctor, setDoctor] = useState<any>(null)
    const router = useRouter()

    const fetchDoctorProfile = async (userId: string) => {
        const supabase = createClient()
        const { data } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', userId)
            .single()
        setDoctor(data)
    }

    const refreshDoctorProfile = async () => {
        if (user) {
            await fetchDoctorProfile(user.id)
        }
    }

    useEffect(() => {
        const supabase = createClient()

        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
            } else {
                setUser(session.user)
                await fetchDoctorProfile(session.user.id)
            }
            setLoading(false)
        }

        initAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!session) {
                router.push('/login')
            } else {
                setUser(session.user)
                if (!doctor) {
                    await fetchDoctorProfile(session.user.id)
                }
            }
        })

        return () => subscription.unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router])

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#4C8EAB] border-t-transparent"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Loading Workspace...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null // Will redirect in useEffect
    }

    return (
        <DashboardContext.Provider value={{ user, doctor, refreshDoctorProfile }}>
            {children}
        </DashboardContext.Provider>
    )
}
