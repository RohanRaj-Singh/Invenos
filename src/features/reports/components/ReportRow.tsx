interface ReportRowProps {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
  bold?: boolean
  large?: boolean
}

export function ReportRow({ label, value, positive, negative, bold, large }: ReportRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? 'font-bold' : 'font-semibold'} ${large ? 'text-lg' : ''} ${positive ? 'text-emerald-600 dark:text-emerald-400' : ''} ${negative ? 'text-red-600 dark:text-red-400' : ''}`}>
        {value}
      </span>
    </div>
  )
}
