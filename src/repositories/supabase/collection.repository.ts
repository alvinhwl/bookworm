import type { Collection } from '@/types'
import { getSupabase } from '@/lib/supabase'
import { authService } from '@/services/auth.service'
import type { CollectionRepository } from '../types'

type CollectionRow = {
  id: string
  user_id: string
  name: string
  author: string
  description: string
  cover_url: string | null
  volume_mode: Collection['volume_mode']
  expected_volume_count: number | null
  created_at: string
  updated_at: string
}

function fromRow(row: CollectionRow): Collection {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    author: row.author,
    description: row.description,
    cover_url: row.cover_url,
    volume_mode: row.volume_mode,
    expected_volume_count: row.expected_volume_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function toRow(collection: Collection, userId: string): CollectionRow {
  return {
    id: collection.id,
    user_id: userId,
    name: collection.name,
    author: collection.author,
    description: collection.description,
    cover_url: collection.cover_url,
    volume_mode: collection.volume_mode,
    expected_volume_count: collection.expected_volume_count,
    created_at: collection.created_at,
    updated_at: collection.updated_at,
  }
}

export const supabaseCollectionRepository: CollectionRepository = {
  async getAll(): Promise<Collection[]> {
    const { data, error } = await getSupabase()
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data as CollectionRow[]).map(fromRow)
  },

  async getById(id: string): Promise<Collection | undefined> {
    const { data, error } = await getSupabase()
      .from('collections')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? fromRow(data as CollectionRow) : undefined
  },

  async create(collection: Collection): Promise<string> {
    const userId = await authService.requireUserId()
    const { error } = await getSupabase()
      .from('collections')
      .insert(toRow(collection, userId))
    if (error) throw error
    return collection.id
  },

  async update(id: string, changes: Partial<Collection>): Promise<void> {
    const { id: _i, user_id: _u, created_at: _c, ...rest } = changes
    const { error } = await getSupabase().from('collections').update(rest).eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const { error } = await getSupabase().from('collections').delete().eq('id', id)
    if (error) throw error
  },

  async clear(): Promise<void> {
    const userId = await authService.requireUserId()
    const { error } = await getSupabase()
      .from('collections')
      .delete()
      .eq('user_id', userId)
    if (error) throw error
  },
}