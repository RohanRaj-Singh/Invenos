import { Banknote, ArrowDownLeft, ArrowUpRight, Receipt, RotateCcw, Pencil, FileX } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/data/dashboard'
import { LEDGER_TYPE_CONFIG } from '@/data/ledger'
import type { LedgerViewRow } from '@/data/ledger'

const iconMap: Record<string, LucideIcon> = {
  invoice: Receipt,
  payment: Banknote,
  advance: ArrowDownLeft,
  refund: ArrowUpRight,
  adjustment: Pencil,
  write_off: FileX,
  credit_note: RotateCcw,
}

interface LedgerViewProps {
  entries: LedgerViewRow[]
}

export default function LedgerView({ entries }: LedgerViewProps) {
  if (entries.length === 0) {
    return <div className="text-center py-12 text-sm text-muted-foreground">No ledger entries yet.</div>
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <Th className="w-24">Date</Th>
            <Th className="w-20">Type</Th>
            <Th>Reference</Th>
            <Th>Description</Th>
            <Th className="text-right w-28">Debit</Th>
            <Th className="text-right w-28">Credit</Th>
            <Th className="text-right w-28">Balance</Th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const cfg = LEDGER_TYPE_CONFIG[entry.type]
            const Icon = iconMap[entry.type] || Receipt
            return (
              <tr key={entry.id} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors text-sm">
                <td className="px-4 py-2.5 text-xs text-muted-foreground">{entry.date}</td>
                <td className="px-4 py-2.5">
                  <span className={cn('inline-flex items-center gap-1 text-xs font-medium', cfg?.color || 'text-muted-foreground')}>
                    <Icon className="size-3" />
                    {cfg?.label || entry.type}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{entry.reference}</td>
                <td className="px-4 py-2.5 text-muted-foreground max-w-[200px] truncate">{entry.description}</td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums">{entry.debit > 0 ? formatCurrency(entry.debit) : '—'}</td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums">{entry.credit > 0 ? formatCurrency(entry.credit) : '—'}</td>
                <td className={cn('px-4 py-2.5 text-right font-semibold tabular-nums', entry.runningBalance > 0 ? 'text-amber-600' : entry.runningBalance < 0 ? 'text-emerald-600' : '')}>
                  {formatCurrency(Math.abs(entry.runningBalance))}
                  {entry.runningBalance > 0 ? ' Dr' : entry.runningBalance < 0 ? ' Cr' : ''}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn('px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider', className)}>{children}</th>
}
