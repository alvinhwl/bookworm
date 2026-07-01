export type ViewMode = 'list' | 'grid'

export type SortField =
  | 'title'
  | 'author'
  | 'created_at'
  | 'finished_at'
  | 'progress'

export type SortDirection = 'asc' | 'desc'

export interface SortOption {
  field: SortField
  direction: SortDirection
}

export type Theme = 'light' | 'dark' | 'system'

export interface UserSettings {
  id: 'user'
  annual_goal: number | null
  default_view: ViewMode
  default_sort: SortOption
  theme: Theme
}

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'user',
  annual_goal: null,
  default_view: 'list',
  default_sort: { field: 'created_at', direction: 'desc' },
  theme: 'light',
}