import { createClient } from '@/utils/supabase/client'

export async function savePrescription(data: any) {
    const supabase = createClient()

    try {
        const {
            doctorId,
            patient,
            medicines,
            diagnosis,
            additionalNotes,
            suggestedLabTests
        } = data

        // Validation
        if (!patient.name?.trim()) {
            return { error: 'Patient Name is required.' }
        }
        if (!diagnosis?.trim() && (!medicines || medicines.length === 0 || !medicines[0].name.trim())) {
            return { error: 'At least one medicine or a diagnosis is required.' }
        }

        // 1. Patient UPSERT
        let patientId = patient.id
        if (patientId) {
            // Update existing
            const { error: patientErr } = await supabase
                .from('patients')
                .update({
                    name: patient.name,
                    custom_patient_id: patient.custom_patient_id,
                    age: patient.age ? parseInt(patient.age) : null,
                    gender: patient.gender,
                    contact: patient.contact,
                    updated_at: new Date().toISOString()
                })
                .eq('id', patientId)
                .eq('doctor_id', doctorId)

            if (patientErr) throw new Error('Failed to update patient information.')
        } else {
            // Insert new
            const { data: newPatient, error: patientErr } = await supabase
                .from('patients')
                .insert({
                    doctor_id: doctorId,
                    name: patient.name,
                    custom_patient_id: patient.custom_patient_id,
                    age: patient.age ? parseInt(patient.age) : null,
                    gender: patient.gender,
                    contact: patient.contact
                })
                .select('id')
                .single()

            if (patientErr || !newPatient) throw new Error('Failed to create patient record.')
            patientId = newPatient.id
        }

        // 2. Prescription INSERT
        const { data: prescription, error: rxErr } = await supabase
            .from('prescriptions')
            .insert({
                doctor_id: doctorId,
                patient_id: patientId,
                diagnosis,
                additional_notes: additionalNotes,
                suggested_lab_tests: suggestedLabTests
            })
            .select('id')
            .single()

        if (rxErr || !prescription) throw new Error('Failed to save prescription details.')

        // 3. Medicines INSERT and Global UPSERT
        const validMedicines = medicines.filter((m: any) => m.name?.trim() !== '')

        if (validMedicines.length > 0) {
            const itemsToInsert = validMedicines.map((m: any) => ({
                prescription_id: prescription.id,
                medicine_name: m.name,
                frequency: m.frequency,
                duration: m.duration
            }))

            const { error: itemsErr } = await supabase
                .from('prescription_items')
                .insert(itemsToInsert)

            if (itemsErr) throw new Error('Failed to save medicines list.')

            const globalMedicinesToInsert = validMedicines.map((m: any) => ({
                name: m.name
            }))

            const { error: globalErr } = await supabase
                .from('global_medicines')
                .upsert(globalMedicinesToInsert, { onConflict: 'name', ignoreDuplicates: true })

            if (globalErr) console.warn('Global medicines upsert error:', globalErr)
        }

        return { success: true }
    } catch (err: any) {
        console.error('Save Prescription Error:', err)
        return { error: err.message || 'An unexpected error occurred while saving.' }
    }
}
