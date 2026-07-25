import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'

const SETTINGS_SECTIONS = [
  { id: 'general', label: 'General', href: '/settings' },
  { id: 'business', label: 'Business', href: '/settings/business' },
  { id: 'pos', label: 'POS', href: '/settings/pos' },
  { id: 'inventory', label: 'Inventory', href: '/settings/inventory' },
  { id: 'sales', label: 'Sales', href: '/settings/sales' },
  { id: 'purchases', label: 'Purchases', href: '/settings/purchases' },
  { id: 'receipt', label: 'Receipt', href: '/settings/receipt' },
  { id: 'backup', label: 'Backup & Restore', href: '/settings/backup' },
  { id: 'about', label: 'About System', href: '/settings/about' },
]

export function SettingsLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="flex h-full">
      {/* Side nav */}
      <div className="hidden md:flex flex-col w-48 shrink-0 border-r border-border p-3 space-y-0.5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Settings</div>
        {SETTINGS_SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => navigate(s.href)}
            className={cn(
              'text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              location.pathname === s.href
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden overflow-x-auto border-b border-border">
        <div className="flex gap-1 px-4 py-2">
          {SETTINGS_SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(s.href)}
              className={cn(
                'whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                location.pathname === s.href
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground border border-border',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export function SettingsSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

export function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      {children}
    </div>
  )
}

export function SettingsRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export function SettingsInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-48 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring transition-colors"
    />
  )
}

export function SettingsSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      className="w-48 h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring transition-colors"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

export function SettingsToggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer',
        enabled ? 'bg-primary' : 'bg-muted-foreground/30',
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block size-4 rounded-full bg-white shadow transform ring-0 transition-transform',
        enabled ? 'translate-x-4' : 'translate-x-0',
      )} />
    </button>
  )
}

export function SettingsSaveBar({ onSave, hasChanges }: { onSave: () => void; hasChanges: boolean }) {
  return (
    <div className="sticky bottom-0 bg-card border-t border-border px-5 py-3 flex justify-end gap-3">
      <button
        onClick={onSave}
        disabled={!hasChanges}
        className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Save Changes
      </button>
    </div>
  )
}
