import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserCog, ArrowLeft, Save } from 'lucide-react'
import { SettingsLayout, SettingsSection } from '../components/SettingsComponents'
import { Card, CardContent } from '@/components/ui/card'
import { getUser, updatePermissions, PERMISSION_GROUPS, type PermissionSet } from '@/data/users'
import { toast } from 'sonner'

export default function PermissionsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const user = useMemo(() => getUser(id || ''), [id])
  const [perms, setPerms] = useState<PermissionSet | null>(null)

  useEffect(() => {
    if (user?.permissions) {
      setPerms(JSON.parse(JSON.stringify(user.permissions)))
    }
  }, [user])

  if (!user || user.role !== 'salesman') {
    return (
      <SettingsLayout>
        <div className="p-8 text-center text-sm text-muted-foreground">User not found or not a salesman.</div>
      </SettingsLayout>
    )
  }

  const setPerm = (group: keyof PermissionSet, action: string, value: boolean) => {
    if (!perms) return
    setPerms({
      ...perms,
      [group]: { ...(perms[group] as any), [action]: value },
    })
  }

  const handleSave = () => {
    if (!perms) return
    updatePermissions(user.id, perms)
    toast.success(`Permissions updated for ${user.name}`)
    navigate('/settings/users')
  }

  return (
    <SettingsLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/settings/users')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" /> Back to Users
          </button>
        </div>

        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-600/20 to-indigo-600/5 flex items-center justify-center shrink-0">
            <UserCog className="size-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Permissions — {user.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Configure what this user can access.</p>
          </div>
        </div>

        {perms && (
          <SettingsSection title="Module Permissions">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PERMISSION_GROUPS.map((group) => {
                const groupPerms = perms[group.key] as Record<string, boolean>
                const allOn = group.actions.every((a) => (groupPerms as any)[a.action])
                const someOn = group.actions.some((a) => (groupPerms as any)[a.action])

                return (
                  <Card key={group.key} size="sm" className={someOn ? 'border-primary/20' : ''}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">{group.label}</h4>
                        <button
                          onClick={() => group.actions.forEach((a) => setPerm(group.key, a.action, !allOn))}
                          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {allOn ? 'Clear all' : 'Select all'}
                        </button>
                      </div>
                      <div className="space-y-1">
                        {group.actions.map((a) => (
                          <label key={a.action} className="flex items-center justify-between text-xs py-1 cursor-pointer hover:bg-muted/30 rounded px-1 -mx-1 transition-colors">
                            <span>{a.label}</span>
                            <input
                              type="checkbox"
                              checked={(groupPerms as any)[a.action] === true}
                              onChange={(e) => setPerm(group.key, a.action, e.target.checked)}
                              className="size-3.5 rounded border-input accent-primary"
                            />
                          </label>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </SettingsSection>
        )}

        <div className="flex items-center justify-end gap-3">
          <button onClick={() => navigate('/settings/users')} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            <Save className="size-4" /> Save Permissions
          </button>
        </div>
      </div>
    </SettingsLayout>
  )
}
