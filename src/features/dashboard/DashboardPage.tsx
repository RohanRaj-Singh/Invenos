import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  ShoppingBag,
  PackagePlus,
  Banknote,
  RotateCcw,
  DollarSign,
  TrendingUp,
  Wallet,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import StatsCard from './components/StatsCard'
import RecentActivity from './components/RecentActivity'
import LowStockSummary from './components/LowStockSummary'
import SalesTrendChart from './components/SalesTrendChart'
import { formatCurrency, getGreeting } from '@/data/dashboard'
import { allSales } from '@/data/sales'
import { purchaseBills } from '@/data/purchases'
import { allExpenses } from '@/data/expenses'
import { useApplication } from '@/features/transactions/TransactionContext'
import { useAuth } from '@/features/auth/AuthContext'
import { getBusinessSettings } from '@/data/settings'
import { cn } from '@/lib/utils'
import type { LiveStats } from '@/application/live-stats'

const QUICK_ACTIONS = [
  { id: 'new-sale', label: 'New Sale', desc: 'Start a POS transaction', icon: ShoppingCart, href: '/sales/pos', color: 'blue' },
  { id: 'new-purchase', label: 'New Purchase', desc: 'Record supplier order', icon: ShoppingBag, href: '/purchases/new', color: 'amber' },
  { id: 'add-product', label: 'Add Product', desc: 'Add to inventory', icon: PackagePlus, href: '/inventory/add', color: 'purple' },
  { id: 'payment-in', label: 'Payment In', desc: 'Receive payment', icon: Banknote, href: '/payments', color: 'green' },
  { id: 'add-expense', label: 'Add Expense', desc: 'Record expense', icon: Wallet, href: '/expenses/new', color: 'red' },
  { id: 'process-return', label: 'Process Return', desc: 'Sale or purchase return', icon: RotateCcw, href: '/sales/returns', color: 'orange' },
]

