import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { enabled, user, loading } = useAuth()
  const location = useLocation()

  if (!enabled) return <>{children}</>

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}