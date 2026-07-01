import { isSupabaseEnabled } from '@/lib/supabase'
import { dexieBookRepository } from './dexie/book.repository'
import { dexieCollectionRepository } from './dexie/collection.repository'
import { dexieReadingLogRepository } from './dexie/reading-log.repository'
import { dexieSettingsRepository } from './dexie/settings.repository'
import { dexieTagRepository } from './dexie/tag.repository'
import { supabaseBookRepository } from './supabase/book.repository'
import { supabaseCollectionRepository } from './supabase/collection.repository'
import { supabaseReadingLogRepository } from './supabase/reading-log.repository'
import { supabaseSettingsRepository } from './supabase/settings.repository'
import { supabaseTagRepository } from './supabase/tag.repository'

export type {
  BookRepository,
  CollectionRepository,
  ReadingLogRepository,
  SettingsRepository,
  TagRepository,
} from './types'

export const bookRepository = isSupabaseEnabled()
  ? supabaseBookRepository
  : dexieBookRepository

export const readingLogRepository = isSupabaseEnabled()
  ? supabaseReadingLogRepository
  : dexieReadingLogRepository

export const settingsRepository = isSupabaseEnabled()
  ? supabaseSettingsRepository
  : dexieSettingsRepository

export const collectionRepository = isSupabaseEnabled()
  ? supabaseCollectionRepository
  : dexieCollectionRepository

export const tagRepository = isSupabaseEnabled()
  ? supabaseTagRepository
  : dexieTagRepository