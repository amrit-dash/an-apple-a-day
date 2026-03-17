'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, User, Activity, FileDown, RotateCcw, Stethoscope, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { savePrescription } from '@/app/actions/rx'
import { createClient } from '@/utils/supabase/client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { PrescriptionPDF } from '@/components/PrescriptionPDF'

type Patient = {
    id: string
    name: string
    custom_patient_id: string
    age: number | null
    gender: string
    contact: string
}

type Medicine = {
    name: string
    frequency: string
    duration: string
    isCustomFreq: boolean
    isCustomDur: boolean
}

export function RxForm({ doctor, initialPatients }: { doctor: any, initialPatients: Patient[] }) {
    const supabase = createClient()
    const [isClient, setIsClient] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [successData, setSuccessData] = useState<any | null>(null)

    // Patient State
    const [patient, setPatient] = useState<Partial<Patient>>({
        name: '', custom_patient_id: '', age: null, gender: 'Male', contact: ''
    })
    const [showPatientSuggestions, setShowPatientSuggestions] = useState(false)

    // Medicine State
    const [medicines, setMedicines] = useState<Medicine[]>([{ name: '', frequency: '', duration: '', isCustomFreq: false, isCustomDur: false }])
    const [medSuggestions, setMedSuggestions] = useState<string[]>([])
    const [activeMedIndex, setActiveMedIndex] = useState<number | null>(null)

    // Rx Details State
    const [diagnosis, setDiagnosis] = useState('')
    const [additionalNotes, setAdditionalNotes] = useState('')
    const [suggestedLabTests, setSuggestedLabTests] = useState('')

    useEffect(() => {
        setIsClient(true)
    }, [])

    const patientSuggestions = initialPatients.filter(p =>
        patient.name && p.name.toLowerCase().includes(patient.name.toLowerCase()) && p.name !== patient.name
    )

    const handlePatientSelect = (p: Patient) => {
        setPatient(p)
        setShowPatientSuggestions(false)
    }

    const addMedicineRow = () => {
        setMedicines([...medicines, { name: '', frequency: '', duration: '', isCustomFreq: false, isCustomDur: false }])
    }

    const removeMedicineRow = (index: number) => {
        if (medicines.length > 1) {
            setMedicines(medicines.filter((_, i) => i !== index))
        }
    }

    const updateMedicine = (index: number, field: keyof Medicine, value: string | boolean) => {
        const updated = [...medicines]

        if (field === 'frequency') {
            if (value === 'Custom') {
                updated[index].isCustomFreq = true
                updated[index].frequency = ''
            } else {
                updated[index].isCustomFreq = false
                updated[index].frequency = value as string
            }
        } else if (field === 'duration') {
            if (value === 'Custom') {
                updated[index].isCustomDur = true
                updated[index].duration = ''
            } else {
                updated[index].isCustomDur = false
                updated[index].duration = value as string
            }
        } else {
            updated[index] = { ...updated[index], [field]: value }
        }

        setMedicines(updated)

        if (field === 'name') {
            if ((value as string).length > 2) {
                searchGlobalMedicines(value as string)
                setActiveMedIndex(index)
            } else {
                setMedSuggestions([])
                setActiveMedIndex(null)
            }
        }
    }

    const handleCustomDurationChange = (index: number, value: string) => {
        const updated = [...medicines]
        updated[index].duration = value
        setMedicines(updated)
    }

    const searchGlobalMedicines = async (query: string) => {
        const { data } = await supabase
            .from('global_medicines')
            .select('name')
            .ilike('name', `%${query}%`)
            .limit(5)

        if (data) setMedSuggestions(data.map(d => d.name))
    }

    const selectMedSuggestion = (index: number, name: string) => {
        updateMedicine(index, 'name', name)
        setMedSuggestions([])
        setActiveMedIndex(null)
    }

    const handleSave = async () => {
        if (!patient.name?.trim()) {
            toast.error('Patient Name is required')
            return
        }

        setIsSubmitting(true)

        const processedMedicines = medicines.map(m => {
            let finalDuration = m.duration
            if (m.isCustomDur && m.duration.trim() !== '') {
                finalDuration = `${m.duration.trim()} days`
            }
            return {
                name: m.name,
                frequency: m.frequency,
                duration: finalDuration
            }
        })

        const result = await savePrescription({
            doctorId: doctor.id,
            patient,
            medicines: processedMedicines,
            diagnosis,
            additionalNotes,
            suggestedLabTests
        })

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Prescription saved successfully!')
            const rxDataForPdf = {
                doctor,
                patient,
                prescription: {
                    created_at: new Date().toISOString(),
                    diagnosis,
                    additional_notes: additionalNotes,
                    suggested_lab_tests: suggestedLabTests,
                },
                medicines: processedMedicines.filter(m => m.name.trim() !== '')
            }
            setSuccessData(rxDataForPdf)
        }
        setIsSubmitting(false)
    }

    const resetForm = () => {
        setSuccessData(null)
        setPatient({ name: '', custom_patient_id: '', age: null, gender: 'Male', contact: '' })
        setMedicines([{ name: '', frequency: '', duration: '', isCustomFreq: false, isCustomDur: false }])
        setDiagnosis('')
        setAdditionalNotes('')
        setSuggestedLabTests('')
    }

    if (successData) {
        const fileNameDate = new Date().toISOString().split('T')[0]
        const safePatientName = successData.patient.name.replace(/\s+/g, '_')
        const fileName = `Prescription_${safePatientName}_${fileNameDate}.pdf`

        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Prescription Saved Successfully</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">The prescription has been securely saved to your patient's record.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <button
                        onClick={resetForm}
                        className="flex items-center gap-2 px-6 py-2.5 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Create Another
                    </button>

                    {isClient && (
                        <PDFDownloadLink
                            document={<PrescriptionPDF data={successData} />}
                            fileName={fileName}
                            className="flex items-center gap-2 px-6 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors shadow-sm"
                        >
                            <FileDown className="w-4 h-4" />
                            Download PDF
                        </PDFDownloadLink>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Doctor Info Header */}
            <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4">
                <div className="p-3 bg-white border border-slate-200 text-indigo-500 rounded-full flex-shrink-0">
                    <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-0.5">Doctor Details</h3>
                    <p className="text-slate-900 font-semibold">{doctor.full_name}{doctor.degree ? `, ${doctor.degree}` : ''}</p>
                    <p className="text-slate-600 text-sm">{doctor.clinic_name}</p>
                </div>
            </div>

            {/* Patient Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 rounded-t-xl flex justify-between items-center">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <User className="w-5 h-5 text-indigo-500" />
                        Patient Information
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
                        <input
                            type="text"
                            value={patient.name || ''}
                            onChange={(e) => {
                                setPatient({ ...patient, name: e.target.value, id: undefined })
                                setShowPatientSuggestions(true)
                            }}
                            onFocus={() => setShowPatientSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowPatientSuggestions(false), 200)}
                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 placeholder-slate-400"
                            placeholder="e.g. John Doe"
                        />
                        {showPatientSuggestions && patientSuggestions.length > 0 && (
                            <ul className="absolute z-10 w-full bg-white mt-1 border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto text-sm">
                                {patientSuggestions.map(p => (
                                    <li
                                        key={p.id}
                                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"
                                        onClick={() => handlePatientSelect(p)}
                                    >
                                        {p.name} {p.contact ? `(${p.contact})` : ''}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                        <input
                            type="text"
                            value={patient.contact || ''}
                            onChange={(e) => setPatient({ ...patient, contact: e.target.value })}
                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 placeholder-slate-400"
                            placeholder="e.g. +1 234 567 8900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Patient ID (Optional)</label>
                        <input
                            type="text"
                            value={patient.custom_patient_id || ''}
                            onChange={(e) => setPatient({ ...patient, custom_patient_id: e.target.value })}
                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 placeholder-slate-400"
                            placeholder="e.g. PAT001"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                            <input
                                type="number"
                                value={patient.age || ''}
                                onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) || null })}
                                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 placeholder-slate-400"
                                placeholder="Years"
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                            <div className="relative">
                                <select
                                    value={patient.gender || 'Male'}
                                    onChange={(e) => setPatient({ ...patient, gender: e.target.value })}
                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 bg-white appearance-none pr-10"
                                >
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Prescription Details Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 rounded-t-xl flex justify-between items-center">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Prescription Details
                    </h3>
                    <button
                        onClick={addMedicineRow}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Medicine
                    </button>
                </div>
                <div className="p-6 space-y-6">

                    {/* Medicines */}
                    <div>
                        <div className="space-y-3">
                            {medicines.map((med, index) => (
                                <div key={index} className="flex flex-col md:flex-row gap-3 items-start relative bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                                    <div className="flex-1 w-full relative">
                                        <input
                                            type="text"
                                            value={med.name}
                                            onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                            onBlur={() => setTimeout(() => setActiveMedIndex(null), 200)}
                                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 placeholder-slate-400"
                                            placeholder="e.g. Paracetamol 500mg"
                                        />
                                        {activeMedIndex === index && medSuggestions.length > 0 && (
                                            <ul className="absolute z-10 w-full bg-white mt-1 border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto text-sm">
                                                {medSuggestions.map(s => (
                                                    <li
                                                        key={s}
                                                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-slate-700"
                                                        onClick={() => selectMedSuggestion(index, s)}
                                                    >
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="w-full md:w-48 relative">
                                        {med.isCustomFreq ? (
                                            <input
                                                type="text"
                                                value={med.frequency}
                                                onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                                                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 placeholder-slate-400"
                                                placeholder="Custom Frequency"
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="relative w-full">
                                                <select
                                                    value={med.frequency}
                                                    onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 bg-white appearance-none pr-8"
                                                >
                                                    <option value="">Frequency...</option>
                                                    <option value="Once daily">Once daily</option>
                                                    <option value="Twice daily">Twice daily</option>
                                                    <option value="Thrice daily">Thrice daily</option>
                                                    <option value="As needed">As needed</option>
                                                    <option value="Custom">Custom...</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                    <ChevronDown className="w-4 h-4" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full md:w-40 relative">
                                        {med.isCustomDur ? (
                                            <div className="relative w-full">
                                                <input
                                                    type="number"
                                                    value={med.duration}
                                                    onChange={(e) => handleCustomDurationChange(index, e.target.value)}
                                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-4 pr-12 py-2 border text-slate-900 placeholder-slate-400"
                                                    placeholder="e.g. 10"
                                                    autoFocus
                                                />
                                                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 text-sm pointer-events-none">
                                                    days
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="relative w-full">
                                                <select
                                                    value={med.duration}
                                                    onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-slate-900 bg-white appearance-none pr-8"
                                                >
                                                    <option value="">Duration...</option>
                                                    <option value="2 days">2 days</option>
                                                    <option value="3 days">3 days</option>
                                                    <option value="5 days">5 days</option>
                                                    <option value="7 days">7 days</option>
                                                    <option value="15 days">15 days</option>
                                                    <option value="1 month">1 month</option>
                                                    <option value="Custom">Custom...</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                    <ChevronDown className="w-4 h-4" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeMedicineRow(index)}
                                        className="p-2 mt-0.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                        <textarea
                            rows={2}
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 border text-slate-900 placeholder-slate-400"
                            placeholder="e.g. Viral Fever, Hypertension..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
                        <textarea
                            rows={2}
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 border text-slate-900 placeholder-slate-400"
                            placeholder="Any specific instructions for the patient..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Suggested Lab Tests / Reports</label>
                        <textarea
                            rows={2}
                            value={suggestedLabTests}
                            onChange={(e) => setSuggestedLabTests(e.target.value)}
                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3 border text-slate-900 placeholder-slate-400"
                            placeholder="e.g. CBC, Lipid Profile..."
                        />
                    </div>
                </div>
            </section>

            {/* Action Bar */}
            <div className="flex justify-end gap-4 pt-2">
                <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all hover:shadow-md"
                >
                    {isSubmitting ? 'Saving...' : 'Save Prescription'}
                </button>
            </div>
        </div>
    )
}
