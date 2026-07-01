import type { Book, SortOption } from '@/types'
import { percentComplete } from './progress'

export function sortBooks(books: Book[], option: SortOption): Book[] {
  const sorted = [...books]
  const dir = option.direction === 'asc' ? 1 : -1

  sorted.sort((a, b) => {
    let cmp = 0
    switch (option.field) {
      case 'title':
        cmp = a.title.localeCompare(b.title)
        break
      case 'author':
        cmp = a.author.localeCompare(b.author)
        break
      case 'created_at':
        cmp = a.created_at.localeCompare(b.created_at)
        break
      case 'finished_at': {
        const af = a.finished_at ?? ''
        const bf = b.finished_at ?? ''
        cmp = af.localeCompare(bf)
        break
      }
      case 'progress': {
        const ap = percentComplete(a) ?? 0
        const bp = percentComplete(b) ?? 0
        cmp = ap - bp
        break
      }
    }
    return cmp * dir
  })

  return sorted
}