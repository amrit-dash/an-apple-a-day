'use client'

import { ProfileForm } from './ProfileForm'
import { useDashboardContext } from '@/components/AuthGuard'

export default function ProfilePage() {
    const { user, doctor } = useDashboardContext()

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[#1A202C]">Doctor Profile</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Update your personal and clinic information. This information will appear on your prescriptions.
                </p>
            </div>

            <ProfileForm
                initialData={doctor || null}
                userId={user.id}
                authProvider={user.app_metadata.provider}
            />
        </div>
    )
}
