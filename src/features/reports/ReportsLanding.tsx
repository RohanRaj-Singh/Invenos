import { useNavigate } from 'react-router-dom'
import { BarChart3, ShoppingCart, ShoppingBag, Package, Users, TrendingUp, BookOpen, Banknote, ClipboardList } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ReportCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
}

const CATEGORIES: { name: string; color: string; reports: ReportCard[] }[] = [
  {
    name: 'Financial Reports', color: 'text-emerald-600 dark:text-emerald-400',
    reports: [
      { id: 'daybook', title: 'Day Book', description: 'Complete daily transaction log with sales, purchases, returns and expenses', icon: <BookOpen className="size-5" />, href: '/reports/day-book', color: 'text-emerald-600' },
      { id: 'cashflow', title: 'Cash Flow', description: 'Cash inflows, outflows, opening and closing balances', icon: <Banknote className="size-5" />, href: '/reports/cash-flow', color: 'text-blue-600' },
      { id: 'pnl', title: 'Profit & Loss', description: 'Revenue, COGS, expenses and net profit calculation', icon: <TrendingUp className="size-5" />, href: '/reports/pnl', color: 'text-purple-600' },
      { id: 'balance-sheet', title: 'Balance Sheet', description: 'Assets, liabilities, capital and equity overview', icon: <ClipboardList className="size-5" />, href: '/reports/balance-sheet', color: 'text-indigo-600' },
    ],
  },
  {
    name: 'Sales Reports', color: 'text-blue-600 dark:text-blue-400',
    reports: [
      { id: 'sales', title: 'Sales Report', description: 'All sales transactions with totals and summaries', icon: <ShoppingCart className="size-5" />, href: '/reports/sales', color: 'text-blue-600' },
    ],
  },
  {
    name: 'Purchase Reports', color: 'text-amber-600 dark:text-amber-400',
    reports: [
      { id: 'purchases', title: 'Purchase Report', description: 'All purchase transactions with supplier details', icon: <ShoppingBag className="size-5" />, href: '/reports/purchases', color: 'text-amber-600' },
    ],
  },
  {
    name: 'Inventory Reports', color: 'text-sky-600 dark:text-sky-400',
    reports: [
      { id: 'stock', title: 'Stock Report', description: 'Current inventory levels, values and stock status', icon: <Package className="size-5" />, href: '/reports/stock', color: 'text-sky-600' },
    ],
  },
  {
    name: 'Party Reports', color: 'text-rose-600 dark:text-rose-400',
    reports: [
      { id: 'party', title: 'Party Statement', description: 'Customer and supplier statements with balances', icon: <Users className="size-5" />, href: '/reports/party', color: 'text-rose-600' },
    ],
  },
]

export default function ReportsLanding() {
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
          <BarChart3 className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Business intelligence and performance analysis</p>
        </div>
      </div>

      {/* Category sections */}
      {CATEGORIES.map((cat) => (
        <div key={cat.name}>
          <div className="flex items-center gap-2 mb-4">
            <div className={cn('text-xs font-semibold uppercase tracking-wider', cat.color)}>{cat.name}</div>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cat.reports.map((report) => (
              <button
                key={report.id}
                onClick={() => navigate(report.href)}
                className="w-full text-left group"
              >
                <Card size="sm" className="transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.99] h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0 bg-muted group-hover:bg-primary/10 transition-colors', report.color)}>
                        {report.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold">{report.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{report.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
