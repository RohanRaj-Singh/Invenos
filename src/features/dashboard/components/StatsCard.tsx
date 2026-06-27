import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
  accentClass?: string
}

export default function StatsCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
  accentClass = 'text-primary',
}: StatsCardProps) {
  const isPositive = trend !== undefined && trend >= 0
  const isNegative = trend !== undefined && trend < 0

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </span>
            <div
              className={cn(
                'flex items-center justify-center size-9 rounded-lg shrink-0',
                accentClass.includes('text-')
                  ? accentClass.replace('text-', 'bg-') + '/10'
                  : 'bg-primary/10',
                accentClass
                  ? accentClass.replace('text-', '')
                  : 'text-primary'
              )}
            >
              {icon}
            </div>
          </div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          {(trend !== undefined || trendLabel) && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {trend !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-xs font-medium',
                    isPositive && 'text-emerald-600 dark:text-emerald-400',
                    isNegative && 'text-red-600 dark:text-red-400'
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
              {trendLabel && (
                <span className="text-xs text-muted-foreground">
                  {trendLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
