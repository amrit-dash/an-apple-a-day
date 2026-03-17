import { Sidebar } from '@/components/Sidebar'
import { ReactNode } from 'react'
import { Toaster } from 'sonner'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
            <Toaster position="top-right" richColors />

            {/* Sidebar Component */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-6 pt-24 md:p-8 md:pt-8 w-full">
                <div className="mx-auto max-w-5xl bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
