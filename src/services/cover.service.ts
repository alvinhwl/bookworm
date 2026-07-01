import type { BookFormat } from '@/types'
import { getSupabase, isSupabaseEnabled } from '@/lib/supabase'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const BUCKET = 'covers'

function extensionFromMime(mime: string): string {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

export const coverService = {
  validateUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return url.startsWith('data:image/')
    }
  },

  async fileToDataUrl(file: File): Promise<string> {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Cover must be JPEG, PNG, or WebP')
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Cover image must be under 2MB')
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  },

  getPlaceholder(_format: BookFormat): string {
    return ''
  },

  async uploadFile(file: File, userId: string, bookId: string): Promise<string> {
    if (!isSupabaseEnabled()) {
      return this.fileToDataUrl(file)
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Cover must be JPEG, PNG, or WebP')
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Cover image must be under 2MB')
    }

    const ext = extensionFromMime(file.type)
    const path = `${userId}/${bookId}.${ext}`
    const { error } = await getSupabase().storage.from(BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type,
    })
    if (error) throw error

    const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  },

  async uploadDataUrl(dataUrl: string, userId: string, bookId: string): Promise<string> {
    if (!isSupabaseEnabled() || !dataUrl.startsWith('data:image/')) {
      return dataUrl
    }

    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/)
    if (!match) return dataUrl

    const mime = match[1]
    const bytes = Uint8Array.from(atob(match[2]), (c) => c.charCodeAt(0))
    const file = new File([bytes], `cover.${extensionFromMime(mime)}`, { type: mime })
    return this.uploadFile(file, userId, bookId)
  },

  async resolveCoverUrl(
    coverUrl: string | null,
    userId: string,
    bookId: string,
  ): Promise<string | null> {
    if (!coverUrl) return null
    if (coverUrl.startsWith('data:image/')) {
      return this.uploadDataUrl(coverUrl, userId, bookId)
    }
    return coverUrl
  },
}