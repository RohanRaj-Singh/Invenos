import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X, User, Building2, Users, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { ContactType, ContactRole } from '@/types'

const ROLES: { value: ContactRole; label: string }[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'patient', label: 'Patient' },
]

export default function AddContactPage() {
  const navigate = useNavigate()
  const [type, setType] = useState<ContactType>('person')
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [cnic, setCnic] = useState('')
  const [address, setAddress] = useState('')
  const [roles, setRoles] = useState<ContactRole[]>([])
  const [openingBalance, setOpeningBalance] = useState('')
  const [balanceType, setBalanceType] = useState<'receivable' | 'payable'>('receivable')
  const [notes, setNotes] = useState('')

  const toggleRole = (role: ContactRole) => {
    setRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role])
  }

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error('Name and phone are required')
      return
    }
    toast.success(`Contact "${name}" created!`)
    navigate('/contacts')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Add Contact</h1>
          <p className="text-sm text-muted-foreground mt-1">Create a new person or organization contact.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/contacts')} className="gap-1.5">
            <X className="size-3.5" /> Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-1.5 shadow-sm">
            <Save className="size-3.5" /> Save Contact
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-5">
          {/* Contact Type */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Users className="size-4 text-primary" />
              <CardTitle>Contact Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <button onClick={() => setType('person')} className={cn('flex items-center gap-3 flex-1 p-4 rounded-xl border-2 transition-all', type === 'person' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30')}>
                  <User className={cn('size-5', type === 'person' ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="text-left"><div className="text-sm font-medium">Person</div><div className="text-xs text-muted-foreground">Patient, Customer, Doctor</div></div>
                </button>
                <button onClick={() => setType('organization')} className={cn('flex items-center gap-3 flex-1 p-4 rounded-xl border-2 transition-all', type === 'organization' ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30')}>
                  <Building2 className={cn('size-5', type === 'organization' ? 'text-primary' : 'text-muted-foreground')} />
                  <div className="text-left"><div className="text-sm font-medium">Organization</div><div className="text-xs text-muted-foreground">Supplier, Company</div></div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              {type === 'person' ? <User className="size-4 text-primary" /> : <Building2 className="size-4 text-primary" />}
              <CardTitle>{type === 'person' ? 'Personal Information' : 'Company Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {type === 'person' ? (
                <FormField label="Full Name" required>
                  <input type="text" placeholder="e.g. Muhammad Ali" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
                </FormField>
              ) : (
                <>
                  <FormField label="Company Name" required>
                    <input type="text" placeholder="e.g. ABC Pharma" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
                  </FormField>
                  <FormField label="Contact Person">
                    <input type="text" placeholder="e.g. Mr. Khalid Mehmood" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
                  </FormField>
                </>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Phone" required>
                  <input type="text" placeholder="e.g. 0300-1234567" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
                </FormField>
                <FormField label="Email">
                  <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
                </FormField>
              </div>
              {type === 'person' && (
                <FormField label="CNIC (Optional)">
                  <input type="text" placeholder="e.g. 35201-1234567-1" value={cnic} onChange={(e) => setCnic(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
                </FormField>
              )}
              <FormField label="Address">
                <input type="text" placeholder="Full address" value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" />
              </FormField>
            </CardContent>
          </Card>

          {/* Role Assignment */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Users className="size-4 text-primary" />
              <CardTitle>Role Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">A contact can have multiple roles. This determines how they appear across the system.</p>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map((role) => {
                  const isSelected = roles.includes(role.value)
                  return (
                    <button key={role.value} onClick={() => toggleRole(role.value)}
                      className={cn('p-3 rounded-xl border-2 text-left transition-all', isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30')}>
                      <div className={cn('text-xs font-medium', isSelected ? 'text-primary' : 'text-muted-foreground')}>{role.label}</div>
                      {isSelected && <div className="text-[10px] text-primary mt-0.5">✓ Selected</div>}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Financial */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <DollarSign className="size-4 text-primary" />
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Opening Balance (Rs.)">
                  <input type="number" placeholder="0" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30" min="0" />
                </FormField>
                <FormField label="Balance Type">
                  <div className="flex gap-2">
                    <button onClick={() => setBalanceType('receivable')} className={cn('flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                      balanceType === 'receivable' ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'border-border text-muted-foreground'
                    )}>Receivable</button>
                    <button onClick={() => setBalanceType('payable')} className={cn('flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                      balanceType === 'payable' ? 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'border-border text-muted-foreground'
                    )}>Payable</button>
                  </div>
                </FormField>
              </div>
              <FormField label="Notes">
                <textarea placeholder="Internal notes about this contact..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 resize-none" />
              </FormField>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-20 space-y-4">
            <Card size="sm">
              <CardHeader><CardTitle>Contact Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <SummaryRow label="Type" value={type === 'person' ? 'Person' : 'Organization'} />
                <SummaryRow label="Name" value={type === 'person' ? (name || '—') : (companyName || '—')} />
                <SummaryRow label="Phone" value={phone || '—'} />
                <SummaryRow label="Roles" value={roles.length > 0 ? roles.join(', ') : 'None selected'} />
                {openingBalance && <SummaryRow label="Opening Balance" value={`Rs. ${openingBalance} (${balanceType})`} />}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-foreground">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground text-right max-w-[60%] truncate">{value}</span>
    </div>
  )
}
