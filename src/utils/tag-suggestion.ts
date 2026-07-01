import type { BookFormat } from '@/types'

const GENRE_RULES: { tag: string; keywords: string[] }[] = [
  { tag: 'fantasy', keywords: ['fantasy', 'dragon', 'magic', 'wizard', 'elf', 'quest', 'kingdom', 'myth'] },
  { tag: 'sci-fi', keywords: ['sci-fi', 'science fiction', 'space', 'planet', 'robot', 'alien', 'future', 'dystopia'] },
  { tag: 'mystery', keywords: ['mystery', 'murder', 'detective', 'crime', 'thriller', 'investigation'] },
  { tag: 'romance', keywords: ['romance', 'love', 'relationship', 'wedding'] },
  { tag: 'history', keywords: ['history', 'historical', 'war', 'century', 'empire', 'revolution'] },
  { tag: 'memoir', keywords: ['memoir', 'autobiography', 'life story', 'biography'] },
  { tag: 'business', keywords: ['business', 'startup', 'management', 'leadership', 'entrepreneur'] },
  { tag: 'self-help', keywords: ['self-help', 'habits', 'productivity', 'mindset', 'wellness'] },
  { tag: 'philosophy', keywords: ['philosophy', 'ethics', 'existential', 'stoic'] },
  { tag: 'horror', keywords: ['horror', 'ghost', 'haunted', 'terror'] },
  { tag: 'young-adult', keywords: ['young adult', 'ya', 'teen', 'coming of age'] },
  { tag: 'classics', keywords: ['classic', 'penguin', 'oxford', 'dover'] },
]

const FORMAT_TAGS: Record<BookFormat, string> = {
  physical: 'physical',
  ebook: 'ebook',
  audiobook: 'audiobook',
}

export interface SuggestTagsInput {
  title: string
  author: string
  notes?: string
  format?: BookFormat
}

export function normalizeTagName(name: string): string {
  return name.trim().toLowerCase().slice(0, 30)
}

export function suggestTags(input: SuggestTagsInput): string[] {
  const corpus = `${input.title} ${input.author} ${input.notes ?? ''}`.toLowerCase()
  const scores = new Map<string, number>()

  for (const rule of GENRE_RULES) {
    let score = 0
    for (const kw of rule.keywords) {
      if (corpus.includes(kw)) score += kw.includes(' ') ? 2 : 1
    }
    if (score > 0) scores.set(rule.tag, score)
  }

  const words = corpus.split(/[^a-z0-9]+/).filter((w) => w.length >= 4)
  for (const word of words) {
    if (!scores.has(word)) scores.set(word, 0.5)
  }

  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)

  const result: string[] = []
  if (input.format) {
    result.push(FORMAT_TAGS[input.format])
  }

  for (const tag of ranked) {
    if (result.length >= 5) break
    if (!result.includes(tag)) result.push(tag)
  }

  while (result.length < 3 && ranked.length > result.length) {
    const next = ranked.find((t) => !result.includes(t))
    if (!next) break
    result.push(next)
  }

  return result.slice(0, 5)
}