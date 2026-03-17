import Link from 'next/link'
import { signout } from '@/app/auth/actions'

export function Sidebar() {
    return (
        <div className="flex h-full w-64 flex-col bg-white shadow-lg">
            <div className="flex h-16 items-center justify-center border-b border-gray-200">
                <h1 className="text-xl font-bold text-indigo-600">Rx Generator</h1>
            </div>
            <nav className="flex-1 space-y-2 p-4">
                <Link href="/dashboard" className="block rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
                    Dashboard
                </Link>
                <Link href="/dashboard/patients" className="block rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
                    My Patients
                </Link>
                <Link href="/dashboard/new-rx" className="block rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
                    New Prescription
                </Link>
                <Link href="/dashboard/profile" className="block rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors">
                    Profile
                </Link>
            </nav>
            <div className="border-t border-gray-200 p-4">
                <form action={signout}>
                    <button
                        type="submit"
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    >
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    )
}
