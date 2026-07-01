import type {
  Book,
  ExportBundle,
  ImportMode,
  ImportPreview,
  ImportResult,
  ReadingLogEntry,
  UserSettings,
} from '@/types'
import { EXPORT_SCHEMA_VERSION } from '@/types'
import { bookRepository, readingLogRepository, settingsRepository } from '@/repositories'
import { db } from '@/db'
import { nowISO } from '@/utils/dates'
import { exportBundleSchema } from '@/utils/validation'
import { BookwormError } from './errors'
function booksEqual(a: Book, b: Book): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export const importExportService = {
  async export(): Promise<ExportBundle> {
    const [books, reading_log, settings] = await Promise.all([
      bookRepository.getAll(),
      readingLogRepository.getAll(),
      settingsRepository.get(),
    ])

    const { id: _id, ...settingsWithoutId } = settings

    return {
      version: EXPORT_SCHEMA_VERSION,
      exported_at: nowISO(),
      books,
      reading_log,
      settings: settingsWithoutId,
    }
  },

  async downloadExport(): Promise<void> {
    const bundle = await this.export()
    const date = new Date().toISOString().slice(0, 10)
    const { downloadJson } = await import('@/utils/download')
    downloadJson(`bookworm-export-${date}.json`, bundle)
  },

  async parseImportFile(file: File): Promise<ExportBundle> {
    const text = await file.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new BookwormError('IMPORT_INVALID', 'Invalid JSON file')
    }

    const result = exportBundleSchema.safeParse(parsed)
    if (!result.success) {
      const errors = result.error.issues.map((i) => i.message)
      throw new BookwormError(
        'IMPORT_INVALID',
        errors[0] ?? 'Invalid import file',
      )
    }

    return result.data as ExportBundle
  },

  async previewImport(bundle: ExportBundle): Promise<ImportPreview> {
    const errors: string[] = []
    const validation = exportBundleSchema.safeParse(bundle)

    if (!validation.success) {
      return {
        toAdd: [],
        toUpdate: [],
        unchanged: 0,
        logEntriesToAdd: [],
        logEntriesToUpdate: [],
        isValid: false,
        errors: validation.error.issues.map((i) => i.message),
      }
    }

    const [existingBooks, existingLogs] = await Promise.all([
      bookRepository.getAll(),
      readingLogRepository.getAll(),
    ])

    const existingBookMap = new Map(existingBooks.map((b) => [b.id, b]))
    const existingLogMap = new Map(existingLogs.map((l) => [l.id, l]))

    const toAdd: Book[] = []
    const toUpdate: { existing: Book; incoming: Book }[] = []
    let unchanged = 0

    for (const incoming of bundle.books) {
      const existing = existingBookMap.get(incoming.id)
      if (!existing) {
        toAdd.push(incoming)
      } else if (booksEqual(existing, incoming)) {
        unchanged++
      } else {
        toUpdate.push({ existing, incoming })
      }
    }

    const logEntriesToAdd: ReadingLogEntry[] = []
    const logEntriesToUpdate: ReadingLogEntry[] = []

    for (const entry of bundle.reading_log) {
      const existing = existingLogMap.get(entry.id)
      if (!existing) {
        logEntriesToAdd.push(entry)
      } else if (JSON.stringify(existing) !== JSON.stringify(entry)) {
        logEntriesToUpdate.push(entry)
      }
    }

    const bookIds = new Set(bundle.books.map((b) => b.id))
    for (const entry of bundle.reading_log) {
      if (!bookIds.has(entry.book_id)) {
        errors.push(`Reading log entry references unknown book: ${entry.book_id}`)
      }
    }

    return {
      toAdd,
      toUpdate,
      unchanged,
      logEntriesToAdd,
      logEntriesToUpdate,
      isValid: errors.length === 0,
      errors,
    }
  },

  async executeImport(
    bundle: ExportBundle,
    mode: ImportMode,
  ): Promise<ImportResult> {
    const preview = await this.previewImport(bundle)
    if (!preview.isValid) {
      throw new BookwormError(
        'IMPORT_INVALID',
        preview.errors.join('; ') || 'Invalid import data',
      )
    }

    if (mode === 'replace') {
      await db.transaction('rw', db.books, db.readingLog, db.settings, async () => {
        await bookRepository.clear()
        await readingLogRepository.clear()
        await bookRepository.bulkPut(bundle.books)
        await readingLogRepository.bulkPut(bundle.reading_log)
        const settings: UserSettings = { id: 'user', ...bundle.settings }
        await settingsRepository.save(settings)
      })

      return {
        added: bundle.books.length,
        updated: 0,
        skipped: 0,
        logsAdded: bundle.reading_log.length,
      }
    }

    let added = 0
    let updated = 0
    const skipped = preview.unchanged

    await db.transaction('rw', db.books, db.readingLog, db.settings, async () => {
      for (const book of preview.toAdd) {
        await bookRepository.create(book)
        added++
      }
      for (const { incoming } of preview.toUpdate) {
        await bookRepository.update(incoming.id, incoming)
        updated++
      }

      const allLogs = [...preview.logEntriesToAdd, ...preview.logEntriesToUpdate]
      if (allLogs.length > 0) {
        await readingLogRepository.bulkPut(allLogs)
      }

      const currentSettings = await settingsRepository.get()
      const mergedSettings: UserSettings = {
        id: 'user',
        annual_goal: bundle.settings.annual_goal ?? currentSettings.annual_goal,
        default_view: bundle.settings.default_view ?? currentSettings.default_view,
        default_sort: bundle.settings.default_sort ?? currentSettings.default_sort,
        theme: bundle.settings.theme ?? currentSettings.theme,
      }
      await settingsRepository.save(mergedSettings)
    })

    return {
      added,
      updated,
      skipped,
      logsAdded: preview.logEntriesToAdd.length + preview.logEntriesToUpdate.length,
    }
  },
}