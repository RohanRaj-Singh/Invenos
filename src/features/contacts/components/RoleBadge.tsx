import { cn } from '@/lib/utils'
import type { ContactRole } from '@/types'

const config: Record<ContactRole, { label: string; cls: string }> = {
  customer: { label: 'Customer', cls: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  supplier: { label: 'Supplier', cls: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  patient: { label: 'Patient', cls: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  doctor: { label: 'Doctor', cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  employee: { label: 'Employee', cls: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800' },
  vendor: { label: 'Vendor', cls: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  referrer: { label: 'Referrer', cls: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  insurance: { label: 'Insurance', cls: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
}

export default function RoleBadge({ role, size = 'sm' }: { role: ContactRole; size?: 'sm' | 'xs' }) {
  const c = config[role]
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium whitespace-nowrap',
      size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-1.5 py-0 text-[10px]',
      c.cls
    )}>
      {c.label}
    </span>
  )
}

export function RoleBadgeList({ roles, size = 'sm' }: { roles: ContactRole[]; size?: 'sm' | 'xs' }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {roles.map((role) => <RoleBadge key={role} role={role} size={size} />)}
    </div>
  )
}
