import { useCallback, useEffect, useState } from 'react'
import type { Collection } from '@/types'
import { collectionService } from '@/services'

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      setCollections(await collectionService.getAll())
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { collections, loading, error, refresh }
}