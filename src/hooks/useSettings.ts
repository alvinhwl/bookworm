import { useCallback, useEffect, useState } from 'react'
import type { UserSettings } from '@/types'
import { settingsService } from '@/services'

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await settingsService.get()
      setSettings(data)
    } finally {
      setLoading(false)
    }
  }, [])

  const update = useCallback(
    async (partial: Partial<Omit<UserSettings, 'id'>>) => {
      const updated = await settingsService.update(partial)
      setSettings(updated)
      return updated
    },
    [],
  )

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { settings, loading, update, refresh }
}