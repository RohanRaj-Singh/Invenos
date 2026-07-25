import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)

  // Redirect if already logged in
  useEffect(() => {
    if (auth.isAuthenticated) navigate('/', { replace: true })
  }, [auth.isAuthenticated, navigate])

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.')
      return
    }

    setLoading(true)
    setError('')

    // Simulate async login for UX
    setTimeout(() => {
      const result = auth.login(username.trim(), password)
      if (result) {
        navigate('/', { replace: true })
      } else {
        setError('Invalid username or password. Please try again.')
        setLoading(false)
      }
    }, 200)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center size-14 rounded-2xl bg-primary mx-auto mb-4">
            <Box className="size-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Invenos</h1>
          <p className="text-sm text-muted-foreground mt-1">Cloud Inventory & POS</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1.5">Username</label>
            <input
              id="username"
              ref={usernameRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full h-10 pl-3 pr-10 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center size-6 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p className="mb-1">Demo credentials:</p>
          <p>Admin: <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">admin</code> / <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">admin</code></p>
          <p>Salesman: <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">saleem</code> / <code className="bg-muted px-1 py-0.5 rounded text-[11px] font-mono">1234</code></p>
        </div>
      </div>
    </div>
  )
}
