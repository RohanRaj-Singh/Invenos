import { cn } from '@/lib/utils'
import type { StockStatus } from '@/types'

const config: Record<StockStatus, { label: string; class: string }> = {
  'in-stock': {
    label: 'In Stock',
    class: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  },
  'low-stock': {
    label: 'Low Stock',
    class: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  },
  'out-of-stock': {
    label: 'Out of Stock',
    class: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-800',
  },
}

export default function StockBadge({ status, size = 'sm' }: { status: StockStatus; size?: 'sm' | 'xs' }) {
  const c = config[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-1.5 py-0 text-[10px]',
        c.class
      )}
    >
      <span
        className={cn(
          'rounded-full',
          size === 'sm' ? 'size-1.5' : 'size-1',
          status === 'in-stock' ? 'bg-emerald-500' : status === 'low-stock' ? 'bg-amber-500' : 'bg-red-500'
        )}
      />
      {c.label}
    </span>
  )
}
