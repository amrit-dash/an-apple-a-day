import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
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

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Doctor Profile</h2>
            <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                <ProfileForm user={user} initialData={doctor} />
            </div>
        </div>
    )
}
