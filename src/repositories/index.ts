import { isSupabaseEnabled } from '@/lib/supabase'
import { dexieBookRepository } from './dexie/book.repository'
import { dexieReadingLogRepository } from './dexie/reading-log.repository'
import { dexieSettingsRepository } from './dexie/settings.repository'
import { supabaseBookRepository } from './supabase/book.repository'
import { supabaseReadingLogRepository } from './supabase/reading-log.repository'
import { supabaseSettingsRepository } from './supabase/settings.repository'

export type { BookRepository, ReadingLogRepository, SettingsRepository } from './types'

export const bookRepository = isSupabaseEnabled()
  ? supabaseBookRepository
  : dexieBookRepository

export const readingLogRepository = isSupabaseEnabled()
  ? supabaseReadingLogRepository
  : dexieReadingLogRepository

export const settingsRepository = isSupabaseEnabled()
  ? supabaseSettingsRepository
  : dexieSettingsRepository