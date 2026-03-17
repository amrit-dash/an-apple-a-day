import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#334155',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    clinicName: {
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
        color: '#4C8EAB',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    doctorName: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    doctorDetails: {
        fontSize: 9,
        color: '#64748b',
        marginBottom: 2,
    },
    divider: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#4C8EAB',
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#1e293b',
        marginTop: 20,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    patientGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    patientColumn: {
        width: '48%',
    },
    patientRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    label: {
        width: 60,
        fontFamily: 'Helvetica-Bold',
        color: '#1e293b',
    },
    value: {
        flex: 1,
        color: '#334155',
    },
    dateContainer: {
        alignItems: 'flex-end',
        marginBottom: 15,
    },
    dateText: {
        fontFamily: 'Helvetica-Bold',
        color: '#1e293b',
    },
    textBlock: {
        marginBottom: 5,
        lineHeight: 1.4,
    },
    table: {
        width: 'auto',
        marginTop: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderBottomWidth: 0,
        borderRightWidth: 0,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableHeaderRow: {
        backgroundColor: '#4C8EAB',
    },
    tableColHeader: {
        width: '33.33%',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#e2e8f0',
        padding: 6,
    },
    tableCol: {
        width: '33.33%',
        borderStyle: 'solid',
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#e2e8f0',
        padding: 6,
    },
    tableCellHeader: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        color: '#ffffff',
    },
    tableCell: {
        fontSize: 10,
        color: '#334155',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    signatureContainer: {
        alignItems: 'center',
        width: 150,
    },
    signatureImage: {
        width: 120,
        height: 40,
        objectFit: 'contain',
        marginBottom: 5,
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        width: '100%',
        marginBottom: 5,
    },
    signatureName: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        color: '#1e293b',
    },
});

export type PDFData = {
    doctor: any
    patient: any
    prescription: any
    medicines: any[]
}

export function PrescriptionPDF({ data }: { data: PDFData }) {
    const { doctor, patient, prescription, medicines } = data

    const formattedDate = new Date(prescription.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.clinicName}>{doctor.clinic_name || 'CLINIC NAME'}</Text>
                    <Text style={styles.doctorName}>Dr. {doctor.full_name}{doctor.degree ? `, ${doctor.degree}` : ''}</Text>
                    <Text style={styles.doctorDetails}>{doctor.clinic_address}</Text>
                    <Text style={styles.doctorDetails}>
                        Phone: {doctor.phone} | Registration Number: {doctor.registration_number}
                    </Text>
                </View>

                <View style={styles.divider} />

                {/* Patient Info */}
                <Text style={styles.sectionTitle}>PATIENT INFORMATION</Text>
                <View style={styles.patientGrid}>
                    <View style={styles.patientColumn}>
                        <View style={styles.patientRow}>
                            <Text style={styles.label}>Name:</Text>
                            <Text style={styles.value}>{patient.name}</Text>
                        </View>
                        <View style={styles.patientRow}>
                            <Text style={styles.label}>Age:</Text>
                            <Text style={styles.value}>{patient.age || 'N/A'}</Text>
                        </View>
                        <View style={styles.patientRow}>
                            <Text style={styles.label}>Contact:</Text>
                            <Text style={styles.value}>{patient.contact || 'N/A'}</Text>
                        </View>
                    </View>
                    <View style={styles.patientColumn}>
                        <View style={styles.patientRow}>
                            <Text style={styles.label}>ID:</Text>
                            <Text style={styles.value}>{patient.custom_patient_id || 'N/A'}</Text>
                        </View>
                        <View style={styles.patientRow}>
                            <Text style={styles.label}>Gender:</Text>
                            <Text style={styles.value}>{patient.gender}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.dateContainer}>
                    <Text style={styles.value}><Text style={styles.dateText}>Date:</Text> {formattedDate}</Text>
                </View>

                {/* Diagnosis */}
                {prescription.diagnosis && (
                    <View>
                        <Text style={styles.sectionTitle}>DIAGNOSIS</Text>
                        <Text style={styles.textBlock}>{prescription.diagnosis}</Text>
                        <View style={{ ...styles.divider, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0', marginVertical: 10 }} />
                    </View>
                )}

                {/* Medications Table */}
                {medicines && medicines.length > 0 && (
                    <View>
                        <Text style={styles.sectionTitle}>MEDICATIONS</Text>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeaderRow]}>
                                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Medicine</Text></View>
                                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Frequency</Text></View>
                                <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Duration</Text></View>
                            </View>
                            {medicines.map((med, i) => (
                                <View style={styles.tableRow} key={i}>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}>{med.medicine_name || med.name}</Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}>{med.frequency}</Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}>{med.duration}</Text></View>
                                </View>
                            ))}
                        </View>
                        <View style={{ ...styles.divider, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0', marginVertical: 15 }} />
                    </View>
                )}

                {/* Suggested Labs */}
                {prescription.suggested_lab_tests && (
                    <View>
                        <Text style={styles.sectionTitle}>SUGGESTED LAB TESTS / REPORTS</Text>
                        <Text style={styles.textBlock}>{prescription.suggested_lab_tests}</Text>
                        <View style={{ ...styles.divider, borderBottomWidth: 0.5, borderBottomColor: '#e2e8f0', marginVertical: 10 }} />
                    </View>
                )}

                {/* Notes */}
                {prescription.additional_notes && (
                    <View>
                        <Text style={styles.sectionTitle}>ADDITIONAL NOTES</Text>
                        <Text style={styles.textBlock}>{prescription.additional_notes}</Text>
                    </View>
                )}

                {/* Footer with Signature */}
                <View style={styles.footer}>
                    <View style={styles.signatureContainer}>
                        {doctor.signature_url && (
                            <Image style={styles.signatureImage} src={doctor.signature_url} />
                        )}
                        {!doctor.signature_url && <View style={{ height: 40 }} />}
                        <View style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: '#1e293b', marginBottom: 5 }} />
                        <Text style={{ fontFamily: 'Helvetica', fontSize: 9, color: '#64748b', marginBottom: 3 }}>Signature</Text>
                        <Text style={styles.signatureName}>Dr. {doctor.full_name}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
