import { Package } from 'lucide-react'
import { createTabularReport } from './TabularReportPage'
import { StatusBadge } from './components/StatusBadge'
import { getStockReport, type StockReportRow } from '@/data/reports-data'
import { formatCurrency } from '@/data/dashboard'

export default createTabularReport({
  title: 'Stock Report',
  subtitle: 'Current inventory levels and valuation',
  icon: <Package className="size-5 text-primary" />,
  getData: () => getStockReport(),
  columns: [
    { key: 'name', header: 'Product', render: (r: StockReportRow) => <span className="font-medium">{r.name}</span>, sortable: true, sortValue: (r) => r.name },
    { key: 'sku', header: 'SKU', render: (r: StockReportRow) => <code className="text-[11px] font-mono bg-muted px-1 py-0.5 rounded">{r.sku}</code> },
    { key: 'category', header: 'Category', render: (r: StockReportRow) => r.category, sortable: true },
    { key: 'stock', header: 'Stock', render: (r: StockReportRow) => r.stock.toLocaleString(), className: 'text-right font-semibold', sortable: true, sortValue: (r) => r.stock },
    { key: 'threshold', header: 'Threshold', render: (r: StockReportRow) => r.threshold.toLocaleString(), className: 'text-right text-muted-foreground' },
    { key: 'status', header: 'Status', render: (r: StockReportRow) => <StatusBadge status={r.status} kind="stock" />, sortable: true, sortValue: (r) => r.status },
    { key: 'value', header: 'Value', render: (r: StockReportRow) => formatCurrency(r.value), className: 'text-right font-semibold', sortable: true, sortValue: (r) => r.value },
  ],
  keyExtractor: (r) => r.id,
  summaryCards: (data) => {
    const totalValue = data.reduce((s, r) => s + r.value, 0)
    const lowStockCount = data.filter((r) => r.status === 'low-stock').length
    const outOfStockCount = data.filter((r) => r.status === 'out-of-stock').length
    return [
      { label: 'Total Products', value: String(data.length) },
      { label: 'Inventory Value', value: formatCurrency(totalValue), positive: true },
      { label: 'Low Stock Items', value: String(lowStockCount), negative: lowStockCount > 0 },
      { label: 'Out of Stock', value: String(outOfStockCount), negative: outOfStockCount > 0 },
    ]
  },
  searchable: true,
  searchPlaceholder: 'Search by product name or SKU...',
  onSearch: (data, q) => data.filter((r) => r.name.toLowerCase().includes(q) || r.sku.toLowerCase().includes(q)),
  emptyMessage: 'No products found.',
})
