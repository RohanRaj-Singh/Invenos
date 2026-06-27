import {
  DollarSign,
  Clock,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import StatsCard from './components/StatsCard'
import QuickActions from './components/QuickActions'
import RecentActivity from './components/RecentActivity'
import { mockStats, formatCurrency, getGreeting } from '@/data/dashboard'

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
            {getGreeting()}, Dr. Ahmed
            <Sparkles className="size-5 text-amber-400" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening at your clinic today.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
          <div className="size-2 rounded-full bg-emerald-500" />
          <span>All systems online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          label="Today's Sales"
          value={formatCurrency(mockStats.todaySales)}
          icon={<DollarSign className="size-4" />}
          trend={mockStats.salesTrend}
          trendLabel="vs yesterday"
          accentClass="text-blue-600"
        />
        <StatsCard
          label="Pending Payments"
          value={formatCurrency(mockStats.pendingPayments)}
          icon={<Clock className="size-4" />}
          trend={mockStats.paymentsTrend}
          trendLabel="vs yesterday"
          accentClass="text-amber-600"
        />
        <StatsCard
          label="Stock Value"
          value={formatCurrency(mockStats.stockValue)}
          icon={<TrendingUp className="size-4" />}
          accentClass="text-emerald-600"
        />
        <StatsCard
          label="Low Stock Items"
          value={String(mockStats.lowStockItems)}
          icon={<AlertTriangle className="size-4" />}
          trendLabel="Items need reorder"
          accentClass="text-red-600"
        />
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
