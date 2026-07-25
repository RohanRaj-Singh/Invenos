import { useState, useMemo, useCallback } from 'react'
import type { ProductInfo } from '@/domain/products/types'
import type { TransactionStrategy } from '@/domain/transactions/strategies/types'

export function useTransactionSearch(strategy: TransactionStrategy) {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)

  const results = useMemo(() => {
    if (!query.trim()) return []
    return strategy.searchProducts(query)
  }, [query, strategy])

  return { query, setQuery, results, showResults, setShowResults }
}
