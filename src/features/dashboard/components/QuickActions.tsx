import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Package,
  Stethoscope,
  Banknote,
  ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockQuickActions } from '@/data/dashboard'
import { cn } from '@/lib/utils'

const actionIcons: Record<string, LucideIcon> = {
  ShoppingCart,
  Package,
  Stethoscope,
  Banknote,
}

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  amber:
    'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  purple:
    'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  green:
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
}

const hoverColorClasses: Record<string, string> = {
  blue: 'hover:border-blue-200 dark:hover:border-blue-800',
  amber: 'hover:border-amber-200 dark:hover:border-amber-800',
  purple: 'hover:border-purple-200 dark:hover:border-purple-800',
  green: 'hover:border-emerald-200 dark:hover:border-emerald-800',
}

export default function QuickActions() {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {mockQuickActions.map((action) => {
            const Icon = actionIcons[action.icon] || ShoppingCart
            return (
              <button
                key={action.id}
                onClick={() => navigate(action.href)}
                className={cn(
                  'group relative flex flex-col items-start gap-2.5 p-3.5 rounded-xl border border-border bg-background text-left transition-all',
                  hoverColorClasses[action.color] || 'hover:border-border'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center size-9 rounded-lg',
                    colorClasses[action.color] || 'bg-primary/10 text-primary'
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {action.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {action.description}
                  </div>
                </div>
                <ArrowRight className="size-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors absolute right-3 top-3" />
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
