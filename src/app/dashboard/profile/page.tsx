'use client'

import { createClient } from '@/utils/supabase/client'
import { ProfileForm } from './ProfileForm'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [userData, setUserData] = useState<{ user: any, doctor: any } | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
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

            setUserData({ user, doctor })
            setLoading(false)
        }

        fetchProfile()
    }, [router])

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[#1A202C]">Doctor Profile</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Update your personal and clinic information. This information will appear on your prescriptions.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4C8EAB] border-t-transparent"></div>
                </div>
            ) : userData ? (
                <ProfileForm
                    initialData={userData.doctor || null}
                    userId={userData.user.id}
                    authProvider={userData.user.app_metadata.provider}
                />
            ) : null}
        </div>
    )
}
