import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

export interface DateRange {
  from: string
  to: string
}

export type DatePreset = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'custom'

export function getDateRange(preset: DatePreset, customFrom?: string, customTo?: string): DateRange {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0]

  switch (preset) {
    case 'today': return { from: today, to: today }
    case 'yesterday': return { from: yesterday, to: yesterday }
    case 'last7': {
      const d = new Date(now.getTime() - 6 * 86400000)
      return { from: d.toISOString().split('T')[0], to: today }
    }
    case 'last30': {
      const d = new Date(now.getTime() - 29 * 86400000)
      return { from: d.toISOString().split('T')[0], to: today }
    }
    case 'thisMonth': {
      const d = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: d.toISOString().split('T')[0], to: today }
    }
    case 'custom': return { from: customFrom || today, to: customTo || today }
  }
}

export interface ReportFiltersState {
  datePreset: DatePreset
  dateFrom: string
  dateTo: string
  paymentMethod: string
}

export function useReportFilters() {
  const [filters, setFilters] = useState<ReportFiltersState>({
    datePreset: 'thisMonth',
    dateFrom: getDateRange('thisMonth').from,
    dateTo: getDateRange('thisMonth').to,
    paymentMethod: '',
  })

  const setPreset = (preset: DatePreset) => {
    const range = getDateRange(preset)
    setFilters((f) => ({ ...f, datePreset: preset, dateFrom: range.from, dateTo: range.to }))
  }

  const dateRange = useMemo(
    () => ({ from: filters.dateFrom, to: filters.dateTo }),
    [filters.dateFrom, filters.dateTo],
  )

  return { filters, setFilters, setPreset, dateRange }
}

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7', label: 'Last 7 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom' },
]

interface FilterBarProps {
  filters: ReportFiltersState
  setFilters: (f: ReportFiltersState) => void
  setPreset: (p: DatePreset) => void
  showPaymentMethod?: boolean
}

export function ReportFilterBar({
  filters, setFilters, setPreset, showPaymentMethod,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        {DATE_PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPreset(p.value)}
            className={cn(
              'text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors',
              filters.datePreset === p.value
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-muted-foreground border-border hover:text-foreground',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {filters.datePreset === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date" value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="h-9 px-2.5 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date" value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="h-9 px-2.5 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring"
          />
        </div>
      )}

      {showPaymentMethod && (
        <select
          value={filters.paymentMethod}
          onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
          className="h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring"
        >
          <option value="">All Methods</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="transfer">Bank Transfer</option>
          <option value="easypaisa">Easypaisa</option>
          <option value="jazzcash">JazzCash</option>
        </select>
      )}
    </div>
  )
}
