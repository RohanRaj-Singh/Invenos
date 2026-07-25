import { formatCurrency } from '@/data/dashboard'
import type { ColumnDef } from './ReportTable'

/** Debit column — green, right-aligned, shows amount or "—" */
export function debitColumn<T>(getValue: (row: T) => number): ColumnDef<T> {
  return {
    key: 'debit',
    header: 'Debit',
    render: (r) => {
      const v = getValue(r)
      return <span className="text-emerald-600 font-semibold">{v > 0 ? formatCurrency(v) : '—'}</span>
    },
    className: 'text-right',
    sortable: true,
    sortValue: getValue,
  }
}

/** Credit column �� red, right-aligned, shows amount or "—" */
export function creditColumn<T>(getValue: (row: T) => number): ColumnDef<T> {
  return {
    key: 'credit',
    header: 'Credit',
    render: (r) => {
      const v = getValue(r)
      return <span className="text-red-600 font-semibold">{v > 0 ? formatCurrency(v) : '—'}</span>
    },
    className: 'text-right',
    sortable: true,
    sortValue: getValue,
  }
}

/** Reference column — monospace code styling */
export function referenceColumn<T>(getValue: (row: T) => string): ColumnDef<T> {
  return {
    key: 'ref',
    header: 'Reference',
    render: (r) => <code className="text-[11px] font-mono bg-muted px-1 py-0.5 rounded">{getValue(r)}</code>,
  }
}
