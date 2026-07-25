import { useState, useMemo, useCallback } from 'react'
import type { PaymentMethod } from '@/types'
import {
  getPaymentDisplayState,
} from '@/domain/transactions/payment-domain'
import type { PaymentDisplayState } from '@/domain/transactions/payment-domain'

export { getPaymentDisplayState }
export type { PaymentDisplayState }

export function useTransactionPayment(grandTotal: number) {
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [amount, setAmount] = useState('')

  const quickPay = useCallback(
    (type: 'full' | 'half' | 'none') => {
      if (type === 'full') setAmount(String(grandTotal))
      else if (type === 'half') setAmount(String(Math.ceil(grandTotal / 2)))
      else setAmount('0')
    },
    [grandTotal],
  )

  const displayState = useMemo(
    () => getPaymentDisplayState(parseFloat(amount) || 0, grandTotal),
    [amount, grandTotal],
  )

  return { method, setMethod, amount, setAmount, quickPay, displayState }
}
