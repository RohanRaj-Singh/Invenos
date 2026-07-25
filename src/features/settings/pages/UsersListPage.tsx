import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Shield, UserCog } from 'lucide-react'
import { SettingsLayout } from '../components/SettingsComponents'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUsers, updateUser, deleteUser } from '@/data/users'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/AuthContext'

export default function UsersListPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [users] = useState(() => getUsers())
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleToggle = (userId: string, currentlyActive: boolean) => {
    updateUser(userId, { active: !currentlyActive })
    toast.success(currentlyActive ? 'User disabled' : 'User enabled')
  }

  const handleDelete = (userId: string) => {
    if (deleteUser(userId)) {
      toast.success('User deleted')
      setConfirmDelete(null)
    } else {
      toast.error('Cannot delete admin user')
      setConfirmDelete(null)
    }
  }

  return (
    <SettingsLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-600/20 to-indigo-600/5 flex items-center justify-center shrink-0">
              <Users className="size-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Users & Permissions</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage users and control what each user can do.</p>
            </div>
          </div>
          {auth.can('settings', 'access') && (
            <button
              onClick={() => navigate('/settings/users/new')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-4" /> Add User
            </button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <Th>User</Th>
                  <Th>Username</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Last Login</Th>
                  <Th className="w-32 text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'size-8 rounded-full flex items-center justify-center text-xs font-bold',
                          u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10',
                        )}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{u.name}</div>
                          {u.phone && <div className="text-xs text-muted-foreground">{u.phone}</div>}
                        </div>
                      </div>
                    </Td>
                    <Td className="text-sm font-mono">{u.username}</Td>
                    <Td>
                      <Badge variant="outline" className={cn(
                        'text-[10px] px-1.5 py-0 h-5',
                        u.role === 'admin'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10',
                      )}>
                        {u.role === 'admin' ? <Shield className="size-3 inline mr-0.5" /> : <UserCog className="size-3 inline mr-0.5" />}
                        {u.role === 'admin' ? 'Admin' : 'Salesman'}
                      </Badge>
                    </Td>
                    <Td>
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs font-medium',
                        u.active ? 'text-emerald-600' : 'text-muted-foreground',
                      )}>
                        <div className={cn('size-1.5 rounded-full', u.active ? 'bg-emerald-500' : 'bg-muted-foreground')} />
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </Td>
                    <Td className="text-xs text-muted-foreground">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</Td>
                    <Td className="text-right">
                      {auth.can('settings', 'access') && (
                        <div className="flex items-center justify-end gap-1">
                          {u.role === 'salesman' && (
                            <button
                              onClick={() => navigate(`/settings/users/${u.id}/permissions`)}
                              className="flex items-center justify-center size-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              title="Permissions"
                            >
                              <UserCog className="size-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(u.role === 'salesman' ? `/settings/users/${u.id}/edit` : `/settings/users/${u.id}`)}
                            className="flex items-center justify-center size-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggle(u.id, u.active)}
                            className="flex items-center justify-center size-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title={u.active ? 'Disable' : 'Enable'}
                          >
                            {u.active ? <ToggleLeft className="size-3.5" /> : <ToggleRight className="size-3.5" />}
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => setConfirmDelete(u.id)}
                              className="flex items-center justify-center size-7 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setConfirmDelete(null)}>
            <div className="bg-background rounded-xl p-6 max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-semibold mb-2">Delete User?</h3>
              <p className="text-sm text-muted-foreground mb-4">This action cannot be undone.</p>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn('px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider', className)}>{children}</th>
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-4 py-3', className)}>{children}</td>
}
