import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getCurrentUser, can, canModule, loginAs as loginAsUser, logout as logoutUser, loginWithPassword, subscribeUsers, type User, type PermissionSet } from '@/data/users'

interface AuthContextType {
  user: User | undefined
  can: (module: keyof PermissionSet, action: string) => boolean
  canModule: (module: keyof PermissionSet) => boolean
  login: (username: string, password: string) => User | null
  loginAs: (userId: string) => boolean
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  can: () => false,
  canModule: () => false,
  login: () => null,
  loginAs: () => false,
  logout: () => {},
  isAuthenticated: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(getCurrentUser)

  useEffect(() => subscribeUsers(() => setUser(getCurrentUser())), [])

  const checkCan = useCallback(
    (module: keyof PermissionSet, action: string) => can(user, module, action),
    [user],
  )
  const checkCanModule = useCallback(
    (module: keyof PermissionSet) => canModule(user, module),
    [user],
  )
  const login = useCallback((username: string, password: string) => loginWithPassword(username, password), [])
  const logout = useCallback(() => logoutUser(), [])

  return (
    <AuthContext.Provider value={{ user, can: checkCan, canModule: checkCanModule, login, loginAs: loginAsUser, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
