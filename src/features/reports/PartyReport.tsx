import { useState, useMemo } from 'react'
import { Users } from 'lucide-react'
import { ReportLayout } from './components/ReportLayout'
import { ReportToolbar } from './components/ReportToolbar'
import { ReportFilterBar, useReportFilters } from './components/ReportFilters'
import { SummaryCards } from './components/SummaryCards'
import { ReportTable, type ColumnDef } from './components/ReportTable'
import { debitColumn, creditColumn } from './components/helpers'
import { getPartyStatement, type PartyTransactionRow } from '@/data/reports-data'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'

export default function PartyReport() {
  const [partyName, setPartyName] = useState('')
  const [partyType, setPartyType] = useState<'customer' | 'supplier'>('customer')
  const { filters, setFilters, setPreset } = useReportFilters()

  const dateRange = useMemo(() => ({ from: filters.dateFrom, to: filters.dateTo }), [filters.dateFrom, filters.dateTo])

  const rows = useMemo(() => {
    if (!partyName.trim()) return []
    return getPartyStatement(dateRange, partyName.trim(), partyType)
  }, [dateRange, partyName])

  const closingBalance = rows.length > 0 ? rows[rows.length - 1].balance : 0
  const totalDebit = rows.reduce((s, r) => s + r.debit, 0)
  const totalCredit = rows.reduce((s, r) => s + r.credit, 0)

  const columns: ColumnDef<PartyTransactionRow>[] = [
    { key: 'date', header: 'Date', render: (r) => r.date, sortable: true },
    { key: 'type', header: 'Type', render: (r) => <span className="font-medium">{r.type}</span>, sortable: true },
    { key: 'ref', header: 'Reference', render: (r) => <code className="text-[11px] font-mono bg-muted px-1 py-0.5 rounded">{r.ref}</code> },
    { key: 'description', header: 'Description', render: (r) => r.description },
    debitColumn<PartyTransactionRow>((r) => r.debit),
    creditColumn<PartyTransactionRow>((r) => r.credit),
    {
      key: 'balance', header: 'Balance', render: (r) => <span className={cn('font-semibold', r.balance >= 0 ? 'text-emerald-600' : 'text-red-600')}>{formatCurrency(r.balance)}</span>,
      className: 'text-right', sortable: true, sortValue: (r) => r.balance,
    },
  ]

  return (
    <ReportLayout title="Party Statement" subtitle="Customer and supplier transaction history with balances" icon={<Users className="size-5 text-primary" />} toolbar={<ReportToolbar onPrint={() => window.print()} />}>
      <ReportFilterBar filters={filters} setFilters={setFilters} setPreset={setPreset} />
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-lg border border-border p-0.5">
          <button onClick={() => setPartyType('customer')} className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', partyType === 'customer' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>Customer</button>
          <button onClick={() => setPartyType('supplier')} className={cn('px-3 py-1.5 text-xs font-medium rounded-md transition-colors', partyType === 'supplier' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>Supplier</button>
        </div>
        <input type="text" value={partyName} onChange={(e) => setPartyName(e.target.value)} placeholder={`Enter ${partyType} name...`} className="h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring w-64" />
        {partyName && <span className="text-xs text-muted-foreground">{rows.length} transactions</span>}
      </div>
      {partyName && rows.length > 0 && (
        <SummaryCards cards={[
          { label: 'Opening Balance', value: formatCurrency(0) },
          { label: 'Total Debit', value: formatCurrency(totalDebit), positive: totalDebit > 0 },
          { label: 'Total Credit', value: formatCurrency(totalCredit), negative: totalCredit > 0 },
          { label: 'Closing Balance', value: formatCurrency(closingBalance), positive: closingBalance >= 0, negative: closingBalance < 0 },
        ]} />
      )}
      {partyName ? (
        <ReportTable columns={columns} data={rows} keyExtractor={(r) => `${r.ref}-${r.type}`} pageSize={25} emptyMessage="No transactions found for this party in the selected date range." />
      ) : (
        <div className="text-center py-16 text-sm text-muted-foreground">Enter a customer or supplier name to view their statement.</div>
      )}
    </ReportLayout>
  )
}
