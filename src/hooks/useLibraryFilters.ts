import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { BookFormat, ReadingStatus } from '@/types'

const VALID_STATUSES: ReadingStatus[] = [
  'want_to_read',
  'currently_reading',
  'finished',
  'dnf',
]

const VALID_FORMATS: BookFormat[] = ['physical', 'ebook', 'audiobook']

function parseStatus(value: string | null): ReadingStatus | null {
  if (!value) return null
  return VALID_STATUSES.includes(value as ReadingStatus)
    ? (value as ReadingStatus)
    : null
}

function parseFormat(value: string | null): BookFormat | null {
  if (!value) return null
  return VALID_FORMATS.includes(value as BookFormat)
    ? (value as BookFormat)
    : null
}

export function useLibraryFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const search = searchParams.get('q') ?? ''
  const status = parseStatus(searchParams.get('status'))
  const format = parseFormat(searchParams.get('format'))

  const hasActiveFilters = useMemo(
    () => Boolean(search || status || format),
    [search, status, format],
  )

  const setSearch = useCallback(
    (q: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (q) next.set('q', q)
        else next.delete('q')
        return next
      })
    },
    [setSearchParams],
  )

  const setStatus = useCallback(
    (s: ReadingStatus | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (s) next.set('status', s)
        else next.delete('status')
        return next
      })
    },
    [setSearchParams],
  )

  const setFormat = useCallback(
    (f: BookFormat | null) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (f) next.set('format', f)
        else next.delete('format')
        return next
      })
    },
    [setSearchParams],
  )

  const clearAll = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  return {
    search,
    status,
    format,
    hasActiveFilters,
    setSearch,
    setStatus,
    setFormat,
    clearAll,
  }
}