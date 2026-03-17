'use client'

import { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { createClient } from '@/utils/supabase/client'

type DoctorData = {
    id: string
    full_name: string
    degree: string
    registration_number: string
    phone: string
    clinic_name: string
    clinic_address: string
    signature_url?: string
}

export default function ProfileForm({
    user,
    initialData,
}: {
    user: any
    initialData: DoctorData | null
}) {
    const [formData, setFormData] = useState({
        full_name: initialData?.full_name || '',
        degree: initialData?.degree || '',
        registration_number: initialData?.registration_number || '',
        phone: initialData?.phone || '',
        clinic_name: initialData?.clinic_name || '',
        clinic_address: initialData?.clinic_address || '',
    })

    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const sigCanvas = useRef<SignatureCanvas>(null)
    const supabase = createClient()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const clearSignature = () => {
        sigCanvas.current?.clear()
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage({ type: '', text: '' })

        try {
            let signature_url = initialData?.signature_url

            // Handle Signature upload if a new signature was drawn
            if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
                const sigBlob = await new Promise<Blob | null>((resolve) => {
                    sigCanvas.current?.getTrimmedCanvas().toBlob((blob) => {
                        resolve(blob)
                    }, 'image/png')
                })

                if (sigBlob) {
                    const fileName = `${user.id}-${Date.now()}.png`

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('signatures')
                        .upload(fileName, sigBlob, {
                            upsert: true,
                            contentType: 'image/png'
                        })

                    if (uploadError) {
                        console.error('Upload Error:', uploadError)
                        throw new Error('Failed to upload signature.')
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('signatures')
                        .getPublicUrl(fileName)

                    signature_url = publicUrl
                }
            }

            // Upsert into doctors table
            const { error: dbError } = await supabase
                .from('doctors')
                .upsert({
                    id: user.id,
                    ...formData,
                    ...(signature_url ? { signature_url } : {})
                })

            if (dbError) {
                console.error('DB Error:', dbError)
                throw new Error('Failed to update profile data.')
            }

            setMessage({ type: 'success', text: 'Profile saved successfully!' })

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {message.text && (
                <div className={`p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Doctor Name</label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                        placeholder="Dr. John Doe"
                    />
                </div>

                <div>
                    <label htmlFor="degree" className="block text-sm font-medium text-gray-700">Degree</label>
                    <input
                        type="text"
                        id="degree"
                        name="degree"
                        value={formData.degree}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                        placeholder="MBBS, MD"
                    />
                </div>

                <div>
                    <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700">Registration Number</label>
                    <input
                        type="text"
                        id="registration_number"
                        name="registration_number"
                        value={formData.registration_number}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                        placeholder="Reg No."
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                        placeholder="+1 234 567 890"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="clinic_name" className="block text-sm font-medium text-gray-700">Clinic Name</label>
                    <input
                        type="text"
                        id="clinic_name"
                        name="clinic_name"
                        value={formData.clinic_name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                        placeholder="Health First Clinic"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="clinic_address" className="block text-sm font-medium text-gray-700">Clinic Address</label>
                    <textarea
                        id="clinic_address"
                        name="clinic_address"
                        rows={3}
                        value={formData.clinic_address}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
                        placeholder="123 Wellness Ave, City, Country"
                    />
                </div>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Digital Signature</h3>

                {initialData?.signature_url && (
                    <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Current Signature:</p>
                        <img
                            src={initialData.signature_url}
                            alt="Current Signature"
                            className="h-24 object-contain bg-gray-50 border border-gray-200 rounded-md"
                        />
                    </div>
                )}

                <div>
                    <p className="text-sm text-gray-500 mb-2">Draw New Signature (This will replace the current one):</p>
                    <div className="border border-gray-300 rounded-md bg-white w-full max-w-md h-40">
                        <SignatureCanvas
                            ref={sigCanvas}
                            penColor="black"
                            canvasProps={{ className: 'w-full h-full rounded-md' }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={clearSignature}
                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Clear Signature
                    </button>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </form>
    )
}
