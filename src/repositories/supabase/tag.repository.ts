import type { Tag } from '@/types'
import { getSupabase } from '@/lib/supabase'
import { authService } from '@/services/auth.service'
import { normalizeTagName } from '@/utils/tag-suggestion'
import type { TagRepository } from '../types'

type TagRow = { id: string; user_id: string; name: string; created_at: string }

export const supabaseTagRepository: TagRepository = {
  async getAll(): Promise<Tag[]> {
    const { data, error } = await getSupabase().from('tags').select('*').order('name')
    if (error) throw error
    return (data as TagRow[]).map((r) => ({ id: r.id, user_id: r.user_id, name: r.name }))
  },

  async getByBookId(bookId: string): Promise<Tag[]> {
    const { data: links, error: linkError } = await getSupabase()
      .from('book_tags')
      .select('tag_id')
      .eq('book_id', bookId)
    if (linkError) throw linkError
    if (!links?.length) return []

    const tagIds = links.map((l: { tag_id: string }) => l.tag_id)
    const { data, error } = await getSupabase()
      .from('tags')
      .select('id, name, user_id')
      .in('id', tagIds)
    if (error) throw error

    return (data ?? []).map((row: { id: string; name: string; user_id: string }) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
    }))
  },

  async findOrCreateByNames(names: string[]): Promise<Tag[]> {
    const userId = await authService.requireUserId()
    const normalized = [...new Set(names.map(normalizeTagName).filter(Boolean))]
    const result: Tag[] = []

    for (const name of normalized) {
      const { data: existing } = await getSupabase()
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .eq('name', name)
        .maybeSingle()

      if (existing) {
        result.push(existing as Tag)
        continue
      }

      const { data: created, error } = await getSupabase()
        .from('tags')
        .insert({ user_id: userId, name })
        .select()
        .single()
      if (error) throw error
      result.push(created as Tag)
    }

    return result
  },

  async setBookTags(bookId: string, tagNames: string[]): Promise<Tag[]> {
    await this.clearBookTags(bookId)
    const tags = await this.findOrCreateByNames(tagNames.slice(0, 10))
    if (tags.length === 0) return []

    const { error } = await getSupabase()
      .from('book_tags')
      .insert(tags.map((t) => ({ book_id: bookId, tag_id: t.id })))
    if (error) throw error
    return tags
  },

  async clearBookTags(bookId: string): Promise<void> {
    const { error } = await getSupabase().from('book_tags').delete().eq('book_id', bookId)
    if (error) throw error
  },

  async deleteOrphanTags(): Promise<void> {
    // Orphan cleanup optional in cloud mode
  },
}