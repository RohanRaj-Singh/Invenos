import type { Patient, Visit, Treatment, Prescription, Payment, Sale, CartItem } from '@/types'
import {
  generatedPatients,
  generatedVisits,
  generatedTreatments,
  generatedPrescriptions,
} from './generator'
import { mockContacts } from './contacts'

// ─── Link patients to contacts ───
function linkPatientsToContacts() {
  const patientContacts = mockContacts.filter((c) => c.roles.includes('patient'))
  for (const patient of generatedPatients) {
    const match = patientContacts.find(
      (c) => c.name.toLowerCase().split(' ')[0] === patient.name.toLowerCase().split(' ')[0]
    )
    if (match) patient.contactId = match.id
  }
}
linkPatientsToContacts()

// ─── Mutable stores ───
export const mockPatients: Patient[] = [...generatedPatients]
export const mockPatient: Patient = mockPatients[0]
export const mockVisits: Visit[] = [...generatedVisits]
export const mockTreatments: Treatment[] = [...generatedTreatments]
export const mockPrescriptions: Prescription[] = [...generatedPrescriptions]

let nextVisitId = mockVisits.length + 1
let nextPrescriptionId = mockPrescriptions.length + 1
let nextPatientId = mockPatients.length + 1

export function getPatientVisits(patientId: string): Visit[] {
  return mockVisits.filter((v) => v.patientId === patientId)
}

export function getPatientTreatments(patientId: string): Treatment[] {
  return mockTreatments.filter((t) => t.patientId === patientId)
}

export function getPatientPrescriptions(patientId: string): Prescription[] {
  return mockPrescriptions.filter((p) => p.patientId === patientId)
}

export function getPatientPayments(patientId: string, allPayments: Payment[], sales: { id: string; patientId?: string; grandTotal: number; amountPaid: number }[]) {
  const patientSaleIds = new Set(
    sales.filter((s) => s.patientId === patientId).map((s) => s.id)
  )
  const payments = allPayments.filter((p) => patientSaleIds.has(p.saleId))
  const patientSales = sales.filter((s) => s.patientId === patientId)

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalOutstanding = patientSales.reduce((sum, s) => sum + (s.grandTotal - s.amountPaid), 0)
  const lastPayment = payments.length > 0 ? payments[0] : null

  return {
    totalPaid,
    totalOutstanding,
    outstanding: totalOutstanding,
    lastPaymentDate: lastPayment?.date || '—',
    totalPayments: payments.length,
  }
}

export function addPatient(data: {
  name: string; phone: string; address: string
  gender: 'male' | 'female'; age: number; bloodGroup?: string
}): Patient {
  const id = `p-${String(nextPatientId).padStart(3, '0')}`
  nextPatientId++
  const today = new Date().toISOString().split('T')[0]
  const patient: Patient = {
    id,
    name: data.name,
    phone: data.phone,
    address: data.address,
    gender: data.gender,
    age: data.age,
    bloodGroup: data.bloodGroup,
    registrationDate: today,
    lastVisit: '—',
  }

  // Also create a Contact for this patient (Clinic extends Contact)
  const contactId = `ct-${String(mockContacts.length + 1).padStart(3, '0')}`
  mockContacts.push({
    id: contactId,
    type: 'person',
    roles: ['patient', 'customer'],
    name: data.name,
    phone: data.phone,
    email: '',
    address: data.address,
    openingBalance: 0,
    balanceType: 'receivable',
    currentBalance: 0,
    createdAt: today,
    updatedAt: today,
    lastActivity: today,
  })
  patient.contactId = contactId

  mockPatients.unshift(patient)
  return patient
}

export function addVisit(data: {
  patient: Patient
  diagnosis: string
  notes: string
  consultationFee: number
  medicines: CartItem[]
  grandTotal: number
  amountPaid: number
  outstanding: number
  paymentOption: 'full' | 'partial' | 'balance'
  paymentMethod?: string
  saleId: string
}): Visit {
  const visitTypes = ['General Consultation', 'Follow-up', 'Medication Review', 'Annual Checkup', 'Vaccination', 'Lab Results Review', 'Specialist Referral']
  const id = `v-${String(nextVisitId).padStart(3, '0')}`
  nextVisitId++
  const today = new Date().toISOString().split('T')[0]
  const visit: Visit = {
    id,
    patientId: data.patient.id,
    visitDate: today,
    type: data.diagnosis ? 'General Consultation' : 'Follow-up',
    doctor: 'Dr. Ahmed',
    diagnosis: data.diagnosis,
    notes: data.notes,
    consultationFee: data.consultationFee,
    status: 'completed',
    saleId: data.saleId,
  }
  mockVisits.unshift(visit)

  // Update patient's last visit
  const patient = mockPatients.find((p) => p.id === data.patient.id)
  if (patient) {
    patient.lastVisit = today
  }

  return visit
}

export function addPrescription(data: {
  patientId: string
  medicine: string
  dosage: string
  frequency: string
  duration: string
  notes?: string
}): Prescription {
  const id = `rx-${String(nextPrescriptionId).padStart(3, '0')}`
  nextPrescriptionId++
  const rx: Prescription = {
    id,
    patientId: data.patientId,
    medicine: data.medicine,
    dosage: data.dosage,
    frequency: data.frequency,
    duration: data.duration,
    prescribedBy: 'Dr. Ahmed',
    date: new Date().toISOString().split('T')[0],
    notes: data.notes,
    refillable: data.duration === '90 days',
  }
  mockPrescriptions.unshift(rx)
  return rx
}
