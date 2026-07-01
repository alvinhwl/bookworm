import type { Book, ReadingLogEntry, SortOption, UserSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'

export type BookRow = {
  id: string
  user_id: string
  collection_id: string | null
  volume_number: number | null
  title: string
  author: string
  format: Book['format']
  status: Book['status']
  cover_url: string | null
  isbn: string | null
  published_year: number | null
  total_pages: number | null
  total_duration_minutes: number | null
  current_progress: number
  notes: string
  started_at: string | null
  finished_at: string | null
  created_at: string
  updated_at: string
}

export type ReadingLogRow = {
  id: string
  user_id: string
  book_id: string
  value: number
  note: string | null
  logged_at: string
}

export type SettingsRow = {
  user_id: string
  annual_goal: number | null
  default_view: UserSettings['default_view']
  default_sort: SortOption
  theme: UserSettings['theme']
  updated_at: string
}

export function toBookRow(book: Book, userId: string): BookRow {
  return {
    id: book.id,
    user_id: userId,
    collection_id: book.collection_id ?? null,
    volume_number: book.volume_number ?? null,
    title: book.title,
    author: book.author,
    format: book.format,
    status: book.status,
    cover_url: book.cover_url,
    isbn: book.isbn,
    published_year: book.published_year,
    total_pages: book.total_pages,
    total_duration_minutes: book.total_duration_minutes,
    current_progress: book.current_progress,
    notes: book.notes,
    started_at: book.started_at,
    finished_at: book.finished_at,
    created_at: book.created_at,
    updated_at: book.updated_at,
  }
}

export function fromBookRow(row: BookRow): Book {
  return {
    id: row.id,
    user_id: row.user_id,
    collection_id: row.collection_id,
    volume_number: row.volume_number,
    title: row.title,
    author: row.author,
    format: row.format,
    status: row.status,
    cover_url: row.cover_url,
    isbn: row.isbn,
    published_year: row.published_year,
    total_pages: row.total_pages,
    total_duration_minutes: row.total_duration_minutes,
    current_progress: row.current_progress,
    notes: row.notes,
    started_at: row.started_at,
    finished_at: row.finished_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export function toLogRow(entry: ReadingLogEntry, userId: string): ReadingLogRow {
  return {
    id: entry.id,
    user_id: userId,
    book_id: entry.book_id,
    value: entry.value,
    note: entry.note,
    logged_at: entry.logged_at,
  }
}

export function fromLogRow(row: ReadingLogRow): ReadingLogEntry {
  return {
    id: row.id,
    user_id: row.user_id,
    book_id: row.book_id,
    value: row.value,
    note: row.note,
    logged_at: row.logged_at,
  }
}

export function fromSettingsRow(row: SettingsRow | null): UserSettings {
  if (!row) return { ...DEFAULT_SETTINGS }
  return {
    id: 'user',
    annual_goal: row.annual_goal,
    default_view: row.default_view,
    default_sort: row.default_sort,
    theme: row.theme,
  }
}

export function toSettingsRow(settings: UserSettings, userId: string): SettingsRow {
  return {
    user_id: userId,
    annual_goal: settings.annual_goal,
    default_view: settings.default_view,
    default_sort: settings.default_sort,
    theme: settings.theme,
    updated_at: new Date().toISOString(),
  }
}