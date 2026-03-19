'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, FilePlus, UserCircle, LogOut, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import logoSvg from '@/assets/logo.svg'
import { createClient } from '@/utils/supabase/client'

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    // Close sidebar on route change on mobile
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    const links = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Patients', href: '/dashboard/patients', icon: Users },
        { name: 'New Prescription', href: '/dashboard/new-rx', icon: FilePlus },
        { name: 'Profile', href: '/dashboard/profile', icon: UserCircle },
    ]

    return (
        <>
            {/* Mobile Top Nav */}
            <div className="lg:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 h-16 fixed top-0 w-full z-40">
                <div className="flex items-center gap-2">
                    <Image src={logoSvg} alt="Logo" width={28} height={28} />
                    <h1 className="text-xl font-bold tracking-tight text-[#1A202C]">Rx Workspace</h1>
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-[#1A202C] p-2 rounded-lg hover:bg-slate-100">
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-[1px_0_5px_rgba(0,0,0,0.05)] border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="hidden lg:flex h-16 items-center justify-center gap-2 border-b border-slate-200 px-4">
                    <Image src={logoSvg} alt="Logo" width={28} height={28} />
                    <h1 className="text-xl font-bold tracking-tight text-[#1A202C]">Rx Workspace</h1>
                </div>

                {/* Mobile Sidebar Header */}
                <div className="flex lg:hidden h-16 items-center justify-between gap-2 border-b border-slate-200 px-4">
                    <div className="flex items-center gap-2">
                        <Image src={logoSvg} alt="Logo" width={28} height={28} />
                        <h1 className="text-xl font-bold tracking-tight text-[#1A202C]">Rx Workspace</h1>
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
                                    ? 'bg-[#EBF4F8] font-semibold text-[#1A202C]'
                                    : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1A202C]'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-[#1A202C]' : 'text-slate-500'}`} />
                                {link.name}
                            </Link>
                        )
                    })}
                </nav>
                <div className="border-t border-slate-200 p-4">
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-1"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    )
}
