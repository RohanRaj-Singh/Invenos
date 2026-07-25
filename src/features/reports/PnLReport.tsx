import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { ReportLayout } from './components/ReportLayout'
import { ReportToolbar } from './components/ReportToolbar'
import { ReportFilterBar, useReportFilters } from './components/ReportFilters'
import { SummaryCards } from './components/SummaryCards'
import { ReportRow } from './components/ReportRow'
import { Card, CardContent } from '@/components/ui/card'
import { getProfitLoss } from '@/data/reports-data'
import { formatCurrency } from '@/data/dashboard'

export default function PnLReport() {
  const { filters, setFilters, setPreset } = useReportFilters()
  const data = useMemo(() => getProfitLoss({ from: filters.dateFrom, to: filters.dateTo }), [filters.dateFrom, filters.dateTo])

  return (
    <ReportLayout title="Profit & Loss" subtitle="Revenue, costs and profitability analysis" icon={<TrendingUp className="size-5 text-primary" />} toolbar={<ReportToolbar onPrint={() => window.print()} />}>
      <ReportFilterBar filters={filters} setFilters={setFilters} setPreset={setPreset} />
      <SummaryCards cards={[
        { label: 'Gross Revenue', value: formatCurrency(data.revenue), positive: true },
        { label: 'Sale Returns', value: formatCurrency(data.saleReturns), negative: data.saleReturns > 0 },
        { label: 'Net Revenue', value: formatCurrency(data.netRevenue), positive: data.netRevenue >= 0 },
        { label: 'Gross Profit', value: formatCurrency(data.grossProfit), positive: data.grossProfit >= 0, negative: data.grossProfit < 0 },
      ]} />
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <ReportRow label="Gross Revenue" value={formatCurrency(data.revenue)} />
            <ReportRow label="Sale Returns" value={formatCurrency(data.saleReturns)} negative />
            <div className="border-t border-border pt-2"><ReportRow label="Net Revenue" value={formatCurrency(data.netRevenue)} bold positive={data.netRevenue >= 0} /></div>
            <ReportRow label="Cost of Goods Sold" value={formatCurrency(data.cogs)} negative />
            <div className="border-t border-border pt-2"><ReportRow label="Gross Profit" value={formatCurrency(data.grossProfit)} bold positive={data.grossProfit >= 0} /></div>
            <ReportRow label="Operating Expenses" value={formatCurrency(data.totalExpenses)} negative />
            <div className="border-t-2 border-foreground pt-2"><ReportRow label="Net Profit / Loss" value={formatCurrency(data.netProfit)} bold positive={data.netProfit >= 0} negative={data.netProfit < 0} large /></div>
          </div>
        </CardContent>
      </Card>
    </ReportLayout>
  )
}
