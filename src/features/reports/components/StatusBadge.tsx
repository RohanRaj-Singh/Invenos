import { Badge } from '@/components/ui/badge'

const STATUS_STYLES: Record<string, string> = {
  paid: 'text-emerald-600 dark:text-emerald-400',
  partial: 'text-amber-600 dark:text-amber-400',
  unpaid: 'text-red-600 dark:text-red-400',
}

const BADGE_STYLES: Record<string, string> = {
  'in-stock': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400',
  'low-stock': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400',
  'out-of-stock': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400',
}

const BADGE_LABELS: Record<string, string> = {
  'in-stock': 'In Stock',
  'low-stock': 'Low',
  'out-of-stock': 'Out',
}

type StatusBadgeKind = 'payment' | 'stock'

interface StatusBadgeProps {
  status: string
  kind?: StatusBadgeKind
}

export function StatusBadge({ status, kind = 'payment' }: StatusBadgeProps) {
  if (kind === 'stock') {
    const cls = BADGE_STYLES[status]
    if (!cls) return <span>{status}</span>
    return <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${cls}`}>{BADGE_LABELS[status] || status}</Badge>
  }

  const cls = STATUS_STYLES[status]
  if (!cls) return <span className="text-xs font-medium">{status}</span>
  return <span className={`text-xs font-medium ${cls}`}>{status}</span>
}
