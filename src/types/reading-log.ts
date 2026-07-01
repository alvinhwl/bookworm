export interface ReadingLogEntry {
  id: string
  book_id: string
  value: number
  note: string | null
  logged_at: string
}