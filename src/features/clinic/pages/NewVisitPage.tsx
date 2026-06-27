import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, Search, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { mockPatients } from '@/data/clinic'
import { mockProducts } from '@/data/inventory'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import type { Product, CartItem } from '@/types'

const paymentOptions = [
  { id: 'full', label: 'Full Payment', desc: 'Pay entire amount now' },
  { id: 'partial', label: 'Partial Payment', desc: 'Pay part now, rest later' },
  { id: 'balance', label: 'Add To Balance', desc: 'No payment now' },
] as const

type PaymentOption = (typeof paymentOptions)[number]['id']

export default function NewVisitPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const patient = mockPatients.find((p) => p.id === id) || mockPatients[0]

  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [consultationFee, setConsultationFee] = useState('2000')
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full')
  const [medSearch, setMedSearch] = useState('')
  const [selectedMeds, setSelectedMeds] = useState<CartItem[]>([])

  const filteredProducts = useMemo(
    () => mockProducts.filter((p) => p.category === 'Medicine' && p.status !== 'out-of-stock' && (medSearch ? p.name.toLowerCase().includes(medSearch.toLowerCase()) || p.sku.toLowerCase().includes(medSearch.toLowerCase()) : true)),
    [medSearch]
  )

  const getMedicinePkg = (product: Product) => product.packaging.length
    ? product.packaging.reduce((a, b) => a.quantity < b.quantity ? a : b)
    : null

  const addMedicine = (product: Product) => {
    const pkg = getMedicinePkg(product)
    if (!pkg) return
    setSelectedMeds((prev) => {
      const existing = prev.find((m) => m.productId === product.id)
      if (existing) return prev.map((m) => m.productId === product.id
        ? { ...m, packagingQuantity: m.packagingQuantity + 1, baseQuantity: (m.packagingQuantity + 1) * pkg.quantity, total: (m.packagingQuantity + 1) * m.unitPrice }
        : m)
      return [...prev, { id: `med-${Date.now()}`, productId: product.id, name: product.name, packagingName: pkg.name, packagingQuantity: 1, baseUnitQuantity: pkg.quantity, baseQuantity: pkg.quantity, unitPrice: pkg.salePrice, total: pkg.salePrice, category: product.category }]
    })
  }

  const updateMedQty = (productId: string, delta: number) => {
    setSelectedMeds((prev) => prev.map((m) => {
      if (m.productId !== productId) return m
      const newQty = m.packagingQuantity + delta
      if (newQty <= 0) return null
      return { ...m, packagingQuantity: newQty, baseQuantity: newQty * m.baseUnitQuantity, total: newQty * m.unitPrice }
    }).filter(Boolean) as CartItem[])
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

    // Mock: would POST to API creating both Visit and Sale records
    console.log('=== New Visit + Sale Created ===', {
      patientId: patient.id, diagnosis, notes, consultationFee: consultationAmount,
      medicines: selectedMeds, grandTotal, amountPaid, outstanding, paymentOption,
    })
    toast.success(`Visit saved! Invoice created for ${formatCurrency(grandTotal)}`)
    navigate(`/clinic/patient/${patient.id}`)
  }

  return (
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

          {/* Add Medicines */}
          <Card>
            <CardHeader>
              <CardTitle>Add Medicines / Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input type="text" placeholder="Search medicines..." value={medSearch} onChange={(e) => setMedSearch(e.target.value)} className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring" />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredProducts.map((product) => {
                  const inCart = selectedMeds.find((m) => m.productId === product.id)
                  return (
                    <div key={product.id} className={cn('flex items-center justify-between px-3 py-2 rounded-lg transition-colors', inCart ? 'bg-primary/5' : 'hover:bg-muted/50')}>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(getMedicinePkg(product)?.salePrice || 0)} per {getMedicinePkg(product)?.name || product.baseUnit}</div>
                      </div>
                      {inCart ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => updateMedQty(product.id, -1)} className="flex items-center justify-center size-7 rounded-md bg-muted hover:bg-muted/80 text-foreground"><Minus className="size-3.5" /></button>
                          <span className="w-6 text-center text-sm font-semibold">{inCart.packagingQuantity}</span>
                          <button onClick={() => updateMedQty(product.id, 1)} className="flex items-center justify-center size-7 rounded-md bg-primary text-primary-foreground"><Plus className="size-3.5" /></button>
                        </div>
                      ) : (
                        <button onClick={() => addMedicine(product)} className="shrink-0 px-3 py-1.5 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground text-xs font-medium transition-colors">+ Add</button>
                      )}
                    </div>
                  )
                })}
                {filteredProducts.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No medicines found.</p>}
              </div>
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
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-sm font-semibold">Grand Total</span>
                  <span className="text-lg font-bold">{formatCurrency(grandTotal)}</span>
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
                    {paymentOption === opt.id && opt.id === 'partial' && <div className="text-xs font-semibold text-amber-600 mt-1">Pay {formatCurrency(Math.round(grandTotal * 0.4))} now, balance later</div>}
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
  )
}
