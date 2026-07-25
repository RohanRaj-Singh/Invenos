import { BookOpen } from 'lucide-react'
import { createTabularReport } from './TabularReportPage'
import { debitColumn, creditColumn } from './components/helpers'
import { getDayBook, type DayBookRow } from '@/data/reports-data'
import { formatCurrency } from '@/data/dashboard'

const columns = [
  { key: 'date', header: 'Date', render: (r: DayBookRow) => r.date, sortable: true },
  { key: 'type', header: 'Type', render: (r: DayBookRow) => <span className="font-medium">{r.type}</span>, sortable: true },
  { key: 'description', header: 'Description', render: (r: DayBookRow) => r.description },
  { key: 'ref', header: 'Reference', render: (r: DayBookRow) => <code className="text-[11px] font-mono bg-muted px-1 py-0.5 rounded">{r.ref}</code> },
  debitColumn<DayBookRow>((r) => r.debit),
  creditColumn<DayBookRow>((r) => r.credit),
]

export default createTabularReport({
  title: 'Day Book',
  subtitle: 'Complete daily transaction log',
  icon: <BookOpen className="size-5 text-primary" />,
  getData: (range) => getDayBook(range).rows,
  columns,
  keyExtractor: (r) => `${r.ref}-${r.type}`,
  summaryCards: (data) => {
    const totalDebit = data.reduce((s, r) => s + r.debit, 0)
    const totalCredit = data.reduce((s, r) => s + r.credit, 0)
    return [
      { label: 'Total Debit', value: formatCurrency(totalDebit), positive: true },
      { label: 'Total Credit', value: formatCurrency(totalCredit), negative: true },
      { label: 'Net Difference', value: formatCurrency(Math.abs(totalDebit - totalCredit)), subtitle: totalDebit >= totalCredit ? 'Debit exceeds Credit' : 'Credit exceeds Debit' },
      { label: 'Transactions', value: String(data.length) },
    ]
  },
  emptyMessage: 'No transactions in this date range.',
})
