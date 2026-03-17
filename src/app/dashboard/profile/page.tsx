import { createClient } from '@/utils/supabase/server'
import { ProfileForm } from './ProfileForm'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch doctor profile
    const { data: doctor } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[#1A202C]">Doctor Profile</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Update your personal and clinic information. This information will appear on your prescriptions.
                </p>
            </div>
            <ProfileForm initialData={doctor || null} userId={user.id} authProvider={user.app_metadata.provider} />
        </div>
    )
}
