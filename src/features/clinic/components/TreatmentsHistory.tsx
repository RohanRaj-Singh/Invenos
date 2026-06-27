import { Calendar, CheckCircle2, Clock, Activity, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Treatment } from '@/types'

const statusConfig = {
  ongoing: {
    label: 'Ongoing',
    class: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    icon: Activity,
  },
  completed: {
    label: 'Completed',
    class: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  planned: {
    label: 'Planned',
    class: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    icon: Clock,
  },
}

interface TreatmentsHistoryProps {
  treatments: Treatment[]
}

export default function TreatmentsHistory({ treatments }: TreatmentsHistoryProps) {
  return (
    <div className="space-y-3">
      {treatments.map((treatment) => {
        const config = statusConfig[treatment.status]
        const StatusIcon = config?.icon || Activity

        return (
          <Card key={treatment.id} size="sm" className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'flex items-center justify-center size-9 rounded-lg shrink-0',
                        config?.class?.split(' ').slice(0, 2).join(' ') || 'bg-muted text-muted-foreground'
                      )}
                    >
                      <StatusIcon className="size-4" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-foreground">
                        {treatment.name}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {treatment.doctor}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] px-2 py-0 h-5 font-medium shrink-0', config?.class || '')}
                  >
                    {config?.label || treatment.status}
                  </Badge>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {treatment.description}
                </p>

                {/* Dates + Progress */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {treatment.startDate}
                    </span>
                    {treatment.endDate && (
                      <>
                        <ArrowRight className="size-3" />
                        <span>{treatment.endDate}</span>
                      </>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-20 sm:w-24 h-1.5 rounded-full bg-muted overflow-hidden shrink-0">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          treatment.status === 'completed'
                            ? 'bg-emerald-500'
                            : treatment.status === 'ongoing'
                              ? 'bg-blue-500'
                              : 'bg-amber-400'
                        )}
                        style={{ width: `${treatment.progress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground shrink-0">
                      {treatment.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {treatments.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No treatment records found.
        </div>
      )}
    </div>
  )
}
