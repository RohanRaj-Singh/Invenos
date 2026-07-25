import { useState, useCallback } from 'react'

interface DialogsState {
  showConfirm: boolean
  showReceipt: boolean
  showClearConfirm: boolean
}

export function useTransactionDialogs() {
  const [state, setState] = useState<DialogsState>({
    showConfirm: false,
    showReceipt: false,
    showClearConfirm: false,
  })

  const openConfirm = useCallback(() => setState((s) => ({ ...s, showConfirm: true })), [])
  const closeConfirm = useCallback(() => setState((s) => ({ ...s, showConfirm: false })), [])
  const openReceipt = useCallback(() => setState((s) => ({ ...s, showReceipt: true })), [])
  const closeReceipt = useCallback(() => setState((s) => ({ ...s, showReceipt: false })), [])
  const openClearConfirm = useCallback(() => setState((s) => ({ ...s, showClearConfirm: true })), [])
  const closeClearConfirm = useCallback(() => setState((s) => ({ ...s, showClearConfirm: false })), [])

  return {
    ...state,
    openConfirm,
    closeConfirm,
    openReceipt,
    closeReceipt,
    openClearConfirm,
    closeClearConfirm,
  }
}
