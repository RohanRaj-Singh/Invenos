import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  BarChart3,
  Stethoscope,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  Box,
  Wallet,
  Settings2,
  LogOut,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { modules } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthContext'

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  BarChart3,
  Stethoscope,
  ShoppingBag,
}

interface SidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const location = useLocation()
  const auth = useAuth()
  const ac = (module: Parameters<typeof auth.canModule>[0]) => auth.canModule(module)
  const [modulesOpen, setModulesOpen] = useState(false)
  const [salesOpen, setSalesOpen] = useState(false)
  const [purchasesOpen, setPurchasesOpen] = useState(false)
  const [expensesOpen, setExpensesOpen] = useState(false)
  const [reportsOpen, setReportsOpen] = useState(location.pathname.startsWith('/reports'))
  const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith('/settings'))

  const isModuleActive = modules.some((m) => location.pathname === m.href)

  return (
    <aside className={cn(
      mobile ? 'flex flex-col w-64' : 'hidden md:flex md:flex-col md:w-60 lg:w-64',
      'h-screen border-r border-border bg-sidebar shrink-0'
    )}>
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
          <Box className="size-4" />
        </div>
        <span className="text-base font-semibold tracking-tight">Invenos</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <NavLink to="/" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50')}>
          <LayoutDashboard className="size-4 shrink-0" />
          <span>Home</span>
        </NavLink>
        {/* Inventory */}
        {ac('inventory') && (
        <NavLink to="/inventory" onClick={onClose} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50')}>
          <Package className="size-4 shrink-0" />
          <span>Inventory</span>
        </NavLink>
        )}

        {/* Sales */}
        {ac('sales') && (<div>
          <button onClick={() => setSalesOpen(!salesOpen)} className={cn('flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors', salesOpen || location.pathname.startsWith('/sales') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50')}>
            <span className="flex items-center gap-3"><ShoppingCart className="size-4 shrink-0" /><span>Sales</span></span>
            {salesOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
          {salesOpen && (
            <div className="ml-4 space-y-0.5 pt-0.5">
              <NavLink to="/sales" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Sales List</NavLink>
              <NavLink to="/sales/pos" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Create Sale</NavLink>
              <NavLink to="/sales/returns" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Sale Returns</NavLink>
            </div>
          )}
        </div>
        )}

        {/* Purchases */}
        {ac('purchases') && (
        <div>
          <button onClick={() => setPurchasesOpen(!purchasesOpen)} className={cn('flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors', purchasesOpen || location.pathname.startsWith('/purchases') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50')}>
            <span className="flex items-center gap-3"><ShoppingBag className="size-4 shrink-0" /><span>Purchases</span></span>
            {purchasesOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
          {purchasesOpen && (
            <div className="ml-4 space-y-0.5 pt-0.5">
              <NavLink to="/purchases" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Purchase List</NavLink>
              <NavLink to="/purchases/new" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Create Purchase</NavLink>
              <NavLink to="/purchases/returns" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Purchase Returns</NavLink>
            </div>
          )}
        </div>
        )}

        <NavLink to="/payments" onClick={onClose} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50')}>
          <CreditCard className="size-4 shrink-0" />
          <span>Payments</span>
        </NavLink>

        {/* Expenses */}
        {ac('expenses') && (<div>
          <button onClick={() => setExpensesOpen(!expensesOpen)} className={cn('flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors', expensesOpen || location.pathname.startsWith('/expenses') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50')}>
            <span className="flex items-center gap-3"><Wallet className="size-4 shrink-0" /><span>Expenses</span></span>
            {expensesOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
          {expensesOpen && (
            <div className="ml-4 space-y-0.5 pt-0.5">
              <NavLink to="/expenses" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Expense List</NavLink>
              <NavLink to="/expenses/new" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Add Expense</NavLink>
              <NavLink to="/expenses/categories" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Expense Categories</NavLink>
            </div>
          )}
        </div>
        )}

        {/* Contacts — shown if customer or supplier permissions */}
        <NavLink to="/contacts" onClick={onClose} className={({ isActive }) => cn('flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50')}>
          <Users className="size-4 shrink-0" />
          <span>Contacts</span>
        </NavLink>

        {/* Reports */}
        {ac('reports') && (<div>
          <button onClick={() => setReportsOpen(!reportsOpen)} className={cn('flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors', reportsOpen || location.pathname.startsWith('/reports') ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50')}>
            <span className="flex items-center gap-3"><BarChart3 className="size-4 shrink-0" /><span>Reports</span></span>
            {reportsOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
          {reportsOpen && (
            <div className="ml-4 space-y-0.5 pt-0.5">
              <NavLink to="/reports" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Report Dashboard</NavLink>
              <NavLink to="/reports/day-book" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Day Book</NavLink>
              <NavLink to="/reports/cash-flow" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Cash Flow</NavLink>
              <NavLink to="/reports/pnl" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Profit & Loss</NavLink>
              <NavLink to="/reports/balance-sheet" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Balance Sheet</NavLink>
              <NavLink to="/reports/sales" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Sales Report</NavLink>
              <NavLink to="/reports/purchases" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Purchase Report</NavLink>
              <NavLink to="/reports/stock" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Stock Report</NavLink>
              <NavLink to="/reports/party" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Party Statement</NavLink>
            </div>
          )}
        </div>
        )}

        {/* Settings */}
        {ac('settings') && (
        <div>
          <button onClick={() => setSettingsOpen(!settingsOpen)} className={cn('flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors', settingsOpen ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50')}>
            <span className="flex items-center gap-3"><Settings2 className="size-4 shrink-0" /><span>Settings</span></span>
            {settingsOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </button>
          {settingsOpen && (
            <div className="ml-4 space-y-0.5 pt-0.5">
              <NavLink to="/settings" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>General</NavLink>
              <NavLink to="/settings/business" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Business</NavLink>
              <NavLink to="/settings/pos" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>POS</NavLink>
              <NavLink to="/settings/inventory" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Inventory</NavLink>
              <NavLink to="/settings/sales" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Sales</NavLink>
              <NavLink to="/settings/purchases" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Purchases</NavLink>
              <NavLink to="/settings/receipt" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Receipt</NavLink>
              {ac('settings') && <NavLink to="/settings/users" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Users & Permissions</NavLink>}
              <NavLink to="/settings/backup" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>Backup</NavLink>
              <NavLink to="/settings/about" end onClick={onClose} className={({ isActive }) => cn('flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30')}>About</NavLink>
            </div>
          )}
        </div>
        )}

        <div className="my-3 border-t border-border" />

        <button
          onClick={() => setModulesOpen(!modulesOpen)}
          className={cn(
            'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            modulesOpen || isModuleActive
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
          )}
        >
          <span className="flex items-center gap-3">
            <div className="size-4 shrink-0" />
            <span>Modules</span>
          </span>
          {modulesOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </button>

        {modulesOpen && (
          <div className="ml-2 space-y-0.5 pt-0.5">
            {modules.map((mod) => {
              const Icon = iconMap[mod.icon]
              const isActive = location.pathname === mod.href
              return (
                <NavLink
                  key={mod.href}
                  to={mod.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  {Icon && <Icon className="size-4 shrink-0" />}
                  <div className="flex flex-col">
                    <span>{mod.label}</span>
                    <span className="text-[11px] font-normal text-sidebar-foreground/50">{mod.description}</span>
                  </div>
                </NavLink>
              )
            })}
          </div>
        )}
      </nav>

      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg group">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
              {auth.user?.name?.charAt(0) || '?'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{auth.user?.name || 'Not logged in'}</span>
              <span className="text-xs text-muted-foreground capitalize">{auth.user?.role || ''}</span>
            </div>
          </div>
          <button
            onClick={() => { auth.logout() }}
            className="flex items-center justify-center size-7 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0"
            title="Logout"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}


