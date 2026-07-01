export type BookFormat = 'physical' | 'ebook' | 'audiobook'

export type ReadingStatus =
  | 'want_to_read'
  | 'currently_reading'
  | 'finished'
  | 'dnf'

import type { Tag } from './tag'

export interface Book {
  id: string
  user_id?: string
  collection_id?: string | null
  volume_number?: number | null
  tags?: Tag[]
  title: string
  author: string
  format: BookFormat
  status: ReadingStatus
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

export type CreateBookInput = Omit<
  Book,
  'id' | 'created_at' | 'updated_at' | 'current_progress'
> & {
  current_progress?: number
}

export type UpdateBookInput = Partial<Omit<Book, 'id' | 'created_at'>>