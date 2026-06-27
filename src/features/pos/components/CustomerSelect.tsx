import { useState } from 'react'
import { ChevronDown, Check, User, Phone, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { posCustomers } from '@/data/pos'
import type { POSCustomer } from '@/types'

interface CustomerSelectProps {
  value: POSCustomer
  onChange: (c: POSCustomer) => void
}

export default function CustomerSelect({ value, onChange }: CustomerSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = posCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  )

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <User className="size-3.5" />
        <span className="max-w-[100px] truncate">{value.name}</span>
        <ChevronDown className="size-3" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-lg bg-muted text-xs outline-none"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map((customer) => {
                const isSelected = customer.id === value.id
                return (
                  <button
                    key={customer.id}
                    onClick={() => {
                      onChange(customer)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors',
                      isSelected
                        ? 'bg-primary/10 text-foreground'
                        : 'hover:bg-muted text-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center justify-center size-7 rounded-full shrink-0',
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <User className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{customer.name}</div>
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Phone className="size-2.5" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
