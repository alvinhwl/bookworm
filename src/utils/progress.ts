import type { Book } from '@/types'

export function getTotal(book: Book): number | null {
  if (book.format === 'audiobook') {
    return book.total_duration_minutes
  }
  return book.total_pages
}

export function percentComplete(book: Book): number | null {
  const total = getTotal(book)
  if (total == null || total === 0) return null
  if (book.status === 'finished') return 100
  return Math.min(100, Math.round((book.current_progress / total) * 100))
}

export function progressLabel(book: Book, value?: number): string {
  const v = value ?? book.current_progress
  if (book.format === 'audiobook') {
    const hours = Math.floor(v / 60)
    const mins = v % 60
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }
  return `Page ${v}`
}

export function validateProgress(
  book: Book,
  value: number,
): { valid: boolean; error?: string } {
  if (value < 0) {
    return { valid: false, error: 'Progress cannot be negative' }
  }
  const total = getTotal(book)
  if (total != null && value > total) {
    const unit = book.format === 'audiobook' ? 'minutes' : 'pages'
    return {
      valid: false,
      error: `Progress cannot exceed total ${unit} (${total})`,
    }
  }
  return { valid: true }
}