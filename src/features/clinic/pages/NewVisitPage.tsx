import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Save, Pill, Clock, CalendarDays, FileText, Package, Edit3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { mockPatients, addVisit, addPrescription } from '@/data/clinic'
import { allSales } from '@/data/sales'
import { formatCurrency } from '@/data/dashboard'
import { addTransaction } from '@/data/financial-transactions'
import { cn } from '@/lib/utils'
import AddMedicineDialog from '../components/AddMedicineDialog'
import type { MedicineEntry } from '../components/AddMedicineDialog'

const paymentOptions = [
  { id: 'full', label: 'Full Payment', desc: 'Pay entire amount now' },
  { id: 'partial', label: 'Partial Payment', desc: 'Pay part now, rest later' },
  { id: 'balance', label: 'Add To Balance', desc: 'No payment now' },
] as const

type PaymentOption = (typeof paymentOptions)[number]['id']

const paymentMethods = [
  { id: 'cash' as const, label: 'Cash' },
  { id: 'card' as const, label: 'Card' },
  { id: 'easypaisa' as const, label: 'Easypaisa' },
  { id: 'jazzcash' as const, label: 'JazzCash' },
  { id: 'transfer' as const, label: 'Bank Transfer' },
]

export default function NewVisitPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const patient = mockPatients.find((p) => p.id === id) || mockPatients[0]

  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [consultationFee, setConsultationFee] = useState('2000')
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full')
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [selectedMeds, setSelectedMeds] = useState<MedicineEntry[]>([])
  const [showMedDialog, setShowMedDialog] = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)

  // Completion state
  const [showCompletion, setShowCompletion] = useState(false)
  const [completionData, setCompletionData] = useState<{
    visitId: string; saleId: string; invoiceNumber: string
    grandTotal: number; amountPaid: number; outstanding: number
    paymentOption: PaymentOption; prescriptionCount: number
  } | null>(null)

  const handleAddMedicine = (entry: MedicineEntry) => {
    if (editingIdx !== null) {
      setSelectedMeds((prev) => prev.map((m, i) => i === editingIdx ? { ...entry, id: m.id } : m))
      setEditingIdx(null)
    } else {
      setSelectedMeds((prev) => [...prev, entry])
    }
  }

  const handleEditMedicine = (idx: number) => {
    setEditingIdx(idx)
    setShowMedDialog(true)
  }

  const handleRemoveMedicine = (idx: number) => {
    setSelectedMeds((prev) => prev.filter((_, i) => i !== idx))
  }

  const consultationAmount = parseInt(consultationFee) || 0
  const medTotal = selectedMeds.reduce((sum, m) => sum + m.total, 0)
  const grandTotal = consultationAmount + medTotal

  const handleSave = () => {
    if (!diagnosis.trim()) {
      toast.error('Please enter a diagnosis')
      return
    }

    const amountPaid = paymentOption === 'full' ? grandTotal : paymentOption === 'partial' ? Math.round(grandTotal * 0.4) : 0
    const outstanding = grandTotal - amountPaid
    const today = new Date().toISOString().split('T')[0]

    // 1. Create Sale record
    const saleIdx = allSales.length + 1
    const invoiceNum = `INV-${String(1000 + saleIdx)}`
    const sale = {
      id: `sal-${String(saleIdx).padStart(3, '0')}`,
      invoiceNumber: invoiceNum,
      source: 'clinic' as const,
      date: today,
      patientId: patient.contactId || patient.id,
      items: selectedMeds.map((m) => ({
        id: m.id, productId: m.productId, name: m.name,
        packagingName: m.packagingName, packagingQuantity: m.packagingQuantity,
        baseUnitQuantity: m.baseUnitQuantity, baseQuantity: m.baseQuantity,
        unitPrice: m.unitPrice, total: m.total, category: m.category,
      })),
      subtotal: grandTotal,
      discount: 0,
      grandTotal,
      amountPaid,
      outstandingBalance: outstanding,
      paymentStatus: (amountPaid === 0 ? 'unpaid' : amountPaid >= grandTotal ? 'paid' : 'partial') as 'paid' | 'partial' | 'unpaid',
      createdBy: 'Dr. Ahmed',
      customerName: undefined,
    }
    allSales.push(sale)

    // 2. Create Visit record (linked to Sale)
    const visit = addVisit({
      patient,
      diagnosis,
      notes,
      consultationFee: consultationAmount,
      medicines: selectedMeds,
      grandTotal,
      amountPaid,
      outstanding,
      paymentOption,
      saleId: sale.id,
    })

    // 3. Create Prescription records with dosage info
    let rxCount = 0
    for (const med of selectedMeds) {
      addPrescription({
        patientId: patient.id,
        medicine: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        duration: med.duration,
        notes: med.notes || undefined,
      })
      rxCount++
    }

    // 4. Create FinancialTransaction if payment collected
    if (amountPaid > 0 && patient.contactId) {
      addTransaction({
        contactId: patient.contactId,
        direction: 'in',
        type: 'collection',
        date: today,
        amount: amountPaid,
        method: paymentMethod as any,
        description: `Clinic visit payment — ${diagnosis}`,
        linkedSaleId: sale.id,
        createdBy: 'Dr. Ahmed',
      })
    }

    // 5. Show completion screen
    setCompletionData({
      visitId: visit.id,
      saleId: sale.id,
      invoiceNumber: invoiceNum,
      grandTotal,
      amountPaid,
      outstanding,
      paymentOption,
      prescriptionCount: rxCount,
    })
    setShowCompletion(true)
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(`/clinic/patient/${patient.id}`)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" />
            <span>Back to {patient.name}</span>
          </button>
        </div>

        {/* Patient summary */}
        <Card size="sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">{patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
            <div>
              <h2 className="text-sm font-semibold">{patient.name}</h2>
              <p className="text-xs text-muted-foreground">{patient.gender === 'male' ? 'Male' : 'Female'}, {patient.age} yrs · {patient.phone}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main form */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader><CardTitle>Visit Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Diagnosis <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="e.g. Seasonal allergies — mild rhinitis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Clinical Notes</label>
                  <textarea placeholder="Detailed observations, recommendations..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Consultation Fee (Rs.)</label>
                  <input type="number" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" min="0" />
                </div>
              </CardContent>
            </Card>

            {/* Add Medicines — button opens modal */}
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Prescription Items</CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setEditingIdx(null); setShowMedDialog(true) }}>
                  <Plus className="size-3.5" /> Add Medicine
                </Button>
              </CardHeader>
              <CardContent>
                {selectedMeds.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <Package className="size-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p>No medicines added yet.</p>
                    <p className="text-xs mt-1">Click "Add Medicine" to prescribe.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedMeds.map((med, idx) => (
                      <div key={med.id || idx} className="flex items-start gap-3 rounded-lg border border-border p-3 group hover:border-muted-foreground/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{med.name}</span>
                            <span className="text-xs text-muted-foreground">×{med.packagingQuantity} {med.packagingName}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                            <span className="text-[11px] inline-flex items-center gap-1 text-muted-foreground">
                              <Pill className="size-3" /> {med.dosage}
                            </span>
                            <span className="text-[11px] inline-flex items-center gap-1 text-muted-foreground">
                              <Clock className="size-3" /> {med.frequency}
                            </span>
                            <span className="text-[11px] inline-flex items-center gap-1 text-muted-foreground">
                              <CalendarDays className="size-3" /> {med.duration}
                            </span>
                            {med.notes && (
                              <span className="text-[11px] inline-flex items-center gap-1 text-muted-foreground">
                                <FileText className="size-3" /> {med.notes}
                              </span>
                            )}
                            <span className="text-xs font-medium text-foreground ml-auto">{formatCurrency(med.total)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditMedicine(idx)} className="flex items-center justify-center size-7 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground">
                            <Edit3 className="size-3" />
                          </button>
                          <button onClick={() => handleRemoveMedicine(idx)} className="flex items-center justify-center size-7 rounded-md bg-muted hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground hover:text-red-600">
                            <X className="size-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardHeader><CardTitle>Bill Summary</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Consultation Fee</span><span className="font-medium">{formatCurrency(consultationAmount)}</span></div>
                  {selectedMeds.map((m) => (
                    <div key={m.productId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-[60%]">{m.name} ×{m.packagingQuantity}</span>
                      <span className="font-medium">{formatCurrency(m.total)}</span>
                    </div>
                  ))}
                  {selectedMeds.length > 0 && (
                    <div className="pt-2 border-t border-border flex justify-between text-sm">
                      <span className="text-muted-foreground">Prescription Items</span>
                      <span className="font-medium">{selectedMeds.length}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="text-sm font-semibold">Grand Total</span>
                    <span className="text-lg font-bold">{formatCurrency(grandTotal)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment method */}
              <Card>
                <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((m) => (
                      <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                        className={cn('px-2 py-2 rounded-lg border-2 text-xs font-medium transition-all text-center', paymentMethod === m.id ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment options */}
              <Card>
                <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {paymentOptions.map((opt) => (
                    <button key={opt.id} onClick={() => setPaymentOption(opt.id)} className={cn('w-full text-left p-3 rounded-xl border-2 transition-all', paymentOption === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30')}>
                      <div className="text-sm font-medium text-foreground">{opt.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                      {paymentOption === opt.id && opt.id === 'full' && <div className="text-xs font-semibold text-emerald-600 mt-1">Pay {formatCurrency(grandTotal)} now</div>}
                      {paymentOption === opt.id && opt.id === 'partial' && (
                        <div className="text-xs font-semibold text-amber-600 mt-1">Pay {formatCurrency(Math.round(grandTotal * 0.4))} now, balance later</div>
                      )}
                      {paymentOption === opt.id && opt.id === 'balance' && <div className="text-xs font-semibold text-red-600 mt-1">No payment today — {formatCurrency(grandTotal)} to balance</div>}
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Button onClick={handleSave} size="lg" className="w-full h-11 gap-1.5 shadow-sm">
                <Save className="size-4" />
                Save Visit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Medicine Dialog */}
      <AddMedicineDialog
        open={showMedDialog}
        onClose={() => { setShowMedDialog(false); setEditingIdx(null) }}
        onAdd={handleAddMedicine}
        selectedIds={selectedMeds.map((m) => m.productId)}
        editEntry={editingIdx !== null ? selectedMeds[editingIdx] : null}
      />

      {/* Completion Dialog */}
      <Dialog open={showCompletion} onOpenChange={(v) => { if (!v) { setShowCompletion(false); navigate(`/clinic/patient/${patient.id}`) } }}>
        <DialogContent className="sm:max-w-md gap-0 p-0">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 text-center border-b border-border">
            <div className="inline-flex items-center justify-center size-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10 mb-3 ring-4 ring-emerald-500/10">
              <Package className="size-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-lg font-bold text-foreground">Visit Completed</div>
            <div className="text-xs text-muted-foreground mt-1">Patient: {patient.name}</div>
          </div>

          <div className="p-5 space-y-4">
            {/* Summary */}
            {completionData && (
              <div className="space-y-3">
                <div className="rounded-xl bg-muted/30 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Invoice</span>
                    <span className="font-medium">{completionData.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Grand Total</span>
                    <span className="font-semibold">{formatCurrency(completionData.grandTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className={cn('font-semibold', completionData.amountPaid > 0 ? 'text-emerald-600' : 'text-red-600')}>
                      {completionData.amountPaid > 0 ? formatCurrency(completionData.amountPaid) : '—'}
                    </span>
                  </div>
                  {completionData.outstanding > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Outstanding</span>
                      <span className="font-semibold text-amber-600">{formatCurrency(completionData.outstanding)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prescriptions</span>
                    <span className="font-medium">{completionData.prescriptionCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Status</span>
                    <Badge variant="outline" className={cn(
                      'text-[10px] px-2 py-0 h-5',
                      completionData.amountPaid >= completionData.grandTotal ? 'text-emerald-600 border-emerald-200 dark:border-emerald-800' : completionData.amountPaid > 0 ? 'text-amber-600 border-amber-200 dark:border-amber-800' : 'text-red-600 border-red-200 dark:border-red-800'
                    )}>
                      {completionData.amountPaid >= completionData.grandTotal ? 'Paid' : completionData.amountPaid > 0 ? 'Partial' : 'Unpaid'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Next actions */}
            <div className="space-y-2">
              <Button
                onClick={() => { setShowCompletion(false); navigate(`/sales/${completionData?.saleId}`) }}
                variant="outline"
                className="w-full h-10 gap-1.5"
              >
                View Sale
              </Button>
              <Button
                onClick={() => { setShowCompletion(false); navigate(`/clinic/patient/${patient.id}`) }}
                className="w-full h-10 gap-1.5 shadow-sm"
              >
                Return to Patient Timeline
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
