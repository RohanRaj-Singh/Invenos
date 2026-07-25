import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Wallet, Save, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getActiveExpenseCategories, addExpenseCategory } from '@/data/expense-categories'
import { addExpense, updateExpense, getExpenseById, getExpenseByNumber } from '@/data/expenses'
import { useApplication } from '@/features/transactions/TransactionContext'
import { toast } from 'sonner'
import { getCurrentUserName } from '@/data/users'
import type { PaymentMethod } from '@/types'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'transfer', label: 'Bank Transfer' },
  { value: 'easypaisa', label: 'Easypaisa' },
  { value: 'jazzcash', label: 'JazzCash' },
]

export default function ExpenseFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { eventBus } = useApplication()
  const categories = useMemo(() => getActiveExpenseCategories(), [])

  const isEditing = id && (id.startsWith('EXP-') || String(id).startsWith('exp-'))

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [categoryInput, setCategoryInput] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [isNewCategory, setIsNewCategory] = useState(false)
  const [amount, setAmount] = useState('')
  const [paidTo, setPaidTo] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuggestions, setShowSuggestions] = useState(false)
  const suggestionRef = useRef<HTMLDivElement>(null)
  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Load existing expense for editing
  useEffect(() => {
    if (!id) return
    const expense = String(id).startsWith('EXP-') ? getExpenseByNumber(id) : getExpenseById(id)
    if (expense) {
      setDate(expense.date)
      setCategoryInput(expense.categoryName)
      setCategoryId(expense.categoryId)
      setAmount(String(expense.amount))
      setPaidTo(expense.paidTo)
      setPaymentMethod(expense.paymentMethod)
      setNotes(expense.notes)
    }
  }, [id])

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!categoryId) errs.categoryId = 'Category is required'
    if (!amount || parseFloat(amount) <= 0) errs.amount = 'Amount must be greater than zero'
    if (!date) errs.date = 'Date is required'
    if (!paymentMethod) errs.paymentMethod = 'Payment method is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (andNext = false) => {
    if (!validate()) {
      toast.error('Please fix the errors before saving.')
      return
    }

    const data = {
      date,
      categoryId,
      amount: Math.round(parseFloat(amount) * 100) / 100,
      paidTo,
      paymentMethod,
      notes,
      createdBy: getCurrentUserName(),
    }

    if (isEditing) {
      const existing = String(id!).startsWith('EXP-') ? getExpenseByNumber(id!) : getExpenseById(id!)
      if (existing) {
        updateExpense(existing.id, {
          ...data,
          categoryId,
          amount: data.amount,
        })
        eventBus.emit('ExpenseUpdated', { type: 'ExpenseUpdated', expenseId: existing.id, timestamp: new Date().toISOString() })
        toast.success(`Expense ${existing.expenseNumber} updated`)
        navigate(`/expenses/${existing.expenseNumber}`)
      }
    } else {
      const expense = addExpense(data)
      eventBus.emit('ExpenseCreated', { type: 'ExpenseCreated', expenseId: expense.id, amount: expense.amount, timestamp: new Date().toISOString() })
      toast.success(`Expense ${expense.expenseNumber} recorded`)

      if (andNext) {
        setDate(new Date().toISOString().split('T')[0])
        setCategoryInput('')
        setCategoryId('')
        setIsNewCategory(false)
        setAmount('')
        setPaidTo('')
        setNotes('')
        setErrors({})
      } else {
        navigate(`/expenses/${expense.expenseNumber}`)
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/expenses')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to Expenses</span>
        </button>
      </div>

      <div className="flex items-start gap-4">
        <div className="size-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center shrink-0">
          <Wallet className="size-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{isEditing ? 'Edit Expense' : 'Add Expense'}</h1>
          <p className="text-sm text-muted-foreground mt-1">{isEditing ? 'Update the expense details below.' : 'Record a new business expense.'}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Expense Date <span className="text-red-500">*</span></label>
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
              />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>

            {/* Category — searchable with Add New */}
            <div className="relative" ref={suggestionRef}>
              <label className="block text-sm font-medium mb-1.5">Category <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={categoryInput}
                  onChange={(e) => {
                    setCategoryInput(e.target.value)
                    setShowSuggestions(true)
                    const match = categories.find(
                      (c) => c.name.toLowerCase() === e.target.value.toLowerCase()
                    )
                    if (match) {
                      setCategoryId(match.id)
                      setIsNewCategory(false)
                    } else {
                      setCategoryId('')
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search or type a category..."
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
                  autoComplete="off"
                />
                {categoryInput && !isNewCategory && !categoryId && (
                  <button
                    onClick={() => {
                      const name = categoryInput.trim()
                      if (!name) return
                      const id = `exp-cat-${String(Date.now()).slice(-6)}`
                      const newCat = addExpenseCategory({
                        id, name, description: '', color: '#78716c', icon: 'Wallet', active: true,
                      })
                      setCategoryId(newCat.id)
                      setIsNewCategory(true)
                      setShowSuggestions(false)
                      toast.success(`Category "${name}" created`)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="size-3" /> Add New
                  </button>
                )}
              </div>
              {showSuggestions && categoryInput && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-background border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {categories
                    .filter((c) => c.name.toLowerCase().includes(categoryInput.toLowerCase()) && c.id !== categoryId)
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCategoryInput(c.name)
                          setCategoryId(c.id)
                          setIsNewCategory(false)
                          setShowSuggestions(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                      >
                        <div className="size-6 rounded" style={{ backgroundColor: c.color + '30' }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  {categories.filter((c) => c.name.toLowerCase().includes(categoryInput.toLowerCase()) && c.id !== categoryId).length === 0 && (
                    <div className="px-3 py-3 text-sm text-muted-foreground">
                      No matching category.{' '}
                      <button
                        type="button"
                        onClick={() => {
                          const name = categoryInput.trim()
                          if (!name) return
                          const id = `exp-cat-${String(Date.now()).slice(-6)}`
                          const newCat = addExpenseCategory({
                            id, name, description: '', color: '#78716c', icon: 'Wallet', active: true,
                          })
                          setCategoryId(newCat.id)
                          setIsNewCategory(true)
                          setShowSuggestions(false)
                          toast.success(`Category "${name}" created`)
                        }}
                        className="text-primary font-medium hover:underline"
                      >
                        Add "{categoryInput.trim()}"
                      </button>
                    </div>
                  )}
                </div>
              )}
              {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Amount (Rs.) <span className="text-red-500">*</span></label>
              <input
                type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>

            {/* Paid To */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Paid To</label>
              <input
                type="text" value={paidTo} onChange={(e) => setPaidTo(e.target.value)}
                placeholder="Vendor or payee name"
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Payment Method <span className="text-red-500">*</span></label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.value} value={pm.value}>{pm.label}</option>
                ))}
              </select>
              {errors.paymentMethod && <p className="text-xs text-red-500 mt-1">{errors.paymentMethod}</p>}
            </div>

          </div>

          {/* Notes */}
          <div className="mt-5">
            <label className="block text-sm font-medium mb-1.5">Notes</label>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this expense"
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors resize-none"
            />
          </div>

        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => navigate('/expenses')}
          className="px-4 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => handleSubmit(true)}
          className="px-4 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <span className="hidden sm:inline">Save & Add Next</span>
          <span className="sm:hidden">Add Next</span>
        </button>
        <button
          onClick={() => handleSubmit(false)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Save className="size-4" />
          {isEditing ? 'Update Expense' : 'Save Expense'}
        </button>
      </div>
    </div>
  )
}
