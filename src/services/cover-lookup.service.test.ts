import { afterEach, describe, expect, it, vi } from 'vitest'
import { coverLookupService, normalizeIsbn } from './cover-lookup.service'

describe('normalizeIsbn', () => {
  it('strips formatting from ISBN-13', () => {
    expect(normalizeIsbn('978-0-14-243723-9')).toBe('9780142437239')
  })

  it('rejects invalid lengths', () => {
    expect(normalizeIsbn('123')).toBeNull()
  })
})

describe('coverLookupService.lookup', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns ISBN cover when HEAD succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (init?.method === 'HEAD' && url.includes('/isbn/9780142437239')) {
          return new Response(null, { status: 200 })
        }
        throw new Error(`Unexpected fetch: ${url}`)
      }),
    )

    const url = await coverLookupService.lookup({
      title: 'Moby Dick',
      author: 'Herman Melville',
      isbn: '978-0-14-243723-9',
    })

    expect(url).toBe('https://covers.openlibrary.org/b/isbn/9780142437239-L.jpg')
  })

  it('falls back to Open Library search', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.includes('/search.json')) {
          return Response.json({
            docs: [{ cover_i: 12345, isbn: ['0000000000'] }],
          })
        }
        if (init?.method === 'HEAD' && url.includes('/id/12345')) {
          return new Response(null, { status: 200 })
        }
        if (init?.method === 'HEAD') {
          return new Response(null, { status: 404 })
        }
        throw new Error(`Unexpected fetch: ${url}`)
      }),
    )

    const url = await coverLookupService.lookup({
      title: 'Test Book',
      author: 'Test Author',
    })

    expect(url).toBe('https://covers.openlibrary.org/b/id/12345-L.jpg')
  })

  it('returns null when nothing matches', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 404 })),
    )

    const url = await coverLookupService.lookup({
      title: 'Unknown',
      author: 'Nobody',
    })

    expect(url).toBeNull()
  })
})