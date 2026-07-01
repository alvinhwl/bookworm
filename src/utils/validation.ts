import { z } from 'zod'
import { EXPORT_SCHEMA_VERSION } from '@/types'

export const bookFormatSchema = z.enum(['physical', 'ebook', 'audiobook'])
export const readingStatusSchema = z.enum([
  'want_to_read',
  'currently_reading',
  'finished',
  'dnf',
])

export const bookSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  author: z.string().min(1),
  format: bookFormatSchema,
  status: readingStatusSchema,
  cover_url: z.string().nullable(),
  isbn: z.string().nullable(),
  published_year: z.number().nullable(),
  total_pages: z.number().nullable(),
  total_duration_minutes: z.number().nullable(),
  current_progress: z.number(),
  notes: z.string(),
  started_at: z.string().nullable(),
  finished_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const readingLogEntrySchema = z.object({
  id: z.string().min(1),
  book_id: z.string().min(1),
  value: z.number(),
  note: z.string().nullable(),
  logged_at: z.string(),
})

export const sortOptionSchema = z.object({
  field: z.enum(['title', 'author', 'created_at', 'finished_at', 'progress']),
  direction: z.enum(['asc', 'desc']),
})

export const settingsSchema = z.object({
  annual_goal: z.number().nullable(),
  default_view: z.enum(['list', 'grid']),
  default_sort: sortOptionSchema,
  theme: z.enum(['light', 'dark', 'system']),
})

export const exportBundleSchema = z.object({
  version: z.literal(EXPORT_SCHEMA_VERSION),
  exported_at: z.string(),
  books: z.array(bookSchema),
  reading_log: z.array(readingLogEntrySchema),
  settings: settingsSchema,
})

export function validateBookForm(data: {
  title: string
  author: string
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  if (!data.title.trim()) errors.title = 'Title is required'
  if (!data.author.trim()) errors.author = 'Author is required'
  return { valid: Object.keys(errors).length === 0, errors }
}