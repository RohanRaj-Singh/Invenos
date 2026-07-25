import { useState } from 'react'
import { Database, Download, Upload, HardDrive } from 'lucide-react'
import { SettingsLayout, SettingsSection, SettingsCard } from '../components/SettingsComponents'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface BackupEntry {
  id: string
  name: string
  size: string
  date: string
}

export default function BackupRestorePage() {
  const [backups] = useState<BackupEntry[]>([
    { id: 'b1', name: 'backup-2026-07-23-1200.zip', size: '2.4 MB', date: '2026-07-23 12:00' },
    { id: 'b2', name: 'backup-2026-07-22-1800.zip', size: '2.3 MB', date: '2026-07-22 18:00' },
    { id: 'b3', name: 'backup-2026-07-21-0000.zip', size: '2.3 MB', date: '2026-07-21 00:00' },
  ])

  const handleCreateBackup = () => {
    toast.success('Backup created successfully!')
  }

  const handleRestore = (name: string) => {
    toast.success(`Restore from "${name}" initiated. This is a placeholder.`)
  }

  return (
    <SettingsLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-600/20 to-cyan-600/5 flex items-center justify-center shrink-0">
            <Database className="size-5 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Backup & Restore</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Create and restore system backups. Backend integration coming soon.</p>
          </div>
        </div>

        <SettingsSection title="Backup Actions">
          <SettingsCard>
            <div className="flex items-center gap-4">
              <Button size="sm" className="gap-1.5" onClick={handleCreateBackup}>
                <Download className="size-4" /> Create Backup
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.info('Restore from file (placeholder)')}>
                <Upload className="size-4" /> Restore from File
              </Button>
            </div>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Backup History">
          <SettingsCard>
            {backups.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">No backups available.</div>
            ) : (
              <div className="space-y-1">
                {backups.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                        <HardDrive className="size-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{b.name}</div>
                        <div className="text-xs text-muted-foreground">{b.size} · {b.date}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={() => handleRestore(b.name)}>
                      <Upload className="size-3" /> Restore
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Scheduled Backups">
          <SettingsCard>
            <div className="text-sm text-muted-foreground">
              Automatic backup scheduling will be available after connecting to a backend.
            </div>
          </SettingsCard>
        </SettingsSection>
      </div>
    </SettingsLayout>
  )
}
