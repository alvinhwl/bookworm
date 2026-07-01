import { useCallback, useEffect, useState } from 'react'
import type { ReadingLogEntry } from '@/types'
import { progressService } from '@/services'

export function useReadingLog(bookId: string | undefined, limit = 5) {
  const [entries, setEntries] = useState<ReadingLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!bookId) {
      setEntries([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await progressService.getRecentLogs(bookId, limit)
      setEntries(data)
    } finally {
      setLoading(false)
    }
  }, [bookId, limit])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { entries, loading, refresh }
}