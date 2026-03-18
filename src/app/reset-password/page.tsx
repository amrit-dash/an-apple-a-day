'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const urlMessage = searchParams.get('message')
    const [message, setMessage] = useState<string | null>(urlMessage)
    const [loading, setLoading] = useState(false)

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const password = formData.get('password') as string

        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({
            password: password
        })

        if (error) {
            setMessage(error.message || 'Could not update password')
            setLoading(false)
        } else {
            router.push('/login?message=Password updated successfully, please log in')
        }
    }

    return (
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">New Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-[#1A202C] shadow-sm focus:border-[#4C8EAB] focus:outline-none focus:ring-1 focus:ring-[#4C8EAB] placeholder:text-slate-400 sm:text-sm"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {message && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg text-center">{message}</div>
            )}

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center items-center gap-2 rounded-lg bg-[#4C8EAB] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#3A738F] focus:outline-none focus:ring-2 focus:ring-[#4C8EAB] focus:ring-offset-2 transition-colors disabled:opacity-70"
                >
                    {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : 'Update Password'}
                </button>
            </div>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-md border border-slate-200">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-[#E0EFF5] flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#4C8EAB]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1A202C]">Set New Password</h2>
                </div>

                <Suspense fallback={<div className="flex justify-center p-4"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#4C8EAB] border-t-transparent" /></div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
