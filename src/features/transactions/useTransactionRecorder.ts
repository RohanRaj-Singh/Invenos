import { useCallback } from 'react'
import type { ReceiptData } from '@/domain/transactions/types'
import type { TransactionStrategy } from '@/domain/transactions/strategies/types'
import type { POSCustomer } from '@/types'
import { buildCartState } from '@/features/transactions/cart/cart-domain'
import { useApplication } from '@/features/transactions/TransactionContext'

interface RecordParams {
  strategy: TransactionStrategy
  items: any[]
  partyId: string | null
  partyName: string | null
  discount: number
  discountPct: number
  paymentMethod: string
  amountPaid: string
  subtotal: number
  grandTotal: number
  date: string
  createdBy: string
}

export function useTransactionRecorder() {
  const { transactionOrchestrator } = useApplication()

  const record = useCallback(
    (params: RecordParams): { receipt: ReceiptData } => {
      const cart = buildCartState(
        params.items,
        params.partyId,
        params.partyName,
        params.discount,
        params.discountPct,
        params.paymentMethod,
        parseFloat(params.amountPaid) || params.grandTotal,
      )

      const result = transactionOrchestrator.execute(
        params.strategy,
        cart,
        {
          method: params.paymentMethod as any,
          amount: parseFloat(params.amountPaid) || params.grandTotal,
        },
        params.date,
        params.createdBy,
      )

      return { receipt: result.receipt }
    },
    [transactionOrchestrator],
  )

  return { record }
}
