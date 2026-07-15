import { useState } from 'react'
import { ChevronDown, Check, User, Phone, Search, Plus, X, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { posCustomers } from '@/data/pos'
import type { POSCustomer } from '@/types'

const WALK_IN: POSCustomer = { id: 'cust-0', name: 'Walk-in Customer', phone: '' }

interface CustomerSelectProps {
  value: POSCustomer
  onChange: (c: POSCustomer) => void
}

export default function CustomerSelect({ value, onChange }: CustomerSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')

  const filtered = posCustomers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  const handleAddCustomer = () => {
    if (!newName.trim()) return
    const newCustomer: POSCustomer = { id: `cust-${Date.now()}`, name: newName.trim(), phone: newPhone.trim() }
    onChange(newCustomer)
    setNewName(''); setNewPhone(''); setShowAdd(false); setOpen(false)
  }

  const isWalkIn = value.id === 'cust-0'

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
        <User className="size-3.5" />
        <span className="max-w-[100px] truncate">{isWalkIn ? 'Walk-in' : value.name}</span>
        <ChevronDown className="size-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
            {showAdd ? (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">New Customer</span>
                  <button onClick={() => setShowAdd(false)} className="flex items-center justify-center size-6 rounded-md hover:bg-muted"><X className="size-3" /></button>
                </div>
                <input type="text" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-muted text-xs outline-none" autoFocus />
                <input type="text" placeholder="Phone (optional)" value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-muted text-xs outline-none" />
                <button onClick={handleAddCustomer} disabled={!newName.trim()}
                  className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50">Add & Select</button>
              </div>
            ) : (
              <>
                {/* Walk-in shortcut */}
                {!isWalkIn && (
                  <button onClick={() => { onChange(WALK_IN); setOpen(false) }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-left border-b border-border hover:bg-muted transition-colors">
                    <div className="flex items-center justify-center size-7 rounded-full bg-muted text-muted-foreground">
                      <LogOut className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-foreground">Walk-in Customer</div>
                      <div className="text-[10px] text-muted-foreground">Reset to anonymous sale</div>
                    </div>
                  </button>
                )}
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
                      className="w-full h-8 pl-8 pr-3 rounded-lg bg-muted text-xs outline-none" autoFocus />
                  </div>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {filtered.map((customer) => {
                    const isSelected = customer.id === value.id
                    return (
                      <button key={customer.id} onClick={() => { onChange(customer); setOpen(false); setSearch('') }}
                        className={cn('flex items-center gap-3 w-full px-3 py-2 text-left transition-colors', isSelected ? 'bg-primary/10 text-foreground' : 'hover:bg-muted text-foreground')}>
                        <div className={cn('flex items-center justify-center size-7 rounded-full shrink-0', isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                          <User className="size-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">{customer.name}</div>
                          {customer.phone && <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Phone className="size-2.5" />{customer.phone}</div>}
                        </div>
                        {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                      </button>
                    )
                  })}
                  {filtered.length === 0 && <div className="px-3 py-4 text-xs text-muted-foreground text-center">No customers found</div>}
                </div>
                <div className="border-t border-border p-1">
                  <button onClick={() => { setShowAdd(true); setSearch('') }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Plus className="size-3.5" /><span>Add new customer</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
