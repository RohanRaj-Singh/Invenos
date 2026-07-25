import type { DashboardStats, QuickAction, ActivityEvent, NavItem, ModuleItem } from '@/types'
import {
  generatedDashboardStats,
  generatedRecentActivity,
} from './generator'
import { formatCurrency as fc } from '@/lib/format'

export const formatCurrency = fc

export const mockStats: DashboardStats = generatedDashboardStats
export const mockActivity: ActivityEvent[] = generatedRecentActivity

export const mockQuickActions: QuickAction[] = [
  {
    id: 'new-sale',
    label: 'New Sale',
    description: 'Create a new POS transaction',
    icon: 'ShoppingCart',
    href: '/sales',
    color: 'blue',
  },
  {
    id: 'new-purchase',
    label: 'New Purchase',
    description: 'Record supplier purchase order',
    icon: 'Package',
    href: '/purchases',
    color: 'amber',
  },
  {
    id: 'new-patient',
    label: 'New Patient',
    description: 'Register a clinic patient',
    icon: 'Stethoscope',
    href: '/clinic',
    color: 'purple',
  },
  {
    id: 'receive-payment',
    label: 'Receive Payment',
    description: 'Record incoming payment',
    icon: 'Banknote',
    href: '/payments',
    color: 'green',
  },
  {
    id: 'add-expense',
    label: 'Add Expense',
    description: 'Record business expense',
    icon: 'Wallet',
    href: '/expenses',
    color: 'red',
  },
]

export const sidebarNav: NavItem[] = [
  { label: 'Home', href: '/', icon: 'LayoutDashboard' },
  { label: 'Inventory', href: '/inventory', icon: 'Package' },
  {
    label: 'Sales',
    href: '/sales',
    icon: 'ShoppingCart',
    children: [
      { label: 'Sales List', href: '/sales' },
      { label: 'Create Sale', href: '/sales/pos' },
      { label: 'Sale Returns', href: '/sales/returns' },
    ],
  },
  {
    label: 'Purchases',
    href: '/purchases',
    icon: 'ShoppingBag',
    children: [
      { label: 'Purchase List', href: '/purchases' },
      { label: 'Create Purchase', href: '/purchases/new' },
      { label: 'Purchase Returns', href: '/purchases/returns' },
    ],
  },
  { label: 'Payments', href: '/payments', icon: 'CreditCard' },
  { label: 'Expenses', href: '/expenses', icon: 'Wallet' },
  { label: 'Contacts', href: '/contacts', icon: 'Users' },
  { label: 'Reports', href: '/reports', icon: 'BarChart3' },
]

export const modules: ModuleItem[] = [
  {
    label: 'Clinic Module',
    href: '/clinic',
    icon: 'Stethoscope',
    description: 'Patient records, visits, prescriptions',
  },
]

export const mobileNav = [
  { label: 'Home', href: '/', icon: 'LayoutDashboard' },
  { label: 'Inventory', href: '/inventory', icon: 'Package' },
  { label: 'POS', href: '/sales/pos', icon: 'ShoppingCart', prominent: true },
  { label: 'Sales', href: '/sales', icon: 'Receipt' },
  { label: 'More', href: '#more', icon: 'MoreHorizontal' },
]

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}
