import { signup } from '@/app/auth/actions'
import Link from 'next/link'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ message: string }>
}) {
    const { message } = await searchParams

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-md border border-slate-200">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-[#E0EFF5] flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#4C8EAB]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#1A202C]">Create an account</h2>
                </div>

                <GoogleSignInButton />

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-2 text-slate-500">Or continue with email</span>
                    </div>
                </div>

                <form className="mt-8 space-y-6" action={signup}>
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
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
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
                            className="flex w-full justify-center rounded-lg bg-[#4C8EAB] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#3A738F] focus:outline-none focus:ring-2 focus:ring-[#4C8EAB] focus:ring-offset-2 transition-colors"
                        >
                            Sign up
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-[#4C8EAB] hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
