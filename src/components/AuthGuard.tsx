'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
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
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching doctor profile:', error)
            }

            setDoctor(data || null)
        } catch (error) {
            console.error('Unexpected error fetching doctor profile:', error)
            setDoctor(null)
        }
    }

    const refreshDoctorProfile = async () => {
        if (user) {
            await fetchDoctorProfile(user.id)
        }
    }

    useEffect(() => {
        const supabase = createClient()

        // Fetch initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) console.error('Error getting session:', error)

            if (!session) {
                router.push('/login')
            } else {
                setUser(session.user)
                setLoading(false)
                fetchDoctorProfile(session.user.id)
            }
        }).catch(err => {
            console.error('Unexpected error during getSession:', err)
            setLoading(false)
        })

        // Listen for auth changes (token refresh, sign in, sign out)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            try {
                if (event === 'INITIAL_SESSION') return; // Handled by getSession() above

                if (!session) {
                    router.push('/login')
                } else {
                    setUser(session.user)
                    setLoading(false)
                    if (!doctor) {
                        // DEFER the database call to break the gotrue-js lock reentrancy deadlock!
                        // gotrue-js holds the session lock while firing this event. If we await a db query here, it deadlocks.
                        setTimeout(() => {
                            fetchDoctorProfile(session.user.id)
                        }, 0)
                    }
                }
            } catch (error) {
                console.error('Unexpected error in onAuthStateChange:', error)
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
