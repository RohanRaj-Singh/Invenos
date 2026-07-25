import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Wallet, Search, Plus, Pencil, Archive, Check, Palette } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getExpenseCategories, addExpenseCategory, updateExpenseCategory, archiveExpenseCategory } from '@/data/expense-categories'
import { formatCurrency } from '@/data/dashboard'
import { cn } from '@/lib/utils'

const DEFAULT_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1', '#a855f7', '#0ea5e9', '#e11d48', '#78716c', '#10b981', '#64748b']

export default function ExpenseCategoriesPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(DEFAULT_COLORS[0])

  const categories = useMemo(() => getExpenseCategories(), [])

  const filtered = useMemo(() => {
    if (!search.trim()) return categories
    const q = search.toLowerCase()
    return categories.filter((c) =>
      c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    )
  }, [categories, search])

  const openAdd = () => {
    setEditingId(null)
    setName('')
    setDescription('')
    setColor(DEFAULT_COLORS[0])
    setShowForm(true)
  }

  const openEdit = (id: string) => {
    const cat = categories.find((c) => c.id === id)
    if (!cat) return
    setEditingId(id)
    setName(cat.name)
    setDescription(cat.description)
    setColor(cat.color)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!name.trim()) return
    if (editingId) {
      updateExpenseCategory(editingId, { name, description, color })
    } else {
      const id = `exp-cat-${String(Date.now()).slice(-6)}`
      addExpenseCategory({ id, name, description, color, icon: 'Wallet', active: true })
    }
    setShowForm(false)
    setEditingId(null)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/expenses')} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to Expenses</span>
        </button>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add Category</span>
        </button>
      </div>

      <div className="flex items-start gap-4">
        <div className="size-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center shrink-0">
          <Palette className="size-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Expense Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">{categories.length} categories · {categories.filter((c) => c.active).length} active</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text" placeholder="Search categories..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
        />
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((cat) => (
          <Card key={cat.id} size="sm" className={cn(cat.active ? '' : 'opacity-60')}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color + '20' }}>
                    <Wallet className="size-5" style={{ color: cat.color }} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                    {!cat.active && <Badge variant="outline" className="text-[9px] ml-1 px-1 py-0 h-4">Archived</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => openEdit(cat.id)} className="flex items-center justify-center size-7 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                    <Pencil className="size-3.5" />
                  </button>
                  {cat.active && (
                    <button onClick={() => { archiveExpenseCategory(cat.id); window.location.reload() }} className="flex items-center justify-center size-7 rounded-md hover:bg-muted text-muted-foreground transition-colors" title="Archive">
                      <Archive className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{cat.description}</p>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">{cat.expenseCount} expense{cat.expenseCount !== 1 ? 's' : ''}</span>
                <span className="font-semibold text-foreground">{formatCurrency(cat.totalSpent)}</span>
              </div>
              {cat.lastUsed && (
                <div className="text-[10px] text-muted-foreground mt-1">Last used: {cat.lastUsed}</div>
              )}
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-sm text-muted-foreground">No categories found.</div>
        )}
      </div>

      {/* Add/Edit form dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="bg-background rounded-xl p-6 max-w-sm mx-4 w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-4">{editingId ? 'Edit Category' : 'Add Category'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Category name"
                  autoFocus
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <input
                  type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description"
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Color</label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn('size-8 rounded-full border-2 transition-all', color === c ? 'border-foreground scale-110' : 'border-transparent')}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="size-3.5 text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40">
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
