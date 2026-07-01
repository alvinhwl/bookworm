import type { BookFormat, ReadingStatus } from './book'

export type VolumeMode = 'named' | 'numbered'

export interface Collection {
  id: string
  user_id?: string
  name: string
  author: string
  description: string
  cover_url: string | null
  volume_mode: VolumeMode
  expected_volume_count: number | null
  created_at: string
  updated_at: string
}

export interface CreateVolumeInput {
  title: string
  volume_number?: number | null
  format?: BookFormat
  status?: ReadingStatus
  total_pages?: number | null
  total_duration_minutes?: number | null
}

export interface CreateCollectionInput {
  name: string
  author: string
  description?: string
  cover_url?: string | null
  volume_mode: VolumeMode
  expected_volume_count?: number | null
  volumes: CreateVolumeInput[]
}

export interface CollectionStats {
  total: number
  finished: number
  percent: number
}

export type CollectionDeleteMode = 'keep_books' | 'delete_all'