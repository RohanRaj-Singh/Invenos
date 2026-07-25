import { useNavigate } from 'react-router-dom'
import { Building2, ShoppingCart, Package, ShoppingBag, Receipt, Database, Info, Settings2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'business', label: 'Business Settings', desc: 'Business name, address, currency, and contact info', icon: Building2, href: '/settings/business', color: 'text-blue-600' },
  { id: 'pos', label: 'POS Settings', desc: 'Default customer, payment method, receipt size, and scan options', icon: ShoppingCart, href: '/settings/pos', color: 'text-emerald-600' },
  { id: 'inventory', label: 'Inventory Settings', desc: 'Stock thresholds, units, SKU generation, and valuation', icon: Package, href: '/settings/inventory', color: 'text-purple-600' },
  { id: 'sales', label: 'Sales Settings', desc: 'Invoice prefix, tax, discount, and sale behaviour', icon: ShoppingBag, href: '/settings/sales', color: 'text-amber-600' },
  { id: 'purchases', label: 'Purchase Settings', desc: 'Purchase prefix, cost price updates, supplier defaults', icon: ShoppingBag, href: '/settings/purchases', color: 'text-orange-600' },
  { id: 'receipt', label: 'Receipt Settings', desc: 'Receipt header, footer, logo, and paper size', icon: Receipt, href: '/settings/receipt', color: 'text-rose-600' },
  { id: 'backup', label: 'Backup & Restore', desc: 'Create and restore system backups', icon: Database, href: '/settings/backup', color: 'text-cyan-600' },
  { id: 'about', label: 'About System', desc: 'Version, tech stack, and system information', icon: Info, href: '/settings/about', color: 'text-slate-600' },
]

export default function SettingsDashboardPage() {
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
          <Settings2 className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your application preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) => {
          const Icon = s.icon
          return (
            <button key={s.id} onClick={() => navigate(s.href)} className="w-full text-left group">
              <Card size="sm" className="transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.99] h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0 bg-muted group-hover:bg-primary/10 transition-colors', s.color)}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold">{s.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
