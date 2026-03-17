'use client'

import { useState, useEffect } from 'react'
import { Calendar, User, Phone, X, FileDown } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { PrescriptionPDF } from '@/components/PrescriptionPDF'

type PrescriptionItem = {
    medicine_name: string
    frequency: string
    duration: string
}

type Prescription = {
    id: string
    diagnosis: string
    additional_notes: string
    suggested_lab_tests: string
    created_at: string
    prescription_items: PrescriptionItem[]
}

type Patient = {
    id: string
    name: string
    custom_patient_id: string
    age: number | null
    gender: string
    contact: string
    created_at: string
    prescriptions: Prescription[]
}

export function PatientsClient({ doctor, patients }: { doctor: any, patients: Patient[] }) {
    const [isClient, setIsClient] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const getLastVisitDate = (patient: Patient) => {
        if (!patient.prescriptions || patient.prescriptions.length === 0) return 'No visits'
        const sorted = [...patient.prescriptions].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        return formatDate(sorted[0].created_at)
    }

    return (
        <div>
            <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient Details</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID / Contact</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Visit Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {patients.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                                        No patients found. Create a new prescription to add patients.
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr
                                        key={patient.id}
                                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                                        onClick={() => setSelectedPatient(patient)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-slate-900">{patient.name}</div>
                                                    <div className="text-sm text-slate-500">{patient.age ? `${patient.age} yrs` : 'N/A'} • {patient.gender}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900">{patient.custom_patient_id || 'N/A'}</div>
                                            <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                                                <Phone className="w-3 h-3" />
                                                {patient.contact || 'No contact'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900 flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {getLastVisitDate(patient)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Patient Details Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-500" />
                                Patient Overview
                            </h3>
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto flex-1 p-6 space-y-8">
                            {/* Patient Info Card */}
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Name</p>
                                        <p className="font-medium text-slate-900">{selectedPatient.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Patient ID</p>
                                        <p className="font-medium text-slate-900">{selectedPatient.custom_patient_id || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Age / Gender</p>
                                        <p className="font-medium text-slate-900">
                                            {selectedPatient.age ? `${selectedPatient.age} yrs` : 'N/A'}, {selectedPatient.gender}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Contact</p>
                                        <p className="font-medium text-slate-900">{selectedPatient.contact || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Past Prescriptions */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-indigo-500" />
                                    Visit History & Prescriptions
                                </h4>

                                {selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedPatient.prescriptions
                                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                            .map((rx) => {
                                                const pdfData = {
                                                    doctor,
                                                    patient: selectedPatient,
                                                    prescription: rx,
                                                    medicines: rx.prescription_items || []
                                                }
                                                const fileNameDate = new Date(rx.created_at).toISOString().split('T')[0]
                                                const safePatientName = selectedPatient.name.replace(/\s+/g, '_')
                                                const fileName = `Prescription_${safePatientName}_${fileNameDate}.pdf`

                                                return (
                                                    <div key={rx.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-900">{formatDate(rx.created_at)}</p>
                                                            <p className="text-sm text-slate-500 mt-1 line-clamp-1">
                                                                <span className="font-medium text-slate-700">Diagnosis: </span>
                                                                {rx.diagnosis || 'No diagnosis recorded'}
                                                            </p>
                                                        </div>
                                                        {isClient && (
                                                            <PDFDownloadLink
                                                                document={<PrescriptionPDF data={pdfData} />}
                                                                fileName={fileName}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100 flex-shrink-0"
                                                            >
                                                                <FileDown className="w-4 h-4" />
                                                                Download PDF
                                                            </PDFDownloadLink>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-500 p-4 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
                                        No prescription history available.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50 flex justify-end">
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
