import { db } from '@/db'
import { getSupabase, isSupabaseEnabled } from '@/lib/supabase'
import { authService } from './auth.service'
import { dexieBookRepository } from '@/repositories/dexie/book.repository'
import { dexieReadingLogRepository } from '@/repositories/dexie/reading-log.repository'
import { dexieSettingsRepository } from '@/repositories/dexie/settings.repository'
import { supabaseBookRepository } from '@/repositories/supabase/book.repository'
import { supabaseReadingLogRepository } from '@/repositories/supabase/reading-log.repository'
import { supabaseSettingsRepository } from '@/repositories/supabase/settings.repository'
import { coverService } from './cover.service'
import type { Book } from '@/types'

const DISMISS_KEY = 'bookworm_migration_dismissed'

export interface MigrationResult {
  booksAdded: number
  booksSkipped: number
  logsAdded: number
}

export const migrationService = {
  async hasLocalV1Data(): Promise<boolean> {
    try {
      await db.open()
      const count = await db.books.count()
      return count > 0
    } catch {
      return false
    }
  },

  isDismissed(): boolean {
    return localStorage.getItem(DISMISS_KEY) === 'true'
  },

  dismiss(): void {
    localStorage.setItem(DISMISS_KEY, 'true')
  },

  async hasMigrated(): Promise<boolean> {
    if (!isSupabaseEnabled()) return false
    const userId = await authService.getUserId()
    if (!userId) return false

    const { data, error } = await getSupabase()
      .from('migration_runs')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) return false
    return Boolean(data)
  },

  async shouldOfferMigration(): Promise<boolean> {
    if (!isSupabaseEnabled()) return false
    if (this.isDismissed()) return false
    if (await this.hasMigrated()) return false
    return this.hasLocalV1Data()
  },

  async migrate(): Promise<MigrationResult> {
    if (!isSupabaseEnabled()) {
      throw new Error('Migration requires Supabase')
    }

    const userId = await authService.requireUserId()
    if (await this.hasMigrated()) {
      return { booksAdded: 0, booksSkipped: 0, logsAdded: 0 }
    }

    const [localBooks, localLogs, localSettings] = await Promise.all([
      dexieBookRepository.getAll(),
      dexieReadingLogRepository.getAll(),
      dexieSettingsRepository.get(),
    ])

    const { data: existingBooks } = await getSupabase()
      .from('books')
      .select('id')
      .eq('user_id', userId)

    const existingIds = new Set((existingBooks ?? []).map((b: { id: string }) => b.id))

    let booksAdded = 0
    let booksSkipped = 0
    const booksToUpsert: Book[] = []

    for (const book of localBooks) {
      if (existingIds.has(book.id)) {
        booksSkipped++
        continue
      }

      let coverUrl = book.cover_url
      if (coverUrl?.startsWith('data:image/')) {
        try {
          coverUrl = await coverService.uploadDataUrl(coverUrl, userId, book.id)
        } catch {
          // keep data URL if upload fails
        }
      }

      booksToUpsert.push({ ...book, cover_url: coverUrl, user_id: userId })
      booksAdded++
    }

    if (booksToUpsert.length > 0) {
      await supabaseBookRepository.bulkPut(booksToUpsert)
    }

    const cloudBookIds = new Set([
      ...existingIds,
      ...booksToUpsert.map((b) => b.id),
    ])
    const newLogs = localLogs.filter((log) => cloudBookIds.has(log.book_id))

    if (newLogs.length > 0) {
      await supabaseReadingLogRepository.bulkPut(newLogs)
    }

    await supabaseSettingsRepository.save(localSettings)

    const { error: migrationError } = await getSupabase().from('migration_runs').insert({
      user_id: userId,
      books_added: booksAdded,
      logs_added: newLogs.length,
    })

    if (migrationError) throw migrationError

    return {
      booksAdded,
      booksSkipped,
      logsAdded: newLogs.length,
    }
  },
}