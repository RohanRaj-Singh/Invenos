import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface SummaryCardDef {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
  subtitle?: string
}

interface SummaryCardsProps {
  cards: SummaryCardDef[]
  columns?: 2 | 3 | 4 | 5
}

export function SummaryCards({ cards, columns = 4 }: SummaryCardsProps) {
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-5',
  }

  return (
    <div className={cn('grid gap-3', gridClass[columns])}>
      {cards.map((card, i) => (
        <Card key={`${card.label}-${i}`} size="sm">
          <CardContent className="p-4">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{card.label}</div>
            <div className={cn(
              'text-xl font-bold tracking-tight',
              card.positive && 'text-emerald-600 dark:text-emerald-400',
              card.negative && 'text-red-600 dark:text-red-400',
            )}>
              {card.value}
            </div>
            {card.subtitle && <div className="text-xs text-muted-foreground mt-1">{card.subtitle}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
