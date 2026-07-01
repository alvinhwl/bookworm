import { getSupabase, isSupabaseEnabled } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export const authService = {
  isEnabled(): boolean {
    return isSupabaseEnabled()
  },

  async getSession(): Promise<Session | null> {
    if (!isSupabaseEnabled()) return null
    const { data } = await getSupabase().auth.getSession()
    return data.session
  },

  async getUser(): Promise<User | null> {
    const session = await this.getSession()
    return session?.user ?? null
  },

  async getUserId(): Promise<string | null> {
    const user = await this.getUser()
    return user?.id ?? null
  },

  async requireUserId(): Promise<string> {
    const id = await this.getUserId()
    if (!id) throw new Error('Not authenticated')
    return id
  },

  async signUp(email: string, password: string) {
    const { data, error } = await getSupabase().auth.signUp({ email, password })
    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await getSupabase().auth.signOut()
    if (error) throw error
  },

  async resetPassword(email: string) {
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo,
    })
    if (error) throw error
  },

  async updatePassword(password: string) {
    const { error } = await getSupabase().auth.updateUser({ password })
    if (error) throw error
  },

  onAuthStateChange(
    callback: (event: string, session: Session | null) => void,
  ) {
    return getSupabase().auth.onAuthStateChange(callback)
  },
}