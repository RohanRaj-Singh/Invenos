// ══════════════════════════════════════════
// User & Permission Types
// ══════════════════════════════════════════

export type UserRole = 'admin' | 'salesman'

export interface PermissionSet {
  dashboard: { view: boolean }
  products: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  inventory: { view: boolean; adjustStock: boolean }
  purchases: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  sales: { view: boolean; create: boolean; edit: boolean; delete: boolean; processReturn: boolean; applyDiscount: boolean; overridePrice: boolean; printInvoice: boolean }
  customers: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  suppliers: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  expenses: { view: boolean; create: boolean; edit: boolean; delete: boolean }
  reports: { view: boolean; print: boolean; export: boolean }
  settings: { access: boolean }
}

export interface User {
  id: string
  name: string
  username: string
  password: string
  role: UserRole
  phone: string
  active: boolean
  permissions: PermissionSet | null  // null for admin = full access
  createdAt: string
  lastLogin: string | null
}

// ═══ Default permissions for a salesman ═══

const DEFAULT_SALESMAN_PERMISSIONS: PermissionSet = {
  dashboard: { view: true },
  products: { view: true, create: false, edit: false, delete: false },
  inventory: { view: true, adjustStock: false },
  purchases: { view: true, create: false, edit: false, delete: false },
  sales: { view: true, create: true, edit: false, delete: false, processReturn: false, applyDiscount: false, overridePrice: false, printInvoice: true },
  customers: { view: true, create: false, edit: false, delete: false },
  suppliers: { view: true, create: false, edit: false, delete: false },
  expenses: { view: true, create: false, edit: false, delete: false },
  reports: { view: true, print: false, export: false },
  settings: { access: false },
}

// ═══ Permission labels for UI ═══

export interface PermissionGroupDef {
  key: keyof PermissionSet
  label: string
  actions: { action: string; label: string }[]
}

export const PERMISSION_GROUPS: PermissionGroupDef[] = [
  { key: 'dashboard', label: 'Dashboard', actions: [{ action: 'view', label: 'View Dashboard' }] },
  { key: 'products', label: 'Products', actions: [{ action: 'view', label: 'View Products' }, { action: 'create', label: 'Create Products' }, { action: 'edit', label: 'Edit Products' }, { action: 'delete', label: 'Delete Products' }] },
  { key: 'inventory', label: 'Inventory', actions: [{ action: 'view', label: 'View Inventory' }, { action: 'adjustStock', label: 'Adjust Stock' }] },
  { key: 'purchases', label: 'Purchases', actions: [{ action: 'view', label: 'View Purchases' }, { action: 'create', label: 'Create Purchase' }, { action: 'edit', label: 'Edit Purchase' }, { action: 'delete', label: 'Delete Purchase' }] },
  { key: 'sales', label: 'Sales', actions: [{ action: 'view', label: 'View Sales' }, { action: 'create', label: 'Create Sale' }, { action: 'edit', label: 'Edit Sale' }, { action: 'delete', label: 'Delete Sale' }, { action: 'processReturn', label: 'Process Sale Return' }, { action: 'applyDiscount', label: 'Apply Discount' }, { action: 'overridePrice', label: 'Override Price' }, { action: 'printInvoice', label: 'Print Invoice' }] },
  { key: 'customers', label: 'Customers', actions: [{ action: 'view', label: 'View Customers' }, { action: 'create', label: 'Create Customer' }, { action: 'edit', label: 'Edit Customer' }, { action: 'delete', label: 'Delete Customer' }] },
  { key: 'suppliers', label: 'Suppliers', actions: [{ action: 'view', label: 'View Suppliers' }, { action: 'create', label: 'Create Supplier' }, { action: 'edit', label: 'Edit Supplier' }, { action: 'delete', label: 'Delete Supplier' }] },
  { key: 'expenses', label: 'Expenses', actions: [{ action: 'view', label: 'View Expenses' }, { action: 'create', label: 'Create Expense' }, { action: 'edit', label: 'Edit Expense' }, { action: 'delete', label: 'Delete Expense' }] },
  { key: 'reports', label: 'Reports', actions: [{ action: 'view', label: 'View Reports' }, { action: 'print', label: 'Print Reports' }, { action: 'export', label: 'Export Reports' }] },
  { key: 'settings', label: 'Settings', actions: [{ action: 'access', label: 'Access Settings' }] },
]

