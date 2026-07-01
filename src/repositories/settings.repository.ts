import type { UserSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'
import { db } from '@/db'

const SETTINGS_ID = 'user' as const

export const settingsRepository = {
  async get(): Promise<UserSettings> {
    const existing = await db.settings.get(SETTINGS_ID)
    if (existing) return existing
    return { ...DEFAULT_SETTINGS }
  },

  async save(settings: UserSettings): Promise<void> {
    await db.settings.put({ ...settings, id: SETTINGS_ID })
  },

  async clear(): Promise<void> {
    await db.settings.clear()
  },
}