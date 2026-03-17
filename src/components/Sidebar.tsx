'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signout } from '@/app/auth/actions'
import { Stethoscope, LayoutDashboard, Users, FilePlus, UserCircle, LogOut, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    // Close sidebar on route change on mobile
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    const links = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Patients', href: '/dashboard/patients', icon: Users },
        { name: 'New Prescription', href: '/dashboard/new-rx', icon: FilePlus },
        { name: 'Profile', href: '/dashboard/profile', icon: UserCircle },
    ]

    return (
        <>
            {/* Mobile Top Nav */}
            <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 h-16 fixed top-0 w-full z-40">
                <div className="flex items-center gap-2">
                    <Stethoscope className="w-6 h-6 text-slate-800" />
                    <h1 className="text-xl font-bold tracking-tight text-slate-800">Rx Workspace</h1>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100">
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-[1px_0_5px_rgba(0,0,0,0.05)] border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-full ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="hidden md:flex h-16 items-center justify-center gap-2 border-b border-slate-200 px-4">
                    <Stethoscope className="w-6 h-6 text-slate-800" />
                    <h1 className="text-xl font-bold tracking-tight text-slate-800">Rx Workspace</h1>
                </div>

                {/* Mobile Sidebar Header */}
                <div className="flex md:hidden h-16 items-center justify-between gap-2 border-b border-slate-200 px-4">
                    <div className="flex items-center gap-2">
                        <Stethoscope className="w-6 h-6 text-slate-800" />
                        <h1 className="text-xl font-bold tracking-tight text-slate-800">Rx Workspace</h1>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
                    {links.map((link) => {
                        const isActive = pathname === link.href
                        const Icon = link.icon
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive
                                        ? 'bg-slate-100 font-semibold text-slate-900'
                                        : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                                {link.name}
                            </Link>
                        )
                    })}
                </nav>
                <div className="border-t border-slate-200 p-4">
                    <form action={signout}>
                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