// ═══ In-memory user store ═══

let currentUserId: string | null = null
let users: User[] = []
let listeners: Array<() => void> = []

function seedUsers() {
  users = [
    {
      id: 'user-001',
      name: 'Dr. Ahmed',
      username: 'admin',
      password: 'admin',
      role: 'admin',
      phone: '+92 300 1234567',
      active: true,
      permissions: null,
      createdAt: '2026-01-01T00:00:00Z',
      lastLogin: new Date().toISOString(),
    },
    {
      id: 'user-002',
      name: 'Saleem',
      username: 'saleem',
      password: '1234',
      role: 'salesman',
      phone: '',
      active: true,
      permissions: structuredClone(DEFAULT_SALESMAN_PERMISSIONS),
      createdAt: '2026-06-01T00:00:00Z',
      lastLogin: null,
    },
  ]
  currentUserId = null
}

seedUsers()

// ═══ Public API ═══

export function getUsers(): User[] {
  return users
}

export function getUser(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

export function getCurrentUser(): User | undefined {
  return users.find((u) => u.id === currentUserId)
}

export function getCurrentUserId(): string | null {
  return currentUserId
}

export function loginWithPassword(username: string, password: string): User | null {
  const user = users.find((u) => u.username === username && u.password === password && u.active)
  if (!user) return null
  currentUserId = user.id
  user.lastLogin = new Date().toISOString()
  notify()
  return user
}

export function loginAs(userId: string): boolean {
  const user = users.find((u) => u.id === userId && u.active)
  if (!user) return false
  currentUserId = userId
  user.lastLogin = new Date().toISOString()
  notify()
  return true
}

export function logout(): void {
  currentUserId = null
  notify()
}

export function isAuthenticated(): boolean {
  return currentUserId !== null && users.some((u) => u.id === currentUserId && u.active)
}

/** Returns the current user's name, or a fallback */
export function getCurrentUserName(): string {
  return getCurrentUser()?.name || 'System'
}

export function addUser(data: {
  name: string; username: string; password: string; phone: string; role: UserRole
}): User {
  const id = `user-${String(users.length + 1).padStart(3, '0')}`
  const user: User = {
    id,
    name: data.name,
    username: data.username,
    password: data.password,
    role: data.role,
    phone: data.phone,
    active: true,
    permissions: data.role === 'salesman' ? structuredClone(DEFAULT_SALESMAN_PERMISSIONS) : null,
    createdAt: new Date().toISOString(),
    lastLogin: null,
  }
  users.push(user)
  notify()
  return user
}

export function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | undefined {
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return undefined
  users[idx] = { ...users[idx], ...updates }
  notify()
  return users[idx]
}

export function deleteUser(id: string): boolean {
  if (id === 'user-001') return false // cannot delete admin
  const idx = users.findIndex((u) => u.id === id)
  if (idx === -1) return false
  users.splice(idx, 1)
  notify()
  return true
}

export function updatePermissions(id: string, permissions: PermissionSet): boolean {
  const user = users.find((u) => u.id === id)
  if (!user || user.role !== 'salesman') return false
  user.permissions = permissions
  notify()
  return true
}

function notify() {
  for (const fn of listeners) fn()
}

export function subscribeUsers(fn: () => void): () => void {
  listeners.push(fn)
  return () => { listeners = listeners.filter((l) => l !== fn) }
}

// ═══ Permission checking ═══

export function can(user: User | undefined, module: keyof PermissionSet, action: string): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  if (!user.permissions) return false
  const mod = user.permissions[module]
  if (!mod) return false
  return (mod as any)[action] === true
}

export function canModule(user: User | undefined, module: keyof PermissionSet): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  if (!user.permissions) return false
  const mod = user.permissions[module]
  if (!mod) return false
  return Object.values(mod as any).some((v) => v === true)
}
