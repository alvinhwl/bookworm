import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { resetDb } from '@/db'
import { bookRepository } from './book.repository'
import { createBook } from '@/test/factories/book'

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

describe('BookRepository', () => {
  it('creates and retrieves a book', async () => {
    const book = createBook({ title: 'Dune', author: 'Frank Herbert' })
    await bookRepository.create(book)

    const found = await bookRepository.getById(book.id)
    expect(found).toBeDefined()
    expect(found?.title).toBe('Dune')
    expect(found?.author).toBe('Frank Herbert')
  })

  it('returns all books', async () => {
    const book1 = createBook({ title: 'Book One' })
    const book2 = createBook({ title: 'Book Two' })
    await bookRepository.create(book1)
    await bookRepository.create(book2)

    const all = await bookRepository.getAll()
    expect(all).toHaveLength(2)
  })

  it('updates a book', async () => {
    const book = createBook()
    await bookRepository.create(book)
    await bookRepository.update(book.id, { title: 'Updated Title' })

    const found = await bookRepository.getById(book.id)
    expect(found?.title).toBe('Updated Title')
  })

  it('deletes a book', async () => {
    const book = createBook()
    await bookRepository.create(book)
    await bookRepository.delete(book.id)

    const found = await bookRepository.getById(book.id)
    expect(found).toBeUndefined()
  })

  it('counts books by status', async () => {
    await bookRepository.create(
      createBook({ status: 'currently_reading' }),
    )
    await bookRepository.create(
      createBook({ status: 'currently_reading' }),
    )
    await bookRepository.create(createBook({ status: 'finished' }))

    const count = await bookRepository.countByStatus('currently_reading')
    expect(count).toBe(2)
  })

  it('gets currently reading books', async () => {
    await bookRepository.create(
      createBook({ status: 'currently_reading', title: 'Active' }),
    )
    await bookRepository.create(
      createBook({ status: 'want_to_read', title: 'Queued' }),
    )

    const reading = await bookRepository.getCurrentlyReading()
    expect(reading).toHaveLength(1)
    expect(reading[0].title).toBe('Active')
  })
})