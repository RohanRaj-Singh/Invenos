import { Pill, Clock, CalendarDays, RefreshCw, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Prescription } from '@/types'

interface PrescriptionsListProps {
  prescriptions: Prescription[]
  onNewPrescription?: () => void
}

export default function PrescriptionsList({
  prescriptions,
}: PrescriptionsListProps) {
  return (
    <div className="space-y-3">
      {prescriptions.map((rx, idx) => {
        const colors = [
          'from-sky-500/20 to-blue-500/10 text-blue-600 dark:text-blue-400',
          'from-purple-500/20 to-violet-500/10 text-purple-600 dark:text-purple-400',
          'from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400',
          'from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400',
          'from-rose-500/20 to-pink-500/10 text-rose-600 dark:text-rose-400',
        ]
        const colorClass = colors[idx % colors.length]

        return (
          <Card key={rx.id} size="sm" className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex items-center justify-center size-10 rounded-xl bg-gradient-to-br shrink-0',
                        colorClass
                      )}
                    >
                      <Pill className="size-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-foreground">
                        {rx.medicine}
                      </h5>
                      <p className="text-xs text-muted-foreground">
                        {rx.prescribedBy} · {rx.date}
                      </p>
                    </div>
                  </div>
                  {rx.refillable && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-2 py-0 h-5 font-medium text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shrink-0"
                    >
                      <RefreshCw className="size-2.5 mr-1" />
                      Refillable
                    </Badge>
                  )}
                </div>

                {/* Dosage grid */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                      <Pill className="size-2.5" />
                      Dosage
                    </div>
                    <div className="text-xs font-medium text-foreground">
                      {rx.dosage}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                      <Clock className="size-2.5" />
                      Frequency
                    </div>
                    <div className="text-xs font-medium text-foreground">
                      {rx.frequency}
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/50 px-2.5 py-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                      <CalendarDays className="size-2.5" />
                      Duration
                    </div>
                    <div className="text-xs font-medium text-foreground">
                      {rx.duration}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {rx.notes && (
                  <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground pt-2 border-t border-border">
                    <FileText className="size-3 mt-0.5 shrink-0" />
                    <span>{rx.notes}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {prescriptions.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No prescriptions found.
        </div>
      )}
    </div>
  )
}
