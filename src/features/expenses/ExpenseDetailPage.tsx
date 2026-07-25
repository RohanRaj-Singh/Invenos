import { useNavigate, useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Wallet, Printer, Pencil, Trash2, DollarSign, Calendar, User, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getExpenseByNumber, deleteExpense } from '@/data/expenses'
import { getExpenseCategoryById } from '@/data/expense-categories'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'
import { useApplication } from '@/features/transactions/TransactionContext'
import { toast } from 'sonner'

const METHOD_COLORS: Record<string, string> = {
  cash: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400',
  card: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400',
  transfer: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400',
  easypaisa: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400',
  jazzcash: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400',
}

export default function ExpenseDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { eventBus } = useApplication()
  const [showDelete, setShowDelete] = useState(false)
  const expense = getExpenseByNumber(id || '')

  if (!expense) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center py-24 text-sm text-muted-foreground">
          <Wallet className="size-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-1">Expense Not Found</h2>
          <p className="mb-4">This expense doesn't exist.</p>
          <Link to="/expenses" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">Back to Expenses</Link>
        </div>
      </div>
    )
  }

  const category = getExpenseCategoryById(expense.categoryId)

  const handleDelete = () => {
    deleteExpense(expense.id)
    eventBus.emit('ExpenseDeleted', { type: 'ExpenseDeleted', expenseId: expense.id, timestamp: new Date().toISOString() })
    toast.success(`Expense ${expense.expenseNumber} deleted`)
    navigate('/expenses')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/expenses')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to Expenses</span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
            <Printer className="size-3.5" />
            Print
          </button>
          <Link to={`/expenses/${expense.expenseNumber}/edit`} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
            <Pencil className="size-3.5" />
            Edit
          </Link>
          <button onClick={() => setShowDelete(true)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="size-12 sm:size-14 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center shrink-0">
          <Wallet className="size-6 sm:size-7 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{expense.expenseNumber}</h1>
            {category && (
              <Badge variant="outline" className="text-[10px] px-2 py-0 h-5">{category.name}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="font-medium text-foreground">{expense.paidTo || 'Unknown'}</span>
            <span>·</span>
            <span>{expense.date}</span>
            <span>·</span>
            <span>{expense.createdBy}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Amount" value={formatCurrency(expense.amount)} bold negative />
        <StatCard label="Payment Method" value={expense.paymentMethod} positive />
        <StatCard label="Category" value={category?.name || 'Unknown'} />
        <StatCard label="Reference" value={expense.referenceNumber || '—'} />
      </div>

      {/* Full details */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoRow icon={<DollarSign className="size-4" />} label="Amount" value={formatCurrency(expense.amount)} />
          <InfoRow icon={<Calendar className="size-4" />} label="Date" value={expense.date} />
          <InfoRow icon={<Wallet className="size-4" />} label="Category" value={category?.name || 'Unknown'} />
          <InfoRow icon={<User className="size-4" />} label="Paid To" value={expense.paidTo || '—'} />
          <InfoRow icon={<Wallet className="size-4" />} label="Payment Method" value={
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5', METHOD_COLORS[expense.paymentMethod])}>
              {expense.paymentMethod}
            </Badge>
          } />
          <InfoRow icon={<FileText className="size-4" />} label="Reference" value={expense.referenceNumber || '—'} />
          {expense.notes && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1.5">Notes</p>
              <p className="text-sm">{expense.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <TimelineEntry
              icon={<Wallet className="size-4" />}
              title="Expense Recorded"
              description={`${expense.expenseNumber} — ${formatCurrency(expense.amount)} ${expense.categoryName ? `(${expense.categoryName})` : ''}`}
              date={expense.date}
              active
            />
            {expense.updatedAt && (
              <TimelineEntry
                icon={<Pencil className="size-4" />}
                title="Expense Updated"
                description="Details were modified"
                date={expense.updatedAt.split('T')[0]}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowDelete(false)}>
          <div className="bg-background rounded-xl p-6 max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-2">Delete Expense?</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete {expense.expenseNumber}? This cannot be undone.</p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, bold, positive, negative }: { label: string; value: string | React.ReactNode; bold?: boolean; positive?: boolean; negative?: boolean }) {
  return (
    <Card size="sm">
      <CardContent className="p-4">
        <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
        <div className={cn('text-lg tracking-tight', bold ? 'font-bold' : 'font-semibold', positive && 'text-emerald-600', negative && 'text-red-600')}>{value}</div>
      </CardContent>
    </Card>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-center size-8 rounded-lg bg-muted shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  )
}

function TimelineEntry({ icon, title, description, date, active }: {
  icon: React.ReactNode; title: string; description: string; date: string; active?: boolean
}) {
  return (
    <div className="flex gap-3">
      <div className={cn('flex items-center justify-center size-8 rounded-lg shrink-0 mt-0.5', active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="text-xs text-muted-foreground shrink-0">{date}</div>
    </div>
  )
}
