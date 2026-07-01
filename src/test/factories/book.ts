import type { Book, CreateBookInput } from '@/types'
import { generateId } from '@/utils/id'
import { nowISO } from '@/utils/dates'

export function createBookInput(
  overrides: Partial<CreateBookInput> = {},
): CreateBookInput {
  return {
    title: 'Test Book',
    author: 'Test Author',
    format: 'physical',
    status: 'want_to_read',
    cover_url: null,
    isbn: null,
    published_year: null,
    total_pages: 300,
    total_duration_minutes: null,
    notes: '',
    started_at: null,
    finished_at: null,
    ...overrides,
  }
}

export function createBook(overrides: Partial<Book> = {}): Book {
  const now = nowISO()
  return {
    id: generateId(),
    title: 'Test Book',
    author: 'Test Author',
    format: 'physical',
    status: 'want_to_read',
    cover_url: null,
    isbn: null,
    published_year: null,
    total_pages: 300,
    total_duration_minutes: null,
    current_progress: 0,
    notes: '',
    started_at: null,
    finished_at: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  }
}