import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Stethoscope, Activity, Pill, CreditCard, Plus, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PatientHeader from './components/PatientHeader'
import VisitsTimeline from './components/VisitsTimeline'
import TreatmentsHistory from './components/TreatmentsHistory'
import PrescriptionsList from './components/PrescriptionsList'
import PaymentsOverview from './components/PaymentsOverview'
import { mockPatients, getPatientVisits, getPatientTreatments, getPatientPrescriptions } from '@/data/clinic'
import { allSales, allPayments, getPatientSales } from '@/data/sales'
import { cn } from '@/lib/utils'
import type { Sale } from '@/types'

const tabs = [
  { id: 'visits', label: 'Visits', icon: Stethoscope },
  { id: 'treatments', label: 'Treatments', icon: Activity },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
  { id: 'payments', label: 'Payments', icon: CreditCard },
] as const

type TabId = (typeof tabs)[number]['id']

export default function PatientProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabId>('visits')

  const patient = mockPatients.find((p) => p.id === id) || mockPatients[0]
  const visits = getPatientVisits(patient.id)
  const treatments = getPatientTreatments(patient.id)
  const prescriptions = getPatientPrescriptions(patient.id)

  // Resolve linked sales
  const patientSales = getPatientSales(patient.id)
  const salesMap = new Map<string, Sale>()
  patientSales.forEach((s) => salesMap.set(s.id, s))
  allSales.forEach((s) => {
    if (s.patientId === patient.id) salesMap.set(s.id, s)
  })

  // Patient payments = payments linked to patient's sales
  const patientSaleIds = new Set(patientSales.map((s) => s.id))
  const patientPayments = allPayments.filter((p) => patientSaleIds.has(p.saleId))
  const totalPaid = patientPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalOutstanding = patientSales.reduce((sum, s) => sum + s.outstandingBalance, 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/clinic')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to patients</span>
        </button>
        <Button
          onClick={() => navigate(`/clinic/patient/${patient.id}/visit`)}
          className="gap-1.5 h-9 shadow-sm"
        >
          <Plus className="size-4" />
          <span>New Visit</span>
        </Button>
      </div>

      <PatientHeader patient={patient} visitCount={visits.length} />

      <div className="border-b border-border">
        <div className="flex -mb-px overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors shrink-0 whitespace-nowrap',
                  isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                )}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
                {(tab.id === 'visits') && (
                  <span className="inline-flex items-center justify-center size-5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">{visits.length}</span>
                )}
                {tab.id === 'prescriptions' && (
                  <span className="inline-flex items-center justify-center size-5 rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">{prescriptions.length}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        {activeTab === 'visits' && <VisitsTimeline visits={visits} salesMap={salesMap} />}
        {activeTab === 'treatments' && <TreatmentsHistory treatments={treatments} />}
        {activeTab === 'prescriptions' && <PrescriptionsList prescriptions={prescriptions} />}
        {activeTab === 'payments' && (
          <PaymentsOverview
            payments={patientPayments}
            totalPaid={totalPaid}
            totalOutstanding={totalOutstanding}
          />
        )}
      </div>
    </div>
  )
}
