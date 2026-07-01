import { useCallback, useEffect, useState } from 'react'
import type { Book } from '@/types'
import { bookService } from '@/services'

export function useBook(id: string | undefined) {
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refresh = useCallback(async () => {
    if (!id) {
      setBook(null)
      setLoading(false)
      return
    }
    try {
      setError(null)
      setLoading(true)
      const data = await bookService.getById(id)
      setBook(data)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { book, loading, error, refresh }
}