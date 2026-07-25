import { ClipboardList } from 'lucide-react'
import { ReportLayout } from './components/ReportLayout'
import { ReportToolbar } from './components/ReportToolbar'
import { SummaryCards } from './components/SummaryCards'
import { ReportRow } from './components/ReportRow'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/data/dashboard'
import { mockProducts } from '@/data/inventory'
import { financialTransactions } from '@/data/financial-transactions'

export default function BalanceSheetReport() {
  const inventoryValue = mockProducts.reduce((s, p) => {
    const cost = p.purchaseConfig ? p.purchaseConfig.cost / (p.purchaseConfig.quantity || 1) : 0
    return s + p.stockQuantity * cost
  }, 0)

  const cashIn = financialTransactions.filter((t) => t.direction === 'in').reduce((s, t) => s + t.amount, 0)
  const cashOut = financialTransactions.filter((t) => t.direction === 'out').reduce((s, t) => s + t.amount, 0)
  const cashBalance = cashIn - cashOut

  const liabilities = Math.max(0, -Math.min(0, cashBalance)) * 0.3
  const capital = cashBalance + inventoryValue - liabilities
  const totalAssets = cashBalance + inventoryValue
  const totalLiabilitiesEquity = liabilities + capital

  return (
    <ReportLayout title="Balance Sheet" subtitle="Statement of financial position (prototype)" icon={<ClipboardList className="size-5 text-primary" />} toolbar={<ReportToolbar onPrint={() => window.print()} />}>
      <SummaryCards cards={[
        { label: 'Total Assets', value: formatCurrency(Math.round(totalAssets)), positive: true },
        { label: 'Total Liabilities', value: formatCurrency(Math.round(liabilities)), negative: true },
        { label: 'Capital', value: formatCurrency(Math.round(capital)), positive: true },
      ]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-2">Assets</h3>
            <ReportRow label="Cash & Bank" value={formatCurrency(Math.round(cashBalance))} />
            <ReportRow label="Inventory" value={formatCurrency(Math.round(inventoryValue))} />
            <ReportRow label="Accounts Receivable" value={formatCurrency(0)} />
            <div className="border-t border-border pt-2"><ReportRow label="Total Assets" value={formatCurrency(Math.round(totalAssets))} bold /></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-2">Liabilities & Equity</h3>
            <ReportRow label="Accounts Payable" value={formatCurrency(Math.round(liabilities))} />
            <ReportRow label="Short-term Debt" value={formatCurrency(0)} />
            <div className="border-t border-border pt-2"><ReportRow label="Total Liabilities" value={formatCurrency(Math.round(liabilities))} bold /></div>
            <ReportRow label="Owner's Capital" value={formatCurrency(Math.round(capital))} />
            <ReportRow label="Retained Earnings" value={formatCurrency(0)} />
            <div className="border-t border-border pt-2"><ReportRow label="Total Equity" value={formatCurrency(Math.round(capital))} bold /></div>
            <div className="border-t-2 border-foreground pt-2"><ReportRow label="Liabilities + Equity" value={formatCurrency(Math.round(totalLiabilitiesEquity))} bold /></div>
          </CardContent>
        </Card>
      </div>
    </ReportLayout>
  )
}
