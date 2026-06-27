import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Search, Bell, Menu, Plus, ShoppingCart, Stethoscope, Package, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onToggleSidebar: () => void
  dark: boolean
  onToggleDark: () => void
}

const quickActions = [
  { label: 'New Sale', href: '/sales/pos', icon: ShoppingCart, color: 'text-blue-600' },
  { label: 'New Patient', href: '/clinic', icon: Stethoscope, color: 'text-purple-600' },
  { label: 'Add Product', href: '/inventory/add', icon: Package, color: 'text-emerald-600' },
  { label: 'Sales List', href: '/sales', icon: Receipt, color: 'text-amber-600' },
]

export default function Header({ onToggleSidebar, dark, onToggleDark }: HeaderProps) {
  const navigate = useNavigate()
  const [actionsOpen, setActionsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onToggleSidebar} aria-label="Toggle menu">
          <Menu className="size-5" />
        </Button>
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center justify-center size-7 rounded-md bg-primary text-primary-foreground">
            <span className="text-xs font-bold">I</span>
          </div>
          <span className="text-sm font-semibold">Invenos</span>
        </div>
      </div>

      {/* Center search */}
      <div className="hidden sm:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text" placeholder="Search anything..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/70">⌘K</kbd>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Desktop quick actions */}
        <div className="hidden md:flex items-center gap-1 mr-2">
          {quickActions.slice(0, 3).map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.href}
                variant="ghost"
                size="sm"
                onClick={() => navigate(action.href)}
                className="gap-1.5 text-xs h-8"
              >
                <Icon className="size-3.5" />
                <span className="hidden lg:inline">{action.label}</span>
              </Button>
            )
          })}
        </div>

        {/* Mobile/overflow quick actions dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActionsOpen(!actionsOpen)}
            aria-label="Quick actions"
            className="md:hidden"
          >
            <Plus className="size-5" />
          </Button>
          {actionsOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setActionsOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.href}
                      onClick={() => { navigate(action.href); setActionsOpen(false) }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                    >
                      <Icon className={cn('size-4', action.color)} />
                      <span>{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleDark} aria-label="Toggle dark mode">
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <div className="ml-2 size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs cursor-pointer">DA</div>
      </div>
    </header>
  )
}
