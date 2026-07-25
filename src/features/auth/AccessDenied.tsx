import { useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function AccessDenied() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-24 text-sm text-muted-foreground">
      <ShieldAlert className="size-14 text-muted-foreground/30 mb-4" />
      <h2 className="text-lg font-semibold text-foreground mb-1">Access Denied</h2>
      <p className="mb-4">You don't have permission to access this page.</p>
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  )
}
