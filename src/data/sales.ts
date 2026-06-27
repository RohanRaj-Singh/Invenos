import type { Sale, SaleSummary, Payment } from '@/types'
import {
  generatedSales,
  generatedSaleSummaries,
  generatedPayments,
  generatedPatients,
} from './generator'

export const allSales: Sale[] = generatedSales
export const saleSummaries: SaleSummary[] = generatedSaleSummaries
export const allPayments: Payment[] = generatedPayments

export function getSaleById(id: string): Sale | undefined {
  return allSales.find((s) => s.id === id)
}

export function getSalePayments(saleId: string): Payment[] {
  return allPayments.filter((p) => p.saleId === saleId)
}

export function getPatientSales(patientId: string): Sale[] {
  return allSales.filter((s) => s.patientId === patientId)
}

export function getPatientName(patientId: string): string {
  return generatedPatients.find((p) => p.id === patientId)?.name || 'Unknown Patient'
}