const ACTION_COLORS: Record<string, { bg: string; icon: string; hover: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', icon: 'text-blue-600 dark:text-blue-400', hover: 'hover:border-blue-200 dark:hover:border-blue-800' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-500/10', icon: 'text-amber-600 dark:text-amber-400', hover: 'hover:border-amber-200 dark:hover:border-amber-800' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', icon: 'text-purple-600 dark:text-purple-400', hover: 'hover:border-purple-200 dark:hover:border-purple-800' },
  green: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:border-emerald-200 dark:hover:border-emerald-800' },
  red: { bg: 'bg-red-50 dark:bg-red-500/10', icon: 'text-red-600 dark:text-red-400', hover: 'hover:border-red-200 dark:hover:border-red-800' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-500/10', icon: 'text-orange-600 dark:text-orange-400', hover: 'hover:border-orange-200 dark:hover:border-orange-800' },
}

type DateMode = 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'custom'

function getDateRange(mode: DateMode): { from: string; to: string } {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0]

  switch (mode) {
    case 'today': return { from: today, to: today }
    case 'yesterday': return { from: yesterday, to: yesterday }
    case 'last7': {
      const d = new Date(now.getTime() - 6 * 86400000)
      return { from: d.toISOString().split('T')[0], to: today }
    }
    case 'thisMonth': {
      const d = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: d.toISOString().split('T')[0], to: today }
    }
    case 'custom': return { from: today, to: today }
  }
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { liveStats } = useApplication()
  const auth = useAuth()
  const business = getBusinessSettings()
  const [stats, setStats] = useState<LiveStats>(liveStats.current)
  const [dateMode, setDateMode] = useState<DateMode>('today')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const dateRange = useMemo(() => {
    if (dateMode === 'custom') return { from: customFrom || new Date().toISOString().split('T')[0], to: customTo || new Date().toISOString().split('T')[0] }
    return getDateRange(dateMode)
  }, [dateMode, customFrom, customTo])

  useEffect(() => {
    const id = liveStats.subscribe(() => setStats(liveStats.current))
    return () => liveStats.unsubscribe(id)
  }, [liveStats])

  // Compute today's transaction counts
  const todayTx = useMemo(() => {
    const sales = allSales.filter((s) => s.date >= dateRange.from && s.date <= dateRange.to && !s.invoiceNumber.startsWith('RET-'))
    const returns = allSales.filter((s) => s.date >= dateRange.from && s.date <= dateRange.to && s.invoiceNumber.startsWith('RET-'))
    const purchases = purchaseBills.filter((b) => b.date >= dateRange.from && b.date <= dateRange.to && !b.invoiceRef.startsWith('PRET-'))
    const expenses = allExpenses.filter((e) => e.date >= dateRange.from && e.date <= dateRange.to)

    return {
      salesCount: sales.length,
      returnsCount: returns.length,
      purchasesCount: purchases.length,
      expensesCount: expenses.length,
      salesTotal: sales.reduce((s: number, x: any) => s + x.grandTotal, 0),
      returnsTotal: returns.reduce((s: number, x: any) => s + x.grandTotal, 0),
      purchasesTotal: purchases.reduce((s: number, x: any) => s + x.totalAmount, 0),
      expensesTotal: expenses.reduce((s: number, x: any) => s + x.amount, 0),
    }
  }, [dateRange])

  return (
    <div className="min-h-screen bg-muted/20 pb-8">
      {/* Header */}
      <div className="bg-background border-b border-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                {getGreeting()}, {auth.user?.name || business.businessName}
                <Sparkles className="size-4 text-amber-400" />
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <span className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full font-medium">
              <div className="size-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>

          {/* Date range selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['today', 'yesterday', 'last7', 'thisMonth', 'custom'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setDateMode(mode)}
                className={cn(
                  'text-[11px] font-medium px-3 py-1.5 rounded-lg border transition-colors',
                  dateMode === mode
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted-foreground border-border hover:text-foreground',
                )}
              >
                {mode === 'today' ? 'Today' : mode === 'yesterday' ? 'Yesterday' : mode === 'last7' ? '7 Days' : mode === 'thisMonth' ? 'Month' : 'Custom'}
              </button>
            ))}
            {dateMode === 'custom' && (
              <div className="flex items-center gap-1.5">
                <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-7 px-2 rounded border border-input bg-background text-[11px] outline-none" />
                <span className="text-[11px] text-muted-foreground">to</span>
                <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
                  className="h-7 px-2 rounded border border-input bg-background text-[11px] outline-none" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5 mt-5">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            const colors = ACTION_COLORS[action.color]
            return (
              <button
                key={action.id}
                onClick={() => navigate(action.href)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 sm:gap-2',
                  'p-3 sm:p-4 rounded-2xl border border-border transition-all active:scale-[0.97]',
                  'sm:hover:shadow-sm sm:hover:border-primary/20',
                  colors.hover,
                )}
                title={action.desc}
              >
                <div className={cn('flex items-center justify-center size-10 sm:size-12 rounded-xl', colors.bg, colors.icon)}>
                  <Icon className="size-5 sm:size-6" />
                </div>
                <span className="text-[11px] text-center font-medium text-foreground leading-tight">{action.label}</span>
              </button>
            )
          })}
        </div>

        {/* Today's Business KPIs */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Today's Business
            <span className="font-normal lowercase ml-1 text-muted-foreground/60">
              · {dateMode === 'today' ? 'Today' : dateRange.from === dateRange.to ? dateRange.from : `${dateRange.from} to ${dateRange.to}`}
            </span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatsCard label="Sales" value={formatCurrency(todayTx.salesTotal)} icon={<DollarSign className="size-4" />} trendLabel={`${todayTx.salesCount} transaction${todayTx.salesCount !== 1 ? 's' : ''}`} accentClass="text-blue-600" />
            <StatsCard label="Purchases" value={formatCurrency(todayTx.purchasesTotal)} icon={<ShoppingBag className="size-4" />} trendLabel={`${todayTx.purchasesCount} purchase${todayTx.purchasesCount !== 1 ? 's' : ''}`} accentClass="text-amber-600" />
            <StatsCard label="Returns" value={formatCurrency(todayTx.returnsTotal)} icon={<RotateCcw className="size-4" />} trendLabel={`${todayTx.returnsCount} return${todayTx.returnsCount !== 1 ? 's' : ''}`} accentClass="text-orange-600" />
            <StatsCard label="Expenses" value={formatCurrency(todayTx.expensesTotal)} icon={<Wallet className="size-4" />} trendLabel={`${todayTx.expensesCount} expense${todayTx.expensesCount !== 1 ? 's' : ''}`} accentClass="text-red-600" />
          </div>
        </div>

        {/* Business Overview */}
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Business Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card size="sm">
              <CardContent className="p-4">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Total Revenue</div>
                <div className="text-xl font-bold tracking-tight text-emerald-600">{formatCurrency(stats.todaySales)}</div>
                <div className="text-[11px] text-muted-foreground mt-1">Net of returns: {formatCurrency(stats.netSales)}</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="p-4">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Inventory Value</div>
                <div className="text-xl font-bold tracking-tight">{formatCurrency(stats.stockValue)}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{stats.lowStockItems} low stock item{stats.lowStockItems !== 1 ? 's' : ''}</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="p-4">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">Pending Payments</div>
                <div className="text-xl font-bold tracking-tight text-amber-600">{formatCurrency(stats.pendingPayments)}</div>
                <div className="text-[11px] text-muted-foreground mt-1">Outstanding receivables</div>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardContent className="p-4">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">This Month</div>
                <div className="text-xl font-bold tracking-tight">{formatCurrency(stats.thisMonthExpenses)}</div>
                <div className="text-[11px] text-muted-foreground mt-1">Expenses this month</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Low Stock + Recent Activity (side by side on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <LowStockSummary />
          <RecentActivity />
        </div>

        {/* Sales Trend */}
        <SalesTrendChart dateRange={dateRange} />
      </div>
    </div>
  )
}
