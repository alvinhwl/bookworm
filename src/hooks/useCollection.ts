import { useCallback, useEffect, useState } from 'react'
import type { Book, Collection, CollectionStats } from '@/types'
import { collectionService } from '@/services'

export function useCollection(id: string | undefined) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [volumes, setVolumes] = useState<Book[]>([])
  const [stats, setStats] = useState<CollectionStats | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!id) {
      setCollection(null)
      setVolumes([])
      setStats(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const [c, v, s] = await Promise.all([
        collectionService.getById(id),
        collectionService.getVolumes(id),
        collectionService.getStats(id),
      ])
      setCollection(c)
      setVolumes(v)
      setStats(s)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { collection, volumes, stats, loading, refresh }
}