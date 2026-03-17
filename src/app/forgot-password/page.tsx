import { forgotPassword } from '@/app/auth/actions'
import Link from 'next/link'

export default async function ForgotPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const { message } = await searchParams

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-md border border-slate-200">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reset Password</h2>
                </div>

                <form className="mt-8 space-y-6" action={forgotPassword}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 sm:text-sm"
                                placeholder="doctor@hospital.com"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className="text-sm text-green-600 bg-green-50 border border-green-100 p-3 rounded-lg text-center">{message}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Send Reset Link
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-slate-600">
                    Remembered your password?{' '}
                    <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
