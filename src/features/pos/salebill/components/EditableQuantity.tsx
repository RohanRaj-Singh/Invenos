import { useState, useRef, useEffect } from 'react'

interface EditableQuantityProps {
  value: number
  onChange: (delta: number) => void
  step: string
}

export default function EditableQuantity({ value, onChange, step }: EditableQuantityProps) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
  useEffect(() => { if (!editing) setInput(String(value)) }, [value, editing])

  const handleSave = () => {
    const val = parseFloat(input)
    if (!isNaN(val) && val > 0) {
      const diff = val - value
      if (diff !== 0) onChange(diff)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input ref={inputRef} type="number" value={input}
        onChange={(e) => setInput(e.target.value)} onBlur={handleSave}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false) }}
        className="w-16 h-7 text-center text-sm font-bold rounded border border-primary bg-background outline-none tabular-nums"
        min="0.001" step={step} autoFocus />
    )
  }

  return (
    <button onClick={() => { setEditing(true); setInput(String(value)) }}
      className="w-10 h-7 flex items-center justify-center text-center text-sm font-semibold tabular-nums hover:bg-muted/50 rounded transition-colors">
      {value}
    </button>
  )
}
