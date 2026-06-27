import type { Patient, Visit, Treatment, Prescription, Payment } from '@/types'
import {
  generatedPatients,
  generatedVisits,
  generatedTreatments,
  generatedPrescriptions,
} from './generator'

export const mockPatients: Patient[] = generatedPatients
export const mockPatient: Patient = mockPatients[0]
export const mockVisits: Visit[] = generatedVisits
export const mockTreatments: Treatment[] = generatedTreatments
export const mockPrescriptions: Prescription[] = generatedPrescriptions

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
