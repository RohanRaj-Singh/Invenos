interface SessionCounterProps {
  count: number
}

export default function SessionCounter({ count }: SessionCounterProps) {
  if (count === 0) return null

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      <span>{count} added</span>
      <span className="text-[10px]">🟢</span>
    </span>
  )
}
