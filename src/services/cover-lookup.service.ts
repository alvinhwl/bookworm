export type CoverLookupInput = {
  title?: string
  author?: string
  isbn?: string | null
}

const OPEN_LIBRARY_SEARCH = 'https://openlibrary.org/search.json'
const OPEN_LIBRARY_COVERS = 'https://covers.openlibrary.org/b'

type SearchDoc = {
  cover_i?: number
  isbn?: string[]
}

export function normalizeIsbn(isbn: string | null | undefined): string | null {
  if (!isbn) return null
  const cleaned = isbn.replace(/[^0-9Xx]/g, '').toUpperCase()
  if (cleaned.length !== 10 && cleaned.length !== 13) return null
  return cleaned
}

function isbnCoverUrl(isbn: string, size: 'S' | 'M' | 'L' = 'L'): string {
  return `${OPEN_LIBRARY_COVERS}/isbn/${isbn}-${size}.jpg`
}

function coverIdUrl(coverId: number, size: 'S' | 'M' | 'L' = 'L'): string {
  return `${OPEN_LIBRARY_COVERS}/id/${coverId}-${size}.jpg`
}

async function coverExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

async function tryIsbnCover(isbn: string): Promise<string | null> {
  const url = isbnCoverUrl(isbn)
  return (await coverExists(url)) ? url : null
}

async function searchOpenLibrary(title: string, author: string): Promise<string | null> {
  const params = new URLSearchParams({
    title,
    author,
    limit: '3',
    fields: 'cover_i,isbn,title,author_name',
  })

  const response = await fetch(`${OPEN_LIBRARY_SEARCH}?${params}`)
  if (!response.ok) return null

  const data = (await response.json()) as { docs?: SearchDoc[] }
  const docs = data.docs ?? []

  for (const doc of docs) {
    if (doc.cover_i) {
      const url = coverIdUrl(doc.cover_i)
      if (await coverExists(url)) return url
    }

    for (const candidate of doc.isbn ?? []) {
      const normalized = normalizeIsbn(candidate)
      if (!normalized) continue
      const url = await tryIsbnCover(normalized)
      if (url) return url
    }
  }

  return null
}

export const coverLookupService = {
  normalizeIsbn,

  async lookup(input: CoverLookupInput): Promise<string | null> {
    const isbn = normalizeIsbn(input.isbn)
    if (isbn) {
      const byIsbn = await tryIsbnCover(isbn)
      if (byIsbn) return byIsbn
    }

    const title = input.title?.trim()
    const author = input.author?.trim()
    if (!title || !author) return null

    return searchOpenLibrary(title, author)
  },
}