'use client'

import { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type DoctorProfile = {
    full_name: string
    degree: string
    registration_number: string
    phone: string
    clinic_name: string
    clinic_address: string
    signature_url: string | null
}

type ProfileFormProps = {
    initialData: DoctorProfile | null
    userId: string
}

export function ProfileForm({ initialData, userId }: ProfileFormProps) {
    const [formData, setFormData] = useState({
        clinic_name: initialData?.clinic_name || '',
        full_name_degree: (initialData?.full_name ? `${initialData.full_name}${initialData.degree ? `, ${initialData.degree}` : ''}` : ''),
        clinic_address: initialData?.clinic_address || '',
        phone: initialData?.phone || '',
        registration_number: initialData?.registration_number || '',
    })
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const sigCanvas = useRef<SignatureCanvas>(null)
    const supabase = createClient()
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleClearSignature = () => {
        sigCanvas.current?.clear()
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage(null)

        try {
            let signature_url = initialData?.signature_url

            // Handle signature upload if new signature drawn
            if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
                const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
                const blob = await (await fetch(signatureDataUrl)).blob()
                const file = new File([blob], `${userId}.png`, { type: 'image/png' })

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('signatures')
                    .upload(`${userId}.png`, file, {
                        upsert: true,
                        contentType: 'image/png'
                    })

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('signatures')
                    .getPublicUrl(`${userId}.png`)

                signature_url = publicUrl
            }

            // Parse name and degree loosely (e.g. "Dr. Name, MBBS")
            const parts = formData.full_name_degree.split(',')
            const full_name = parts[0]?.trim() || ''
            const degree = parts.slice(1).join(',').trim() || ''

            // Upsert to doctors table
            const { error: dbError } = await supabase
                .from('doctors')
                .upsert({
                    id: userId,
                    full_name,
                    degree,
                    clinic_name: formData.clinic_name,
                    clinic_address: formData.clinic_address,
                    phone: formData.phone,
                    registration_number: formData.registration_number,
                    signature_url
                })

            if (dbError) throw dbError

            setMessage({ type: 'success', text: 'Profile saved successfully!' })
            router.refresh()
        } catch (err: any) {
            console.error(err)
            setMessage({ type: 'error', text: err.message || 'Failed to save profile' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form onSubmit={handleSave} className="bg-white shadow-md rounded-lg p-6 space-y-6">

            {message && (
                <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    Doctor Information
                </h3>

                <div>
                    <label htmlFor="clinic_name" className="block text-sm font-medium text-gray-700">Clinic Name</label>
                    <input
                        type="text"
                        id="clinic_name"
                        name="clinic_name"
                        value={formData.clinic_name}
                        onChange={handleChange}
                        placeholder="e.g. PARAS HOSPITALS"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="full_name_degree" className="block text-sm font-medium text-gray-700">Doctor Name & Degree</label>
                    <input
                        type="text"
                        id="full_name_degree"
                        name="full_name_degree"
                        value={formData.full_name_degree}
                        onChange={handleChange}
                        placeholder="e.g. Dr. Ojashwin Mishra, MBBS, DNB"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="clinic_address" className="block text-sm font-medium text-gray-700">Clinic Address</label>
                    <textarea
                        id="clinic_address"
                        name="clinic_address"
                        rows={2}
                        value={formData.clinic_address}
                        onChange={handleChange}
                        placeholder="e.g. Phase- I, C-1, Sushant Lok Rd..."
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 9178597925"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>
                    <div>
                        <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700">Registration Number</label>
                        <input
                            type="text"
                            id="registration_number"
                            name="registration_number"
                            value={formData.registration_number}
                            onChange={handleChange}
                            placeholder="DMC116643"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
                    <div className="border border-gray-300 rounded-md bg-gray-50 overflow-hidden">
                        <SignatureCanvas
                            ref={sigCanvas}
                            canvasProps={{ className: 'w-full h-40 cursor-crosshair' }}
                            backgroundColor="rgb(249, 250, 251)"
                        />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                            {initialData?.signature_url ? 'Draw to update your existing signature' : 'Draw your signature above'}
                        </span>
                        <button
                            type="button"
                            onClick={handleClearSignature}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            Clear Signature
                        </button>
                    </div>
                    {initialData?.signature_url && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">Current Signature:</p>
                            <img src={initialData.signature_url} alt="Current Signature" className="h-16 border rounded bg-white p-1" />
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </form>
    )
}
