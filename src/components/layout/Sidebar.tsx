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
  ChevronDown,
  ChevronRight,
  Box,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { sidebarNav, modules } from '@/data/dashboard'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  BarChart3,
  Stethoscope,
}

interface SidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export default function Sidebar({ mobile, onClose }: SidebarProps) {
  const [modulesOpen, setModulesOpen] = useState(false)
  const location = useLocation()

  const isModuleActive = modules.some((m) => location.pathname === m.href)

  return (
    <aside className={cn(
      mobile ? 'flex flex-col w-64' : 'hidden md:flex md:flex-col md:w-60 lg:w-64',
      'h-screen border-r border-border bg-sidebar shrink-0'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary text-primary-foreground">
          <Box className="size-4" />
        </div>
        <span className="text-base font-semibold tracking-tight">Invenos</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {sidebarNav.map((item) => {
          const Icon = iconMap[item.icon]
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )
              }
            >
              {Icon && <Icon className="size-4 shrink-0" />}
              <span>{item.label}</span>
            </NavLink>
          )
        })}

        {/* Divider */}
        <div className="my-3 border-t border-border" />

        {/* Modules Section */}
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
          {modulesOpen ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </button>

        {/* Module Items */}
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
                    <span className="text-[11px] font-normal text-sidebar-foreground/50">
                      {mod.description}
                    </span>
                  </div>
                </NavLink>
              )
            })}
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
            DA
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Dr. Ahmed</span>
            <span className="text-xs text-muted-foreground">Clinic Owner</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
