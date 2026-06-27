import {
  ShoppingCart,
  CreditCard,
  Stethoscope,
  Package,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockActivity, formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'

const activityConfig: Record<
  string,
  { icon: LucideIcon; bgClass: string; iconClass: string }
> = {
  sale: {
    icon: ShoppingCart,
    bgClass: 'bg-blue-50 dark:bg-blue-500/10',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  payment: {
    icon: CreditCard,
    bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
  },
  patient: {
    icon: Stethoscope,
    bgClass: 'bg-purple-50 dark:bg-purple-500/10',
    iconClass: 'text-purple-600 dark:text-purple-400',
  },
  purchase: {
    icon: Package,
    bgClass: 'bg-amber-50 dark:bg-amber-500/10',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
}

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <span className="text-xs text-muted-foreground">Today</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {mockActivity.map((event, idx) => {
            const config = activityConfig[event.type] || activityConfig.sale
            const Icon = config.icon
            const isLast = idx === mockActivity.length - 1

            return (
              <div key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-[17px] top-9 bottom-0 w-px bg-border" />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center size-9 rounded-full shrink-0',
                    config.bgClass,
                    config.iconClass
                  )}
                >
                  <Icon className="size-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      {event.amount && (
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(event.amount)}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {event.timeAgo}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
