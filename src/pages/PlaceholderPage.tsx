import { useLocation } from 'react-router-dom'
import {
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  BarChart3,
  Stethoscope,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const pageConfig: Record<
  string,
  { icon: LucideIcon; description: string; color: string }
> = {
  '/inventory': {
    icon: Package,
    description: 'Manage products, stock levels, and categories.',
    color: 'text-blue-600',
  },
  '/sales': {
    icon: ShoppingCart,
    description: 'Point of sale, orders, and transaction history.',
    color: 'text-emerald-600',
  },
  '/payments': {
    icon: CreditCard,
    description: 'Track payments, expenses, and reconciliations.',
    color: 'text-amber-600',
  },
  '/contacts': {
    icon: Users,
    description: 'Customers, suppliers, and contact management.',
    color: 'text-purple-600',
  },
  '/reports': {
    icon: BarChart3,
    description: 'Sales, inventory, and financial reports.',
    color: 'text-rose-600',
  },
  '/clinic': {
    icon: Stethoscope,
    description: 'Patient records, visits, and prescriptions.',
    color: 'text-sky-600',
  },
}

export default function PlaceholderPage() {
  const location = useLocation()
  const config = pageConfig[location.pathname]
  const Icon = config?.icon || Package
  const title =
    location.pathname === '/'
      ? 'Dashboard'
      : location.pathname
          .split('/')
          .filter(Boolean)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center text-center py-12 px-6">
            <div
              className={`flex items-center justify-center size-16 rounded-2xl bg-muted mb-4 ${config?.color || ''}`}
            >
              {Icon && <Icon className="size-8" />}
            </div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              {config?.description || 'Module coming soon.'}
            </p>
            <span className="inline-flex items-center gap-1.5 mt-6 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-amber-400" />
              Under development
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
