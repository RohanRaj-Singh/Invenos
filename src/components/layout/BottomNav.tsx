import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  MoreHorizontal,
  Stethoscope,
  CreditCard,
  Users,
  Receipt,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { mobileNav } from '@/data/dashboard'

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  MoreHorizontal,
  Receipt,
}

const moreItems = [
  { label: 'Payments', href: '/payments', icon: CreditCard },
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Clinic', href: '/clinic', icon: Stethoscope },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href)
  }

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNav.map((item) => {
            if (item.href === '#more') {
              return (
                <Sheet key="more" open={moreOpen} onOpenChange={setMoreOpen}>
                  <SheetTrigger>
                    <span
                      className={cn(
                        'flex flex-col items-center justify-center gap-0.5 h-full px-3 py-1 min-w-[64px] text-[10px] font-medium transition-colors cursor-pointer',
                        moreOpen
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <MoreHorizontal className="size-5" />
                      <span>More</span>
                    </span>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="pb-8 rounded-t-2xl">
                    <SheetHeader className="pb-2">
                      <SheetTitle className="text-left text-base">More</SheetTitle>
                    </SheetHeader>
                    <div className="grid grid-cols-3 gap-3 px-4 pt-2">
                      {moreItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                          <button
                            key={item.href}
                            onClick={() => {
                              setMoreOpen(false)
                              navigate(item.href)
                            }}
                            className={cn(
                              'flex flex-col items-center gap-2 py-4 rounded-xl text-sm font-medium transition-colors',
                              active
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <Icon className="size-6" />
                            <span>{item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </SheetContent>
                </Sheet>
              )
            }

            const Icon = iconMap[item.icon]
            const active = isActive(item.href)

            if (item.prominent) {
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className="relative flex flex-col items-center justify-center -mt-4"
                >
                  <div
                    className={cn(
                      'flex items-center justify-center size-14 rounded-full shadow-lg transition-all',
                      active
                        ? 'bg-primary text-primary-foreground scale-110 shadow-primary/25'
                        : 'bg-primary text-primary-foreground'
                    )}
                  >
                    {Icon && <Icon className="size-6" />}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-medium mt-0.5',
                      active ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              )
            }

            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 h-full px-3 py-1 min-w-[64px] text-[10px] font-medium transition-colors',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {Icon && <Icon className="size-5" />}
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
      {/* Spacer for mobile nav */}
      <div className="md:hidden h-16" />
    </>
  )
}
