'use client'

import { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { useDashboardContext } from '@/components/AuthGuard'

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
    authProvider?: string
}

export function ProfileForm({ initialData, userId, authProvider }: ProfileFormProps) {
    const { refreshDoctorProfile } = useDashboardContext()
    const [formData, setFormData] = useState({
        clinic_name: initialData?.clinic_name || '',
        full_name: initialData?.full_name || '',
        degree: initialData?.degree || '',
        clinic_address: initialData?.clinic_address || '',
        phone: initialData?.phone || '',
        registration_number: initialData?.registration_number || '',
    })

    const [currentSignatureUrl, setCurrentSignatureUrl] = useState(initialData?.signature_url)

    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Signature UX States
    const [showSignatureEditor, setShowSignatureEditor] = useState(!initialData?.signature_url)
    const [signatureMode, setSignatureMode] = useState<'upload' | 'draw'>('upload')
    const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState<string | null>(null)
    const [uploadedSignatureBlob, setUploadedSignatureBlob] = useState<Blob | null>(null)

    // Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [password, setPassword] = useState('')
    const [isSavingPassword, setIsSavingPassword] = useState(false)

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

    const handleApplySignature = async () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
            const blob = await (await fetch(signatureDataUrl)).blob()
            setUploadedSignatureBlob(blob)
            setUploadedSignatureUrl(signatureDataUrl)
            setSignatureMode('upload')
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

            if (showSignatureEditor) {
                if (signatureMode === 'upload' && uploadedSignatureBlob) {
                    const file = new File([uploadedSignatureBlob], `${userId}.png`, { type: 'image/png' })
                    const { error: uploadError } = await supabase.storage
                        .from('signatures')
                        .upload(`${userId}.png`, file, { upsert: true, contentType: 'image/png' })
                    if (uploadError) throw uploadError
                    const { data: { publicUrl } } = supabase.storage.from('signatures').getPublicUrl(`${userId}.png`)
                    signature_url = `${publicUrl}?t=${Date.now()}`
                } else if (signatureMode === 'draw' && sigCanvas.current && !sigCanvas.current.isEmpty()) {
                    const signatureDataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
                    const blob = await (await fetch(signatureDataUrl)).blob()
                    const file = new File([blob], `${userId}.png`, { type: 'image/png' })
                    const { error: uploadError } = await supabase.storage
                        .from('signatures')
                        .upload(`${userId}.png`, file, { upsert: true, contentType: 'image/png' })
                    if (uploadError) throw uploadError
                    const { data: { publicUrl } } = supabase.storage.from('signatures').getPublicUrl(`${userId}.png`)
                    signature_url = `${publicUrl}?t=${Date.now()}`
                }
            }

            const { error: dbError } = await supabase
                .from('doctors')
                .upsert({
                    id: userId,
                    full_name: formData.full_name,
                    degree: formData.degree,
                    clinic_name: formData.clinic_name,
                    clinic_address: formData.clinic_address,
                    phone: formData.phone,
                    registration_number: formData.registration_number,
                    signature_url
                })

            if (dbError) throw dbError

            if (signature_url) {
                setCurrentSignatureUrl(signature_url)
            }

            toast.success('Profile saved successfully!')
            await refreshDoctorProfile()
            setUploadedSignatureUrl(null)
            setUploadedSignatureBlob(null)
            setShowSignatureEditor(false)
            router.refresh()
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || 'Failed to save profile')
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password) return

        setIsSavingPassword(true)

        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            toast.success('Password updated successfully!')
            setPassword('')
            setShowPasswordModal(false)
        } catch (err: any) {
            toast.error(err.message || 'Failed to update password')
        } finally {
            setIsSavingPassword(false)
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSave} className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#4C8EAB]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        Doctor Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">Doctor Name</label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="e.g. Dr. John Doe"
                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-[#4C8EAB] focus:ring-[#4C8EAB] sm:text-sm px-4 py-2 border text-[#1A202C] placeholder-slate-400"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="degree" className="block text-sm font-medium text-slate-700">Degree</label>
                            <input
                                type="text"
                                id="degree"
                                name="degree"
                                value={formData.degree}
                                onChange={handleChange}
                                placeholder="e.g. MBBS, MD"
                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-[#4C8EAB] focus:ring-[#4C8EAB] sm:text-sm px-4 py-2 border text-[#1A202C] placeholder-slate-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="clinic_name" className="block text-sm font-medium text-slate-700">Clinic Name</label>
                        <input
                            type="text"
                            id="clinic_name"
                            name="clinic_name"
                            value={formData.clinic_name}
                            onChange={handleChange}
                            placeholder="e.g. City Care Hospital"
                            className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-[#4C8EAB] focus:ring-[#4C8EAB] sm:text-sm px-4 py-2 border text-[#1A202C] placeholder-slate-400"
                            required
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
                            className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-[#4C8EAB] focus:ring-[#4C8EAB] sm:text-sm px-4 py-2 border text-[#1A202C] placeholder-slate-400"
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
                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-[#4C8EAB] focus:ring-[#4C8EAB] sm:text-sm px-4 py-2 border text-[#1A202C] placeholder-slate-400"
                                required
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
                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-[#4C8EAB] focus:ring-[#4C8EAB] sm:text-sm px-4 py-2 border text-[#1A202C] placeholder-slate-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Signature</label>

                        {!showSignatureEditor && currentSignatureUrl ? (
                            <div className="border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 space-y-4">
                                <img src={currentSignatureUrl} alt="Current Signature" className="h-20 object-contain" />
                                <button
                                    type="button"
                                    onClick={() => setShowSignatureEditor(true)}
                                    className="text-sm font-medium text-[#4C8EAB] hover:text-[#3A738F] border border-[#4C8EAB] px-4 py-2 rounded-lg transition-colors bg-white shadow-sm"
                                >
                                    Change Signature
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex bg-slate-100 rounded-lg p-1">
                                        <button
                                            type="button"
                                            onClick={() => setSignatureMode('upload')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${signatureMode === 'upload' ? 'bg-white text-[#4C8EAB] shadow-sm' : 'text-slate-600 hover:text-[#1A202C]'}`}
                                        >
                                            Upload
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSignatureMode('draw')}
                                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${signatureMode === 'draw' ? 'bg-white text-[#4C8EAB] shadow-sm' : 'text-slate-600 hover:text-[#1A202C]'}`}
                                        >
                                            Draw
                                        </button>
                                    </div>
                                    {currentSignatureUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setShowSignatureEditor(false)}
                                            className="text-sm text-slate-500 hover:text-slate-700"
                                        >
                                            Cancel
                                        </button>
                                    )}
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
                                                        <Upload className="w-5 h-5 text-[#4C8EAB]" />
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
                                    <div className="flex items-center gap-2">
                                        {signatureMode === 'draw' && (
                                            <button
                                                type="button"
                                                onClick={handleApplySignature}
                                                className="text-sm text-white bg-[#4C8EAB] hover:bg-[#3A738F] px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
                                            >
                                                Apply Signature
                                            </button>
                                        )}
                                        {(signatureMode === 'draw' || (signatureMode === 'upload' && uploadedSignatureUrl)) && (
                                            <button
                                                type="button"
                                                onClick={handleClearSignature}
                                                className="text-sm text-slate-500 hover:text-red-600 font-medium transition-colors px-2 py-1.5"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {currentSignatureUrl && !uploadedSignatureUrl && signatureMode === 'upload' && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-slate-700 mb-2">Current Signature:</p>
                                        <img src={currentSignatureUrl} alt="Current Signature" className="h-16 border border-slate-200 rounded-lg bg-white p-2" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                    {authProvider !== 'google' && (
                        <button
                            type="button"
                            onClick={() => setShowPasswordModal(true)}
                            className="inline-flex justify-center py-2.5 px-6 border border-slate-300 shadow-sm text-sm font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                        >
                            Change Password
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-[#4C8EAB] hover:bg-[#3A738F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4C8EAB] disabled:opacity-50 transition-colors"
                    >
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-semibold text-slate-800">Change Password</h3>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdatePassword} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="new_password" className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    id="new_password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-[#4C8EAB] focus:ring-[#4C8EAB] sm:text-sm px-4 py-2 border text-[#1A202C] placeholder-slate-400"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingPassword}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-[#1A202C] border border-transparent rounded-lg shadow-sm hover:bg-black focus:outline-none disabled:opacity-50 transition-colors"
                                >
                                    {isSavingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
