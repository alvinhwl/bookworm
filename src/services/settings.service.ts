import type { UserSettings } from '@/types'
import { settingsRepository } from '@/repositories'

export const settingsService = {
  async get(): Promise<UserSettings> {
    return settingsRepository.get()
  },

  async update(
    partial: Partial<Omit<UserSettings, 'id'>>,
  ): Promise<UserSettings> {
    const current = await settingsRepository.get()
    const updated: UserSettings = { ...current, ...partial, id: 'user' }
    await settingsRepository.save(updated)
    return updated
  },

  async setAnnualGoal(goal: number | null): Promise<UserSettings> {
    return this.update({ annual_goal: goal })
  },
}