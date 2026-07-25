import { useEffect, useRef } from 'react'

export function useTransactionPersistence(
  key: string,
  save: () => void,
  restore: () => void,
  deps: unknown[],
) {
  const restoredRef = useRef(false)

  useEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    restore()
  }, [])

  useEffect(() => {
    save()
  }, deps)
}

export function useBeforeUnloadGuard(hasItems: boolean) {
  useEffect(() => {
    if (!hasItems) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasItems])
}
