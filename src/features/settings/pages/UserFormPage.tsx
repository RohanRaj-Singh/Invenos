import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Users, Save, ArrowLeft } from 'lucide-react'
import { SettingsLayout, SettingsSection, SettingsCard, SettingsToggle } from '../components/SettingsComponents'
import { Card, CardContent } from '@/components/ui/card'
import { getUser, addUser, updateUser, updatePermissions, PERMISSION_GROUPS, type PermissionSet } from '@/data/users'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/AuthContext'

export default function UserFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const auth = useAuth()
  const isNew = !id || id === 'new'
  const existing = useMemo(() => (id && !isNew ? getUser(id) : undefined), [id])

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [active, setActive] = useState(true)

  // Permission state (for editing existing salesman)
  const [perms, setPerms] = useState<PermissionSet | null>(null)

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setUsername(existing.username)
      setPhone(existing.phone)
      setActive(existing.active)
      if (existing.permissions) {
        setPerms(JSON.parse(JSON.stringify(existing.permissions)))
      }
    }
  }, [existing])

  const setPerm = (group: keyof PermissionSet, action: string, value: boolean) => {
    if (!perms) return
    setPerms({
      ...perms,
      [group]: { ...(perms[group] as any), [action]: value },
    })
  }

  const handleSave = () => {
    if (!name.trim() || !username.trim()) {
      toast.error('Name and username are required')
      return
    }

    if (existing) {
      updateUser(existing.id, { name, username, phone, active })
      if (perms && existing.role === 'salesman') {
        updatePermissions(existing.id, perms)
      }
      toast.success(`User "${name}" updated`)
      navigate('/settings/users')
    } else {
      if (!password) {
        toast.error('Password is required')
        return
      }
      addUser({ name, username, password, phone, role: 'salesman' })
      toast.success(`User "${name}" created`)
      navigate('/settings/users')
    }
  }

  const isEditingSelf = existing?.id === auth.user?.id

  return (
    <SettingsLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/settings/users')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-4" /> Back to Users
          </button>
        </div>

        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-600/20 to-indigo-600/5 flex items-center justify-center shrink-0">
            <Users className="size-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{isNew ? 'Add Salesman' : 'Edit User'}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{isNew ? 'Create a new user with limited permissions.' : 'Update user details and permissions.'}</p>
          </div>
        </div>

        <SettingsSection title="User Information">
          <SettingsCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Muhammad Saleem"
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. saleem"
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring" />
              </div>
              {isNew && (
                <div>
                  <label className="block text-xs font-medium mb-1.5">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set a password"
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring" />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium mb-1.5">Phone (optional)</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 3XX XXXXXXX"
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring" />
              </div>
              {!isNew && (
                <div>
                  <label className="block text-xs font-medium mb-1.5">Role</label>
                  <div className="h-9 flex items-center text-sm font-medium capitalize">{existing?.role}</div>
                </div>
              )}
              {!isNew && (
                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5">Active</label>
                    <SettingsToggle enabled={active} onChange={setActive} />
                  </div>
                </div>
              )}
            </div>
          </SettingsCard>
        </SettingsSection>

        {/* Permissions (only for salesmen) */}
        {(existing?.role === 'salesman' || isNew) && perms && (
          <SettingsSection title="Permissions" description="Control what this user can access.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERMISSION_GROUPS.map((group) => {
                const groupPerms = perms[group.key] as Record<string, boolean>
                return (
                  <Card key={group.key} size="sm">
                    <CardContent className="p-4 space-y-2">
                      <h4 className="text-sm font-semibold">{group.label}</h4>
                      <div className="space-y-1.5">
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

        {isEditingSelf && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
            You are currently logged in as this user. Changes take effect immediately.
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button onClick={() => navigate('/settings/users')} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSave} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            <Save className="size-4" /> {isNew ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </div>
    </SettingsLayout>
  )
}
