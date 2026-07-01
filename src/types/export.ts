import type { Book } from './book'
import type { ReadingLogEntry } from './reading-log'
import type { UserSettings } from './settings'

export const EXPORT_SCHEMA_VERSION = 1

export interface ExportBundle {
  version: number
  exported_at: string
  books: Book[]
  reading_log: ReadingLogEntry[]
  settings: Omit<UserSettings, 'id'>
}

export interface ImportPreview {
  toAdd: Book[]
  toUpdate: { existing: Book; incoming: Book }[]
  unchanged: number
  logEntriesToAdd: ReadingLogEntry[]
  logEntriesToUpdate: ReadingLogEntry[]
  isValid: boolean
  errors: string[]
}

export type ImportMode = 'merge' | 'replace'

export interface ImportResult {
  added: number
  updated: number
  skipped: number
  logsAdded: number
}