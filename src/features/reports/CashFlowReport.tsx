import { Banknote } from 'lucide-react'
import { createTabularReport } from './TabularReportPage'
import { debitColumn, creditColumn } from './components/helpers'
import { getCashFlow, type CashFlowRow } from '@/data/reports-data'
import { formatCurrency } from '@/data/dashboard'

export default createTabularReport({
  title: 'Cash Flow',
  subtitle: 'Cash inflows, outflows and balance summary',
  icon: <Banknote className="size-5 text-primary" />,
  getData: (range) => getCashFlow(range).rows,
  columns: [
    { key: 'date', header: 'Date', render: (r: CashFlowRow) => r.date, sortable: true },
    { key: 'type', header: 'Type', render: (r: CashFlowRow) => <span className="font-medium">{r.type}</span>, sortable: true },
    { key: 'description', header: 'Description', render: (r: CashFlowRow) => r.description },
    debitColumn<CashFlowRow>((r) => r.inflow),
    creditColumn<CashFlowRow>((r) => r.outflow),
  ],
  keyExtractor: (r) => `${r.date}-${r.type}-${r.description}`,
  summaryCards: (_data, range) => {
    const cf = getCashFlow(range)
    return [
      { label: 'Opening Balance', value: formatCurrency(cf.openingBalance), positive: cf.openingBalance >= 0, negative: cf.openingBalance < 0 },
      { label: 'Total Inflow', value: formatCurrency(cf.totalIn), positive: true },
      { label: 'Total Outflow', value: formatCurrency(cf.totalOut), negative: true },
      { label: 'Closing Balance', value: formatCurrency(cf.closingBalance), positive: cf.closingBalance >= 0, negative: cf.closingBalance < 0 },
    ]
  },
  emptyMessage: 'No cash movements in this date range.',
})
