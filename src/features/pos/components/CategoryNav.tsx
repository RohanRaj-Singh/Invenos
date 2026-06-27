import { cn } from '@/lib/utils'
import { posCategories } from '@/data/pos'

interface CategoryNavProps {
  active: string
  onChange: (cat: string) => void
}

const iconLabels: Record<string, string> = {
  Grid3x3: '⊞',
  Pill: '💊',
  Syringe: '💉',
  Sparkles: '✨',
  Droplets: '💧',
  Smartphone: '📱',
  Zap: '⚡',
  Apple: '🍎',
}

export default function CategoryNav({ active, onChange }: CategoryNavProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
      {posCategories.map((cat) => {
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
            )}
          >
            <span className="text-sm leading-none">{iconLabels[cat.icon] || '📦'}</span>
            <span>{cat.name}</span>
          </button>
        )
      })}
    </div>
  )
}
