'use client'

import { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload } from 'lucide-react'

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
    const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw')
    const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState<string | null>(null)
    const [uploadedSignatureBlob, setUploadedSignatureBlob] = useState<Blob | null>(null)

    const sigCanvas = useRef<SignatureCanvas>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleClearSignature = () => {
        if (signatureMode === 'draw') {
            sigCanvas.current?.clear()
        } else {
            setUploadedSignatureUrl(null)
            setUploadedSignatureBlob(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const processImageToTransparent = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                if (!ctx) return reject('No context')

                ctx.drawImage(img, 0, 0)
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data

                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
                        data[i + 3] = 0 // set alpha to 0
                    }
                }
                ctx.putImageData(imageData, 0, 0)
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob)
                    else reject('Blob failed')
                }, 'image/png')
            }
            img.onerror = reject
            img.src = URL.createObjectURL(file)
        })
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const transparentBlob = await processImageToTransparent(file)
            setUploadedSignatureBlob(transparentBlob)
            setUploadedSignatureUrl(URL.createObjectURL(transparentBlob))
        } catch (error) {
            console.error("Failed to process image:", error)
            setMessage({ type: 'error', text: 'Failed to process signature image.' })
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage(null)

        try {
            let signature_url = initialData?.signature_url

            if (signatureMode === 'upload' && uploadedSignatureBlob) {
                const file = new File([uploadedSignatureBlob], `${userId}.png`, { type: 'image/png' })
                const { error: uploadError } = await supabase.storage
                    .from('signatures')
                    .upload(`${userId}.png`, file, { upsert: true, contentType: 'image/png' })
                if (uploadError) throw uploadError
                const { data: { publicUrl } } = supabase.storage.from('signatures').getPublicUrl(`${userId}.png`)
                signature_url = publicUrl
            } else if (signatureMode === 'draw' && sigCanvas.current && !sigCanvas.current.isEmpty()) {
                const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
                const blob = await (await fetch(signatureDataUrl)).blob()
                const file = new File([blob], `${userId}.png`, { type: 'image/png' })
                const { error: uploadError } = await supabase.storage
                    .from('signatures')
                    .upload(`${userId}.png`, file, { upsert: true, contentType: 'image/png' })
                if (uploadError) throw uploadError
                const { data: { publicUrl } } = supabase.storage.from('signatures').getPublicUrl(`${userId}.png`)
                signature_url = publicUrl
            }

            const parts = formData.full_name_degree.split(',')
            const full_name = parts[0]?.trim() || ''
            const degree = parts.slice(1).join(',').trim() || ''

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
        <form onSubmit={handleSave} className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 space-y-6">
            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    Doctor Information
                </h3>

                <div>
                    <label htmlFor="clinic_name" className="block text-sm font-medium text-slate-700">Clinic Name</label>
                    <input
                        type="text"
                        id="clinic_name"
                        name="clinic_name"
                        value={formData.clinic_name}
                        onChange={handleChange}
                        placeholder="e.g. City Care Hospital"
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 placeholder-slate-400"
                    />
                </div>

                <div>
                    <label htmlFor="full_name_degree" className="block text-sm font-medium text-slate-700">Doctor Name & Degree</label>
                    <input
                        type="text"
                        id="full_name_degree"
                        name="full_name_degree"
                        value={formData.full_name_degree}
                        onChange={handleChange}
                        placeholder="e.g. Dr. John Doe, MBBS"
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 placeholder-slate-400"
                    />
                </div>

                <div>
                    <label htmlFor="clinic_address" className="block text-sm font-medium text-slate-700">Clinic Address</label>
                    <textarea
                        id="clinic_address"
                        name="clinic_address"
                        rows={2}
                        value={formData.clinic_address}
                        onChange={handleChange}
                        placeholder="e.g. 123 Main St, City"
                        className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 placeholder-slate-400"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Contact Number</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 9876543210"
                            className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 placeholder-slate-400"
                        />
                    </div>
                    <div>
                        <label htmlFor="registration_number" className="block text-sm font-medium text-slate-700">Registration Number</label>
                        <input
                            type="text"
                            id="registration_number"
                            name="registration_number"
                            value={formData.registration_number}
                            onChange={handleChange}
                            placeholder="e.g. DMC123456"
                            className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 placeholder-slate-400"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-700">Signature</label>
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => setSignatureMode('draw')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${signatureMode === 'draw' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                Draw
                            </button>
                            <button
                                type="button"
                                onClick={() => setSignatureMode('upload')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${signatureMode === 'upload' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                Upload
                            </button>
                        </div>
                    </div>

                    <div className="border border-slate-300 rounded-lg bg-slate-50 overflow-hidden relative min-h-[160px] flex items-center justify-center">
                        {signatureMode === 'draw' ? (
                            <SignatureCanvas
                                ref={sigCanvas}
                                canvasProps={{ className: 'w-full h-40 cursor-crosshair absolute inset-0' }}
                                backgroundColor="transparent"
                            />
                        ) : (
                            <div className="w-full p-4 flex flex-col items-center justify-center text-center">
                                {uploadedSignatureUrl ? (
                                    <img src={uploadedSignatureUrl} alt="Processed Signature Preview" className="h-32 object-contain" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <div className="p-3 bg-white rounded-full shadow-sm border border-slate-200">
                                            <Upload className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <span className="text-sm text-slate-500 font-medium">Click to upload signature</span>
                                        <span className="text-xs text-slate-400">White background will be removed automatically</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-slate-500">
                            {signatureMode === 'draw' ? 'Draw your signature above' : 'Upload an image of your signature'}
                        </span>
                        {(signatureMode === 'draw' || (signatureMode === 'upload' && uploadedSignatureUrl)) && (
                            <button
                                type="button"
                                onClick={handleClearSignature}
                                className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                            >
                                Clear Signature
                            </button>
                        )}
                    </div>

                    {initialData?.signature_url && !uploadedSignatureUrl && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-slate-700 mb-2">Current Signature:</p>
                            <img src={initialData.signature_url} alt="Current Signature" className="h-16 border border-slate-200 rounded-lg bg-white p-2" />
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </form>
    )
}
