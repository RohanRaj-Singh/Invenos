import { createContext, useContext, useRef, useMemo } from 'react'
import { bootstrapApplication } from '@/application/bootstrap'
import type { ApplicationContext } from '@/application/context'

const AppCtx = createContext<ApplicationContext | null>(null)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<ApplicationContext | null>(null)
  if (!ref.current) {
    ref.current = bootstrapApplication()
  }
  return <AppCtx.Provider value={ref.current}>{children}</AppCtx.Provider>
}

export function useApplication(): ApplicationContext {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApplication must be used within TransactionProvider')
  return ctx
}
