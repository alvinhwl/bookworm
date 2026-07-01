import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { BookFormat, ReadingStatus } from '@/types'
import type { LibraryView } from '@/components/library/LibraryViewToggle'

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
  const view = (searchParams.get('view') as LibraryView) || 'all'
  const tags = useMemo(
    () => (searchParams.get('tags') ?? '').split(',').filter(Boolean),
    [searchParams],
  )

  const hasActiveFilters = useMemo(
    () => Boolean(search || status || format || tags.length > 0 || view !== 'all'),
    [search, status, format, tags, view],
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

  const setView = useCallback(
    (v: LibraryView) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (v === 'all') next.delete('view')
        else next.set('view', v)
        return next
      })
    },
    [setSearchParams],
  )

  const toggleTag = useCallback(
    (tag: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        const current = (next.get('tags') ?? '').split(',').filter(Boolean)
        const updated = current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag]
        if (updated.length) next.set('tags', updated.join(','))
        else next.delete('tags')
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
    view,
    tags,
    hasActiveFilters,
    setSearch,
    setStatus,
    setFormat,
    setView,
    toggleTag,
    clearAll,
  }
}