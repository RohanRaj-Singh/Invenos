import { type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import AccessDenied from './AccessDenied'
import type { PermissionSet } from '@/data/users'

interface PermissionGuardProps {
  module: keyof PermissionSet
  action?: string
  children: ReactNode
  /** If true, checks if user has ANY permission in the module (for sidebar access) */
  moduleOnly?: boolean
}

export function PermissionGuard({ module, action, children, moduleOnly }: PermissionGuardProps) {
  const auth = useAuth()

  const allowed = moduleOnly
    ? auth.canModule(module)
    : action
      ? auth.can(module, action)
      : auth.canModule(module)

  if (!allowed) return <AccessDenied />
  return <>{children}</>
}

/** Hook version — returns true/false without rendering */
export function usePermission(module: keyof PermissionSet, action?: string): boolean {
  const auth = useAuth()
  if (action) return auth.can(module, action)
  return auth.canModule(module)
}
