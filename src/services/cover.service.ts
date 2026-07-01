import type { BookFormat } from '@/types'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

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
}