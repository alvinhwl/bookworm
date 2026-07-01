import type { Book, ReadingStatus } from '@/types'
import { getSupabase } from '@/lib/supabase'
import { authService } from '@/services/auth.service'
import type { BookRepository } from '../types'
import { fromBookRow, toBookRow, type BookRow } from './mappers'

export const supabaseBookRepository: BookRepository = {
  async getAll(): Promise<Book[]> {
    const { data, error } = await getSupabase()
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as BookRow[]).map(fromBookRow)
  },

  async getById(id: string): Promise<Book | undefined> {
    const { data, error } = await getSupabase()
      .from('books')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? fromBookRow(data as BookRow) : undefined
  },

  async create(book: Book): Promise<string> {
    const userId = await authService.requireUserId()
    const { error } = await getSupabase()
      .from('books')
      .insert(toBookRow(book, userId))
    if (error) throw error
    return book.id
  },

  async update(id: string, changes: Partial<Book>): Promise<void> {
    const { user_id: _u, id: _i, created_at: _c, ...rest } = changes
    const { error } = await getSupabase()
      .from('books')
      .update(rest)
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await getSupabase().from('books').delete().eq('id', id)
    if (error) throw error
  },

  async countByStatus(status: ReadingStatus): Promise<number> {
    const { count, error } = await getSupabase()
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)
    if (error) throw error
    return count ?? 0
  },

  async getCurrentlyReading(): Promise<Book[]> {
    const { data, error } = await getSupabase()
      .from('books')
      .select('*')
      .eq('status', 'currently_reading')
    if (error) throw error
    return (data as BookRow[]).map(fromBookRow)
  },

  async bulkPut(books: Book[]): Promise<void> {
    if (books.length === 0) return
    const userId = await authService.requireUserId()
    const rows = books.map((b) => toBookRow(b, userId))
    const { error } = await getSupabase()
      .from('books')
      .upsert(rows, { onConflict: 'id' })
    if (error) throw error
  },

  async clear(): Promise<void> {
    const userId = await authService.requireUserId()
    const { error } = await getSupabase()
      .from('books')
      .delete()
      .eq('user_id', userId)
    if (error) throw error
  },
}