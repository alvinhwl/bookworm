import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resetDb } from '@/db'
import { bookRepository } from '@/repositories/book.repository'
import { readingLogRepository } from '@/repositories/reading-log.repository'
import { settingsRepository } from '@/repositories/settings.repository'
import { importExportService } from './import-export.service'
import { bookService } from './book.service'
import { progressService } from './progress.service'
import { createBookInput } from '@/test/factories/book'

let dbName: string

beforeEach(async () => {
  dbName = `test-${crypto.randomUUID()}`
  const testDb = resetDb(dbName)
  await testDb.open()
})

afterEach(async () => {
  const testDb = resetDb(dbName)
  await testDb.delete()
  resetDb('bookworm')
})

describe('ImportExportService round-trip', () => {
  it('exports and imports data with full fidelity', async () => {
    const book = await bookService.create(
      createBookInput({
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        total_pages: 310,
        status: 'currently_reading',
      }),
    )
    await progressService.updateProgress(book.id, 142, 'Chapter 8')

    const exported = await importExportService.export()
    expect(exported.books).toHaveLength(1)
    expect(exported.reading_log).toHaveLength(1)
    expect(exported.books[0].title).toBe('The Hobbit')
    expect(exported.books[0].current_progress).toBe(142)

    await bookRepository.clear()
    await readingLogRepository.clear()
    await settingsRepository.clear()

    const preview = await importExportService.previewImport(exported)
    expect(preview.isValid).toBe(true)
    expect(preview.toAdd).toHaveLength(1)

    const result = await importExportService.executeImport(exported, 'merge')
    expect(result.added).toBe(1)
    expect(result.logsAdded).toBe(1)

    const reimported = await bookRepository.getById(book.id)
    expect(reimported).toBeDefined()
    expect(reimported?.title).toBe('The Hobbit')
    expect(reimported?.author).toBe('J.R.R. Tolkien')
    expect(reimported?.current_progress).toBe(142)

    const logs = await readingLogRepository.getByBookId(book.id)
    expect(logs).toHaveLength(1)
    expect(logs[0].value).toBe(142)
    expect(logs[0].note).toBe('Chapter 8')
  })

  it('merges updates for existing books by id', async () => {
    const book = await bookService.create(
      createBookInput({ title: 'Original Title' }),
    )

    const exported = await importExportService.export()
    exported.books[0].title = 'Updated Title'

    const preview = await importExportService.previewImport(exported)
    expect(preview.toUpdate).toHaveLength(1)
    expect(preview.toAdd).toHaveLength(0)

    const result = await importExportService.executeImport(exported, 'merge')
    expect(result.updated).toBe(1)

    const updated = await bookRepository.getById(book.id)
    expect(updated?.title).toBe('Updated Title')
  })

  it('rejects invalid import files', async () => {
    const invalid = { version: 99, books: 'not-an-array' }
    const preview = await importExportService.previewImport(
      invalid as never,
    )
    expect(preview.isValid).toBe(false)
    expect(preview.errors.length).toBeGreaterThan(0)
  })
})