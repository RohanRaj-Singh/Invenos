import { Info, Package, Database, Server, Globe, Cpu } from 'lucide-react'
import { SettingsLayout, SettingsSection, SettingsCard } from '../components/SettingsComponents'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const INFO = [
  { label: 'Application Name', value: 'Invenos' },
  { label: 'Version', value: '1.0.0 (MVP)' },
  { label: 'Build Number', value: '20260723.1' },
  { label: 'Environment', value: 'Development' },
  { label: 'Data Source', value: 'In-Memory (Mock)' },
  { label: 'License', value: 'MIT (placeholder)' },
]

const TECH = [
  { label: 'Frontend', value: 'React 19 + TypeScript', icon: Cpu },
  { label: 'Build Tool', value: 'Vite 6', icon: Package },
  { label: 'Styling', value: 'Tailwind CSS v4', icon: Globe },
  { label: 'UI Framework', value: 'shadcn/ui', icon: Server },
  { label: 'State', value: 'React Hooks + Event Bus', icon: Database },
  { label: 'Routing', value: 'React Router v7', icon: Globe },
  { label: 'Data', value: 'Deterministic Seed Generator', icon: Database },
]

const STATUS = [
  { label: 'Application', status: 'Operational', color: 'text-emerald-500' },
  { label: 'Dashboard', status: 'Live', color: 'text-emerald-500' },
  { label: 'Database', status: 'Mock (In-Memory)', color: 'text-amber-500' },
  { label: 'API Server', status: 'Not Connected', color: 'text-slate-400' },
  { label: 'Authentication', status: 'Single User', color: 'text-cyan-500' },
]

export default function AboutSystemPage() {
  return (
    <SettingsLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
            <Info className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">About System</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Application information, technology stack, and system status.</p>
          </div>
        </div>

        <div className="flex items-center justify-center py-6">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-2xl bg-primary flex items-center justify-center">
              <Package className="size-7 text-primary-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">Invenos</div>
              <div className="text-sm text-muted-foreground">Cloud Inventory & POS v1.0.0</div>
            </div>
          </div>
        </div>

        <SettingsSection title="Application Information">
          <SettingsCard>
            <div className="space-y-1">
              {INFO.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Technology Stack">
          <SettingsCard>
            <div className="space-y-1">
              {TECH.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                      <div className="text-sm font-medium">{item.value}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="System Status">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STATUS.map((item) => (
              <Card key={item.label} size="sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={cn('size-2 rounded-full', item.color.replace('text-', 'bg-'))} />
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className={cn('text-xs font-medium', item.color)}>{item.status}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </SettingsSection>

        <div className="text-center text-xs text-muted-foreground pb-6">
          Built with React 19, TypeScript, Tailwind CSS v4 & shadcn/ui
        </div>
      </div>
    </SettingsLayout>
  )
}
