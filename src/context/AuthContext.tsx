import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { authService } from '@/services/auth.service'
import { isSupabaseEnabled } from '@/lib/supabase'

interface AuthContextValue {
  enabled: boolean
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const enabled = isSupabaseEnabled()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }

    authService.getSession().then((s) => {
      setSession(s)
      setLoading(false)
    })

    const { data } = authService.onAuthStateChange((_event, s) => {
      setSession(s)
      setLoading(false)
    })

    return () => data.subscription.unsubscribe()
  }, [enabled])

  const signIn = useCallback(async (email: string, password: string) => {
    const { session: s } = await authService.signIn(email, password)
    setSession(s)
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { session: s } = await authService.signUp(email, password)
    setSession(s)
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setSession(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email)
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    await authService.updatePassword(password)
  }, [])

  const value = useMemo(
    () => ({
      enabled,
      user: session?.user ?? null,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
    }),
    [enabled, session, loading, signIn, signUp, signOut, resetPassword, updatePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}