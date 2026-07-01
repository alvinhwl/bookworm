import type { ReadingLogEntry } from '@/types'
import { getSupabase } from '@/lib/supabase'
import { authService } from '@/services/auth.service'
import type { ReadingLogRepository } from '../types'
import { fromLogRow, toLogRow, type ReadingLogRow } from './mappers'

export const supabaseReadingLogRepository: ReadingLogRepository = {
  async getByBookId(bookId: string, limit?: number): Promise<ReadingLogEntry[]> {
    let query = getSupabase()
      .from('reading_log')
      .select('*')
      .eq('book_id', bookId)
      .order('logged_at', { ascending: false })

    if (limit != null) {
      query = query.limit(limit)
    }

    const { data, error } = await query
    if (error) throw error
    return (data as ReadingLogRow[]).map(fromLogRow)
  },

  async create(entry: ReadingLogEntry): Promise<string> {
    const userId = await authService.requireUserId()
    const { error } = await getSupabase()
      .from('reading_log')
      .insert(toLogRow(entry, userId))
    if (error) throw error
    return entry.id
  },

  async deleteByBookId(bookId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('reading_log')
      .delete()
      .eq('book_id', bookId)
    if (error) throw error
  },

  async bulkPut(entries: ReadingLogEntry[]): Promise<void> {
    if (entries.length === 0) return
    const userId = await authService.requireUserId()
    const rows = entries.map((e) => toLogRow(e, userId))
    const { error } = await getSupabase()
      .from('reading_log')
      .upsert(rows, { onConflict: 'id' })
    if (error) throw error
  },

  async getAll(): Promise<ReadingLogEntry[]> {
    const { data, error } = await getSupabase()
      .from('reading_log')
      .select('*')
      .order('logged_at', { ascending: false })
    if (error) throw error
    return (data as ReadingLogRow[]).map(fromLogRow)
  },

  async clear(): Promise<void> {
    const userId = await authService.requireUserId()
    const { error } = await getSupabase()
      .from('reading_log')
      .delete()
      .eq('user_id', userId)
    if (error) throw error
  },
}