import type { Book, Collection } from '@/types'

export function formatBookTitle(
  book: Book,
  collection?: Collection | null,
): string {
  if (collection?.volume_mode === 'numbered' && book.volume_number != null) {
    return `${collection.name} · Vol. ${book.volume_number}`
  }
  return book.title
}

export function collectionSubtitle(
  book: Book,
  collection?: Collection | null,
): string | null {
  if (!collection || !book.collection_id) return null
  if (collection.volume_mode === 'named') {
    return collection.name
  }
  return collection.author
}