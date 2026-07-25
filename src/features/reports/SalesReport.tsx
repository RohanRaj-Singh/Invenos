import { ShoppingCart } from 'lucide-react'
import { createTabularReport } from './TabularReportPage'
import { StatusBadge } from './components/StatusBadge'
import { getSalesReport, type SalesReportRow } from '@/data/reports-data'
import { formatCurrency } from '@/data/dashboard'

export default createTabularReport({
  title: 'Sales Report',
  subtitle: 'All sales transactions with summaries',
  icon: <ShoppingCart className="size-5 text-primary" />,
  getData: (range) => getSalesReport(range),
  columns: [
    { key: 'invoice', header: 'Invoice', render: (r: SalesReportRow) => <span className="font-medium">{r.invoice}</span>, sortable: true, sortValue: (r) => r.invoice },
    { key: 'date', header: 'Date', render: (r: SalesReportRow) => r.date, sortable: true },
    { key: 'customer', header: 'Customer', render: (r: SalesReportRow) => r.customer, sortable: true },
    { key: 'items', header: 'Items', render: (r: SalesReportRow) => String(r.items), className: 'text-center' },
    { key: 'total', header: 'Total', render: (r: SalesReportRow) => formatCurrency(r.total), className: 'text-right font-semibold', sortable: true, sortValue: (r) => r.total },
    { key: 'paid', header: 'Paid', render: (r: SalesReportRow) => <span className="text-emerald-600">{formatCurrency(r.paid)}</span>, className: 'text-right', sortable: true, sortValue: (r) => r.paid },
    { key: 'status', header: 'Status', render: (r: SalesReportRow) => <StatusBadge status={r.status} /> },
  ],
  keyExtractor: (r) => r.id,
  summaryCards: (data) => {
    const totalRev = data.reduce((s, r) => s + r.total, 0)
    const totalPaid = data.reduce((s, r) => s + r.paid, 0)
    return [
      { label: 'Total Sales', value: String(data.length) },
      { label: 'Total Revenue', value: formatCurrency(totalRev), positive: true },
      { label: 'Total Collected', value: formatCurrency(totalPaid), positive: true },
      { label: 'Avg Sale', value: formatCurrency(data.length > 0 ? Math.round(totalRev / data.length) : 0) },
    ]
  },
  showPaymentMethod: true,
  searchable: true,
  searchPlaceholder: 'Search by invoice or customer...',
  onSearch: (data, q) => data.filter((r) => r.invoice.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q)),
  emptyMessage: 'No sales found in this date range.',
})
