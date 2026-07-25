import { useMemo, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ColumnDef<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
  sortable?: boolean
  sortValue?: (row: T) => string | number
}

interface ReportTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  pageSize?: number
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (data: T[], query: string) => T[]
  emptyMessage?: string
}

export function ReportTable<T>({
  columns, data, keyExtractor, pageSize = 20,
  searchable, searchPlaceholder, onSearch, emptyMessage,
}: ReportTableProps<T>) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    if (!search || !onSearch) return data
    return onSearch(data, search)
  }, [data, search, onSearch])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.sortValue) return filtered
    return [...filtered].sort((a, b) => {
      const va = col.sortValue!(a)
      const vb = col.sortValue!(b)
      const cmp = va < vb ? -1 : va > vb ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir, columns])

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder={searchPlaceholder || 'Search...'}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-xs outline-none focus:border-ring"
          />
        </div>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                    className={cn(
                      'px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider',
                      col.sortable && 'cursor-pointer hover:text-foreground select-none',
                      col.className,
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {sortKey === col.key && (
                        <span className="text-[9px]">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-sm text-muted-foreground">
                    {emptyMessage || 'No data found.'}
                  </td>
                </tr>
              ) : (
                paged.map((row) => (
                  <tr key={keyExtractor(row)} className="border-b border-border hover:bg-muted/30 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3 text-sm', col.className)}>
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{sorted.length} record{sorted.length !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="flex items-center justify-center size-7 rounded-md border border-border disabled:opacity-30 hover:bg-muted transition-colors"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <span className="tabular-nums">Page {page + 1} of {pages}</span>
          <button
            disabled={page >= pages - 1}
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            className="flex items-center justify-center size-7 rounded-md border border-border disabled:opacity-30 hover:bg-muted transition-colors"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
