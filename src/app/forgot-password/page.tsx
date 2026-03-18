'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

function ForgotPasswordForm() {
    const searchParams = useSearchParams()
    const urlMessage = searchParams.get('message')
    const [message, setMessage] = useState<string | null>(urlMessage)
    const [loading, setLoading] = useState(false)

    const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string

        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
            setMessage(error.message || 'Could not send reset email')
        } else {
            setMessage('Check your email for the reset link.')
        }
        setLoading(false)
    }

    return (
        <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-[#1A202C] shadow-sm focus:border-[#4C8EAB] focus:outline-none focus:ring-1 focus:ring-[#4C8EAB] placeholder:text-slate-400 sm:text-sm"
                        placeholder="doctor@hospital.com"
                    />
                </div>
            </div>

            {message && (
                <div className={`text-sm ${message.includes('error') || message.includes('Could not') ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'} border p-3 rounded-lg text-center`}>{message}</div>
            )}

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center items-center gap-2 rounded-lg bg-[#4C8EAB] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#3A738F] focus:outline-none focus:ring-2 focus:ring-[#4C8EAB] focus:ring-offset-2 transition-colors disabled:opacity-70"
                >
                    {loading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : 'Send Reset Link'}
                </button>
            </div>
        </form>
    )
}

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-md border border-slate-200">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-[#E0EFF5] flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#4C8EAB]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1A202C]">Reset Password</h2>
                </div>

                <Suspense fallback={<div className="flex justify-center p-4"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#4C8EAB] border-t-transparent" /></div>}>
                    <ForgotPasswordForm />
                </Suspense>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Remembered your password?{' '}
                    <Link href="/login" className="font-semibold text-[#4C8EAB] hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
