import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Building2, Phone, Mail, CreditCard, MapPin, ShoppingCart, Package, Banknote, Activity, ClipboardList, BookOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getContactById, getContactTransactions, getContactPayments } from '@/data/contacts'
import { mockPatients, getPatientVisits, getPatientTreatments } from '@/data/clinic'
import { formatCurrency } from '@/data/dashboard'
import { RoleBadgeList } from './components/RoleBadge'
import { cn } from '@/lib/utils'
import LedgerView from './components/LedgerView'
import RecordPaymentDialog from '@/features/payments/components/RecordPaymentDialog'
import { getLedgerView } from '@/data/ledger'

const tabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'ledger', label: 'Khata / Ledger', icon: BookOpen },
  { id: 'transactions', label: 'Transactions', icon: Activity },
  { id: 'payments', label: 'Payments', icon: CreditCard },
] as const

export default function ContactDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showPayment, setShowPayment] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const contact = getContactById(id || '')

  if (!contact) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 text-sm text-muted-foreground">
          <User className="size-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-1">Contact not found</h2>
          <Button variant="outline" onClick={() => navigate('/contacts')}>Back to Contacts</Button>
        </div>
      </div>
    )
  }

  const isPerson = contact.type === 'person'
  const ledgerEntries = useMemo(() => getLedgerView(contact.id), [refreshKey])
  const balance = contact.currentBalance
  const hasCredit = balance < 0
  const availableCredit = Math.max(0, -balance)

  const transactions = getContactTransactions(contact.id)
  const payments = getContactPayments(contact.id)
  const totalSales = transactions.filter((t) => t.type === 'sale').reduce((s, t) => s + t.amount, 0)
  const totalPurchases = transactions.filter((t) => t.type === 'purchase').reduce((s, t) => s + t.amount, 0)

  const hasPatientRole = contact.roles.includes('patient')
  const linkedPatient = hasPatientRole
    ? mockPatients.find((p) => p.contactId === contact.id) || mockPatients.find((p) => p.name.toLowerCase().includes(contact.name.split(' ')[0]?.toLowerCase() || ''))
    : null
  const visits = linkedPatient ? getPatientVisits(linkedPatient.id) : []
  const treatments = linkedPatient ? getPatientTreatments(linkedPatient.id) : []

  const allTabs = hasPatientRole
    ? [...tabs, { id: 'patient', label: 'Patient History', icon: ClipboardList }]
    : tabs

  const handlePaymentSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/contacts')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" /> <span>Back to contacts</span>
        </button>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => setShowPayment(true)}>
            <Plus className="size-3.5" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-20 sm:h-24 bg-gradient-to-r from-primary/80 to-primary/40" />
        <CardContent className="p-0">
          <div className="px-5 pb-5">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className={cn('size-16 sm:size-20 rounded-xl ring-4 ring-background flex items-center justify-center text-xl sm:text-2xl font-bold shadow-sm',
                isPerson ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
              )}>
                {isPerson ? <User className="size-7" /> : <Building2 className="size-7" />}
              </div>
              <div className="pt-2">
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{contact.name}</h2>
                {contact.companyName && <p className="text-sm text-muted-foreground">{contact.companyName}</p>}
                <div className="mt-1"><RoleBadgeList roles={contact.roles} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <InfoItem icon={Phone} label="Phone" value={contact.phone} />
              <InfoItem icon={Mail} label="Email" value={contact.email} />
              <InfoItem icon={MapPin} label="Address" value={contact.address} />
              <div className="flex items-center gap-2.5 text-sm">
                <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0"><Banknote className="size-3.5 text-muted-foreground" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">{hasCredit ? 'Available Credit' : 'Outstanding'}</div>
                  <div className={cn('font-semibold', hasCredit ? 'text-emerald-600' : 'text-amber-600')}>{formatCurrency(Math.abs(balance))}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0"><BookOpen className="size-3.5 text-muted-foreground" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">Ledger Entries</div>
                  <div className="font-semibold">{ledgerEntries.length}</div>
                </div>
              </div>
            </div>
            {contact.cnic && <div className="mt-2 text-xs text-muted-foreground">CNIC: {contact.cnic}</div>}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Sales" value={formatCurrency(totalSales)} />
        <StatCard label="Total Purchases" value={formatCurrency(totalPurchases)} />
        <StatCard label="Ledger Entries" value={ledgerEntries.length.toString()} />
        <StatCard label={hasCredit ? 'Credit Balance' : 'Outstanding'} value={formatCurrency(Math.abs(balance))} balance />
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex -mb-px overflow-x-auto scrollbar-none">
          {allTabs.map((tab) => {
            const Icon = tab.icon; const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors shrink-0 whitespace-nowrap',
                  isActive ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                )}>
                <Icon className="size-4" /> <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        {activeTab === 'overview' && (
          <div className="space-y-3">
            {transactions.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {transactions.slice(0, 5).map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 text-sm">
                      <div className="flex items-center gap-3">
                        <div className={cn('size-7 rounded-full flex items-center justify-center', txn.type === 'sale' ? 'bg-emerald-50 text-emerald-600' : txn.type === 'purchase' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600')}>
                          {txn.type === 'sale' ? <ShoppingCart className="size-3.5" /> : txn.type === 'purchase' ? <Package className="size-3.5" /> : <Banknote className="size-3.5" />}
                        </div>
                        <div><div className="text-xs font-medium capitalize">{txn.type.replace('_', ' ')}</div><div className="text-[11px] text-muted-foreground">{txn.date} · {txn.reference}</div></div>
                      </div>
                      <span className="text-xs font-semibold">{formatCurrency(txn.amount)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-3">
            {ledgerEntries.length === 0 && (
              <Card>
                <CardContent className="text-center py-12 text-sm text-muted-foreground">
                  <BookOpen className="size-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p>No ledger entries yet.</p>
                  <p className="text-xs mt-1">Record a payment or create a sale to see the ledger.</p>
                </CardContent>
              </Card>
            )}
            {ledgerEntries.length > 0 && <LedgerView entries={ledgerEntries} />}
          </div>
        )}

        {activeTab === 'transactions' && (
          <Card>
            <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">No transactions.</div>
              ) : (
                <div className="space-y-1">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn('size-8 rounded-lg flex items-center justify-center', txn.type === 'sale' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : txn.type === 'purchase' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10')}>
                          {txn.type === 'sale' ? <ShoppingCart className="size-4" /> : txn.type === 'purchase' ? <Package className="size-4" /> : <Banknote className="size-4" />}
                        </div>
                        <div><div className="text-sm font-medium text-foreground capitalize">{txn.type.replace('_', ' ')}</div><div className="text-xs text-muted-foreground">{txn.date} · {txn.reference} · {txn.description}</div></div>
                      </div>
                      <span className={cn('text-sm font-semibold', (txn.type === 'sale' || txn.type === 'payment_in') ? 'text-emerald-600' : 'text-red-600')}>
                        {(txn.type === 'sale' || txn.type === 'payment_in') ? '+' : '-'}{formatCurrency(txn.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'payments' && (
          <Card>
            <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">No payments recorded.</div>
              ) : (
                <div className="space-y-1">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn('size-8 rounded-lg flex items-center justify-center', p.direction === 'in' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/10')}>
                          <Banknote className="size-4" />
                        </div>
                        <div><div className="text-sm font-medium text-foreground capitalize">{p.direction === 'in' ? 'Payment Received' : 'Payment Sent'}</div><div className="text-xs text-muted-foreground">{p.date} · {p.reference} · {p.method}</div></div>
                      </div>
                      <span className={cn('text-sm font-semibold', p.direction === 'in' ? 'text-emerald-600' : 'text-red-600')}>{p.direction === 'in' ? '+' : '-'}{formatCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'patient' && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Recent Visits</CardTitle></CardHeader>
              <CardContent>
                {visits.length === 0 ? <div className="text-center py-6 text-sm text-muted-foreground">No visit records.</div> : (
                  <div className="space-y-2">
                    {visits.slice(0, 5).map((v) => (
                      <div key={v.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 text-sm">
                        <div><div className="font-medium">{v.type}</div><div className="text-xs text-muted-foreground">{v.visitDate} · {v.diagnosis}</div></div>
                        <span className="text-xs font-semibold">Rs. {v.consultationFee.toLocaleString()}</span>
                      </div>
                    ))}
                    {visits.length > 5 && <Button variant="link" size="sm" onClick={() => navigate(`/clinic/patient/${linkedPatient?.id}`)} className="text-xs">View all visits →</Button>}
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card><CardHeader><CardTitle>Treatments</CardTitle></CardHeader><CardContent>{treatments.length === 0 ? <p className="text-xs text-muted-foreground">No treatments.</p> : treatments.slice(0, 3).map((t) => <div key={t.id} className="text-sm mb-1"><span className="font-medium">{t.name}</span> <Badge variant="outline" className="text-[10px] ml-1">{t.status}</Badge></div>)}</CardContent></Card>
              <Card><CardHeader><CardTitle>Account Summary</CardTitle></CardHeader><CardContent><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Balance</span><span className={cn('font-semibold', balance > 0 ? 'text-amber-600' : 'text-emerald-600')}>{formatCurrency(Math.abs(balance))}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Credit Available</span><span className="font-semibold">{formatCurrency(availableCredit)}</span></div></div></CardContent></Card>
            </div>
          </div>
        )}
      </div>

      <RecordPaymentDialog open={showPayment} onClose={() => setShowPayment(false)} contact={contact} onSuccess={handlePaymentSuccess} />
    </div>
  )
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0"><Icon className="size-3.5 text-muted-foreground" /></div>
      <div className="min-w-0"><div className="text-xs text-muted-foreground">{label}</div><div className="font-medium truncate">{value}</div></div>
    </div>
  )
}

function StatCard({ label, value, balance }: { label: string; value: string; balance?: boolean }) {
  return (
    <Card size="sm">
      <CardContent className="p-4">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
        <div className={cn('text-lg font-bold tracking-tight', balance && 'text-amber-600')}>{value}</div>
      </CardContent>
    </Card>
  )
}
