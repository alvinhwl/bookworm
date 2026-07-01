import type { UserSettings } from '@/types'
import { getSupabase } from '@/lib/supabase'
import { authService } from '@/services/auth.service'
import type { SettingsRepository } from '../types'
import { fromSettingsRow, toSettingsRow, type SettingsRow } from './mappers'

export const supabaseSettingsRepository: SettingsRepository = {
  async get(): Promise<UserSettings> {
    const userId = await authService.requireUserId()
    const { data, error } = await getSupabase()
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return fromSettingsRow(data as SettingsRow | null)
  },

  async save(settings: UserSettings): Promise<void> {
    const userId = await authService.requireUserId()
    const { error } = await getSupabase()
      .from('user_settings')
      .upsert(toSettingsRow(settings, userId), { onConflict: 'user_id' })
    if (error) throw error
  },

  async clear(): Promise<void> {
    const userId = await authService.requireUserId()
    const { error } = await getSupabase()
      .from('user_settings')
      .delete()
      .eq('user_id', userId)
    if (error) throw error
  },
}