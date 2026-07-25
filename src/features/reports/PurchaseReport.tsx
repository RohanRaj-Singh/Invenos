import { ShoppingBag } from 'lucide-react'
import { createTabularReport } from './TabularReportPage'
import { StatusBadge } from './components/StatusBadge'
import { getPurchaseReport, type PurchaseReportRow } from '@/data/reports-data'
import { formatCurrency } from '@/data/dashboard'

export default createTabularReport({
  title: 'Purchase Report',
  subtitle: 'All purchase transactions with summaries',
  icon: <ShoppingBag className="size-5 text-primary" />,
  getData: (range) => getPurchaseReport(range),
  columns: [
    { key: 'ref', header: 'Ref', render: (r: PurchaseReportRow) => <span className="font-medium">{r.ref}</span>, sortable: true, sortValue: (r) => r.ref },
    { key: 'date', header: 'Date', render: (r: PurchaseReportRow) => r.date, sortable: true },
    { key: 'supplier', header: 'Supplier', render: (r: PurchaseReportRow) => r.supplier, sortable: true },
    { key: 'items', header: 'Items', render: (r: PurchaseReportRow) => String(r.items), className: 'text-center' },
    { key: 'total', header: 'Total', render: (r: PurchaseReportRow) => formatCurrency(r.total), className: 'text-right font-semibold', sortable: true, sortValue: (r) => r.total },
    { key: 'paid', header: 'Paid', render: (r: PurchaseReportRow) => <span className="text-emerald-600">{formatCurrency(r.paid)}</span>, className: 'text-right', sortable: true, sortValue: (r) => r.paid },
    { key: 'status', header: 'Status', render: (r: PurchaseReportRow) => <StatusBadge status={r.status} /> },
  ],
  keyExtractor: (r) => r.id,
  summaryCards: (data) => {
    const totalVal = data.reduce((s, r) => s + r.total, 0)
    const totalPaid = data.reduce((s, r) => s + r.paid, 0)
    return [
      { label: 'Total Purchases', value: String(data.length) },
      { label: 'Total Value', value: formatCurrency(totalVal), negative: true },
      { label: 'Total Paid', value: formatCurrency(totalPaid) },
      { label: 'Avg Purchase', value: formatCurrency(data.length > 0 ? Math.round(totalVal / data.length) : 0) },
    ]
  },
  showPaymentMethod: true,
  searchable: true,
  searchPlaceholder: 'Search by ref or supplier...',
  onSearch: (data, q) => data.filter((r) => r.ref.toLowerCase().includes(q) || r.supplier.toLowerCase().includes(q)),
  emptyMessage: 'No purchases found in this date range.',
})
