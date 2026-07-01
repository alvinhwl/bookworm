# Bookworm v1 — Technical Architecture

**Version:** 1.0  
**Status:** Approved for implementation  
**Last updated:** July 1, 2026  
**Author:** System Architect

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Data Layer Design](#4-data-layer-design)
5. [Application Architecture](#5-application-architecture)
6. [UI Component Specification](#6-ui-component-specification)
7. [API / Interface Contracts](#7-api--interface-contracts)
8. [Implementation Plan](#8-implementation-plan)
9. [Key Technical Decisions](#9-key-technical-decisions)
10. [Appendix: P1 / P2 Notes](#10-appendix-p1--p2-notes)

---

## 1. Executive Summary

Bookworm v1 is a **single-page application (SPA)** that runs entirely in the browser. All data lives in **IndexedDB** via **Dexie.js**. There is no backend, authentication, or network dependency for core features.

**Architectural principles:**

| Principle | Implementation |
|-----------|----------------|
| Local-first | IndexedDB as source of truth; no remote API |
| Layered separation | UI → hooks → services → repositories → Dexie |
| Type safety | Shared TypeScript domain types across layers |
| Testability | Services and repositories unit-tested; integration tests for export/import round-trip |
| Progressive enhancement | P0 ships list view; P1 adds grid, sort, goals without schema changes |

**High-level data flow:**

```
User Action
    → React Component
    → Custom Hook (useBooks, useBook, useSettings)
    → Service (BookService, ProgressService, ImportExportService)
    → Repository (BookRepository, ReadingLogRepository, SettingsRepository)
    → Dexie (IndexedDB)
    → Hook re-fetches / optimistic update
    → UI re-renders
```

---

## 2. Technology Stack

### 2.1 Core

| Layer | Choice | Version (target) | Rationale |
|-------|--------|------------------|-----------|
| **Language** | TypeScript | 5.x | Catches schema/type drift; excellent IDE support |
| **UI framework** | React | 19.x | Component model fits library UI; large ecosystem |
| **Build tool** | Vite | 6.x | Fast HMR, native ESM, minimal config |
| **Routing** | React Router | 7.x | Declarative routes, URL-based book detail, back/forward |
| **Local DB** | Dexie.js | 4.x | IndexedDB wrapper with hooks, transactions, migrations |
| **Styling** | Tailwind CSS | 4.x | Utility-first; responsive without custom CSS sprawl |
| **Icons** | Lucide React | latest | Lightweight, consistent icon set |

### 2.2 Supporting Libraries

| Concern | Choice | Rationale |
|---------|--------|-----------|
| **UUID generation** | `crypto.randomUUID()` (native) | No dependency; stable IDs for export/import |
| **Date formatting** | `date-fns` | Tree-shakeable; `format`, `parseISO` for log display |
| **Form state** | React controlled components + local state | MVP forms are simple; avoid react-hook-form overhead for v1 |
| **Debounced search** | Custom `useDebouncedValue` hook | ~250ms debounce per US-06 |
| **Modal / dialog** | Headless UI or Radix Dialog (optional) | Accessible confirm/delete dialogs; can use native `<dialog>` for zero-deps |
| **Toast notifications** | Lightweight custom `ToastProvider` | Import success, status warnings |
| **Validation** | Zod (schemas) | Shared validation for forms and import JSON |

### 2.3 Testing

| Type | Tool | Scope |
|------|------|-------|
| Unit | Vitest | Services, repositories, utilities, hooks |
| Component | Vitest + React Testing Library | Forms, filters, empty states |
| Integration | Vitest + `fake-indexeddb` | Dexie CRUD, export/import round-trip |
| E2E (optional P2) | Playwright | Full user flows in real browser |

### 2.4 Dev Tooling

| Tool | Purpose |
|------|---------|
| ESLint + typescript-eslint | Linting |
| Prettier | Formatting |
| `vite-plugin-pwa` | Deferred P2; not in initial scaffold |

### 2.5 Browser Support

- Chrome, Firefox, Safari (latest + one prior major)
- Mobile Safari iOS 16+, Chrome Android
- IndexedDB required (all target browsers support it)

---

## 3. Project Structure

```
bookworm/
├── docs/
│   ├── requirements.md
│   └── architecture.md          # This document
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                 # React root, RouterProvider
│   ├── App.tsx                  # Route definitions, layout shell
│   ├── index.css                # Tailwind directives, CSS variables
│   │
│   ├── types/
│   │   ├── book.ts              # Book, BookFormat, ReadingStatus
│   │   ├── reading-log.ts       # ReadingLogEntry
│   │   ├── settings.ts          # UserSettings, SortOption, ViewMode
│   │   ├── export.ts            # ExportBundle, ImportPreview, ImportResult
│   │   └── index.ts             # Re-exports
│   │
│   ├── db/
│   │   ├── schema.ts            # Dexie subclass, store definitions, version migrations
│   │   └── index.ts             # Singleton db instance
│   │
│   ├── repositories/
│   │   ├── book.repository.ts
│   │   ├── reading-log.repository.ts
│   │   ├── settings.repository.ts
│   │   └── index.ts
│   │
│   ├── services/
│   │   ├── book.service.ts      # CRUD, status transitions, cascade delete
│   │   ├── progress.service.ts  # Progress updates, log entries, validation
│   │   ├── library.service.ts   # Search, filter, sort (in-memory over fetched books)
│   │   ├── import-export.service.ts
│   │   ├── cover.service.ts     # URL validation, file → base64 (P1 upload)
│   │   └── index.ts
│   │
│   ├── hooks/
│   │   ├── useBooks.ts          # Library list + filters
│   │   ├── useBook.ts           # Single book + logs
│   │   ├── useSettings.ts
│   │   ├── useDebouncedValue.ts
│   │   ├── useLibraryFilters.ts # URL + session state for filters
│   │   └── useScrollRestoration.ts  # P1: preserve scroll on back nav
│   │
│   ├── utils/
│   │   ├── id.ts                # generateId()
│   │   ├── dates.ts             # formatLogDate, todayISO
│   │   ├── progress.ts          # percentComplete, progressLabel
│   │   ├── sort.ts              # sortBooks(books, sortOption)
│   │   ├── search.ts            # matchesSearch(book, query)
│   │   ├── validation.ts        # Zod schemas
│   │   └── download.ts          # trigger JSON file download
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx     # Header, nav, main outlet
│   │   │   ├── PageHeader.tsx
│   │   │   └── BottomNav.tsx    # Mobile: Library, Add, Settings
│   │   ├── library/
│   │   │   ├── LibraryPage.tsx
│   │   │   ├── LibraryToolbar.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterChips.tsx
│   │   │   ├── SortDropdown.tsx       # P1
│   │   │   ├── ViewToggle.tsx         # P1 grid/list
│   │   │   ├── BookList.tsx
│   │   │   ├── BookGrid.tsx           # P1
│   │   │   ├── BookCard.tsx
│   │   │   ├── BookListItem.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── QuickStatusMenu.tsx
│   │   │   └── EmptyLibrary.tsx
│   │   ├── book/
│   │   │   ├── BookDetailPage.tsx
│   │   │   ├── BookCover.tsx
│   │   │   ├── BookMeta.tsx
│   │   │   ├── ProgressSection.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ReadingLogList.tsx
│   │   │   ├── NotesSection.tsx
│   │   │   ├── StatusSelector.tsx
│   │   │   └── DeleteBookDialog.tsx
│   │   ├── forms/
│   │   │   ├── BookForm.tsx           # Shared add/edit
│   │   │   ├── AddBookPage.tsx
│   │   │   ├── EditBookPage.tsx
│   │   │   ├── FormField.tsx
│   │   │   ├── CoverInput.tsx
│   │   │   └── ProgressInput.tsx
│   │   ├── settings/
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── DataSection.tsx
│   │   │   ├── ImportDialog.tsx
│   │   │   ├── ImportPreview.tsx
│   │   │   └── GoalSetting.tsx        # P1
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Textarea.tsx
│   │       ├── Badge.tsx
│   │       ├── Card.tsx
│   │       ├── Dialog.tsx
│   │       ├── Toast.tsx
│   │       ├── Spinner.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── context/
│   │   ├── ToastContext.tsx
│   │   └── LibraryStateContext.tsx  # P1: scroll + filter persistence
│   │
│   └── test/
│       ├── setup.ts             # fake-indexeddb, RTL setup
│       ├── factories/           # createBook(), createLogEntry()
│       └── helpers/             # renderWithRouter, seedDatabase
│
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.ts
├── eslint.config.js
└── README.md
```

### File Responsibility Summary

| Directory | Responsibility |
|-----------|----------------|
| `types/` | Pure TypeScript interfaces; no runtime code |
| `db/` | Dexie schema, indexes, migrations only |
| `repositories/` | Thin CRUD over Dexie tables; no business rules |
| `services/` | Business logic, orchestration, validation |
| `hooks/` | React integration; loading/error states |
| `components/` | Presentation; minimal logic |
| `utils/` | Pure functions |

---

## 4. Data Layer Design

### 4.1 IndexedDB Schema (Dexie)

**Database name:** `bookworm`  
**Current version:** `1`

```typescript
// src/db/schema.ts
import Dexie, { type Table } from 'dexie';
import type { Book, ReadingLogEntry, UserSettings } from '@/types';

export class BookwormDB extends Dexie {
  books!: Table<Book, string>;
  readingLog!: Table<ReadingLogEntry, string>;
  settings!: Table<UserSettings, string>;

  constructor() {
    super('bookworm');

    this.version(1).stores({
      // Primary key: id
      // Indexed fields for query performance
      books: 'id, title, author, status, format, created_at, updated_at, finished_at',
      readingLog: 'id, book_id, logged_at, [book_id+logged_at]',
      settings: 'id',  // Single row: id = 'user'
    });
  }
}
```

**Index rationale:**

| Store | Index | Use case |
|-------|-------|----------|
| `books` | `status` | Filter by reading status |
| `books` | `format` | Filter by format |
| `books` | `created_at` | Default sort (newest first) |
| `books` | `finished_at` | Sort by date finished; annual goal count |
| `readingLog` | `book_id` | Fetch logs for one book |
| `readingLog` | `[book_id+logged_at]` | Ordered log queries per book |

**Settings storage:** Single document with `id: 'user'`. Simpler than key-value pairs; matches export shape.

### 4.2 TypeScript Domain Types

```typescript
// src/types/book.ts

export type BookFormat = 'physical' | 'ebook' | 'audiobook';

export type ReadingStatus =
  | 'want_to_read'
  | 'currently_reading'
  | 'finished'
  | 'dnf';

export interface Book {
  id: string;
  title: string;
  author: string;
  format: BookFormat;
  status: ReadingStatus;
  cover_url: string | null;           // URL or data:image/...;base64,...
  isbn: string | null;
  published_year: number | null;
  total_pages: number | null;         // physical / ebook
  total_duration_minutes: number | null; // audiobook
  current_progress: number;           // page or minutes; default 0
  notes: string;
  started_at: string | null;          // ISO 8601 date (YYYY-MM-DD)
  finished_at: string | null;
  created_at: string;                 // ISO 8601 datetime
  updated_at: string;
}

export type CreateBookInput = Omit<Book, 'id' | 'created_at' | 'updated_at' | 'current_progress'> & {
  current_progress?: number;
};

export type UpdateBookInput = Partial<Omit<Book, 'id' | 'created_at'>>;
```

```typescript
// src/types/reading-log.ts

export interface ReadingLogEntry {
  id: string;
  book_id: string;
  value: number;                      // page or minutes at time of log
  note: string | null;
  logged_at: string;                  // ISO 8601 datetime
}
```

```typescript
// src/types/settings.ts

export type ViewMode = 'list' | 'grid';

export type SortField =
  | 'title'
  | 'author'
  | 'created_at'
  | 'finished_at'
  | 'progress';

export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  field: SortField;
  direction: SortDirection;
}

export type Theme = 'light' | 'dark' | 'system';

export interface UserSettings {
  id: 'user';                         // Fixed singleton key
  annual_goal: number | null;         // P1
  default_view: ViewMode;
  default_sort: SortOption;
  theme: Theme;                       // P2
}

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'user',
  annual_goal: null,
  default_view: 'list',
  default_sort: { field: 'created_at', direction: 'desc' },
  theme: 'light',
};
```

```typescript
// src/types/export.ts

export const EXPORT_SCHEMA_VERSION = 1;

export interface ExportBundle {
  version: number;
  exported_at: string;
  books: Book[];
  reading_log: ReadingLogEntry[];
  settings: Omit<UserSettings, 'id'>;
}

export interface ImportPreview {
  toAdd: Book[];
  toUpdate: { existing: Book; incoming: Book }[];
  unchanged: number;
  logEntriesToAdd: ReadingLogEntry[];
  logEntriesToUpdate: ReadingLogEntry[];
  isValid: boolean;
  errors: string[];
}

export type ImportMode = 'merge' | 'replace';

export interface ImportResult {
  added: number;
  updated: number;
  skipped: number;
  logsAdded: number;
}
```

### 4.3 Repository Pattern

Repositories are **thin data accessors**. They do not enforce business rules.

#### BookRepository

```typescript
interface BookRepository {
  getAll(): Promise<Book[]>;
  getById(id: string): Promise<Book | undefined>;
  create(book: Book): Promise<string>;
  update(id: string, changes: Partial<Book>): Promise<void>;
  delete(id: string): Promise<void>;
  countByStatus(status: ReadingStatus): Promise<number>;
  getCurrentlyReading(): Promise<Book[]>;
}
```

#### ReadingLogRepository

```typescript
interface ReadingLogRepository {
  getByBookId(bookId: string, limit?: number): Promise<ReadingLogEntry[]>;
  create(entry: ReadingLogEntry): Promise<string>;
  deleteByBookId(bookId: string): Promise<void>;
  bulkPut(entries: ReadingLogEntry[]): Promise<void>;
  getAll(): Promise<ReadingLogEntry[]>;
}
```

#### SettingsRepository

```typescript
interface SettingsRepository {
  get(): Promise<UserSettings>;
  save(settings: UserSettings): Promise<void>;
}
```

**Implementation notes:**

- `SettingsRepository.get()` returns `DEFAULT_SETTINGS` if no row exists, then lazily persists on first save.
- All writes use `updated_at` set by service layer, not repository.
- `bulkPut` used during import inside Dexie transactions.

### 4.4 Export / Import Format Specification

#### Export file

- **Filename:** `bookworm-export-YYYY-MM-DD.json`
- **MIME:** `application/json`
- **Encoding:** UTF-8

**JSON structure:**

```json
{
  "version": 1,
  "exported_at": "2026-07-01T14:30:00.000Z",
  "books": [ /* Book[] */ ],
  "reading_log": [ /* ReadingLogEntry[] */ ],
  "settings": {
    "annual_goal": null,
    "default_view": "list",
    "default_sort": { "field": "created_at", "direction": "desc" },
    "theme": "light"
  }
}
```

#### Validation rules (Zod)

| Rule | Error message |
|------|---------------|
| `version` must equal supported version (1) | "Unsupported export version" |
| `books` is array | "Invalid books array" |
| Each book has required fields + valid enums | Field-level errors |
| `reading_log` is array; each entry has valid `book_id` | "Invalid reading log" |
| On **merge**: match books by `id` | Updates overwrite by incoming record |
| On **replace**: clear all stores then bulk insert | Requires extra confirmation in UI |

#### Cover image portability

**Decision:** Store covers as **base64 data URLs** in `cover_url` when user uploads a file. External HTTP URLs are stored as-is. On export, both travel in JSON. Import restores verbatim.

#### Import merge algorithm

```
1. Parse JSON → validate with Zod
2. For each incoming book by id:
   - If id exists locally → toUpdate
   - Else → toAdd
3. For reading_log entries by id:
   - If id exists → toUpdate (incoming wins)
   - Else → toAdd
4. Show preview to user
5. On confirm (merge):
   - db.transaction('rw', books, readingLog, settings, async () => {
       bulkPut updates + adds for books
       bulkPut log entries
       merge settings (incoming non-null fields win)
     })
6. Return ImportResult counts
```

#### Import replace algorithm

```
1. Validate JSON
2. User confirms destructive replace
3. db.transaction → clear books, readingLog → bulkPut all incoming
4. Overwrite settings entirely
```

### 4.5 Dexie Migration Strategy

- Version 1: initial schema
- Future versions: use `this.version(n).stores({...}).upgrade(tx => {...})`
- Never change existing field meaning without version bump
- Export `version` field allows forward-compatible import readers

---

## 5. Application Architecture

### 5.1 Component Hierarchy

```
App
└── AppShell
    ├── Header (logo, library stats)
    ├── <Outlet />  (React Router)
    │   ├── LibraryPage
    │   │   ├── LibraryToolbar (search, filters, sort, view toggle)
    │   │   ├── BookList | BookGrid
    │   │   │   └── BookListItem | BookCard
    │   │   └── EmptyLibrary
    │   ├── BookDetailPage
    │   │   ├── BookCover, BookMeta, StatusSelector
    │   │   ├── ProgressSection
    │   │   ├── NotesSection
    │   │   └── ReadingLogList
    │   ├── AddBookPage → BookForm
    │   ├── EditBookPage → BookForm
    │   └── SettingsPage
    │       ├── DataSection (export/import)
    │       └── GoalSetting (P1)
    ├── BottomNav (mobile)
    └── ToastContainer
```

### 5.2 Routing Structure

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `LibraryPage` | Default library view |
| `/books/new` | `AddBookPage` | Add book form |
| `/books/:id` | `BookDetailPage` | Book detail |
| `/books/:id/edit` | `EditBookPage` | Edit book form |
| `/settings` | `SettingsPage` | Preferences + data |
| `*` | `Navigate to /` | Fallback |

**Route config (`src/App.tsx`):**

```typescript
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LibraryPage /> },
      { path: 'books/new', element: <AddBookPage /> },
      { path: 'books/:id', element: <BookDetailPage /> },
      { path: 'books/:id/edit', element: <EditBookPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
```

### 5.3 State Management Approach

**No Redux/Zustand for v1.** State is split intentionally:

| State type | Mechanism | Examples |
|------------|-----------|----------|
| **Persistent data** | IndexedDB via hooks | Books, logs, settings |
| **URL state** | `useSearchParams` | `?q=`, `?status=`, `?format=` |
| **Session UI state** | `LibraryStateContext` (P1) | Scroll position, filter memory |
| **Ephemeral UI** | Component `useState` | Modal open, form drafts |
| **Global toasts** | `ToastContext` | Success/error messages |

**Data fetching pattern (stale-while-revalidate style):**

```typescript
function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setBooks(await bookService.getAll());
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { books, loading, error, refresh };
}
```

Mutations call service → `refresh()` on success. Optimistic updates optional for status changes (P1 polish).

### 5.4 Library Query Pipeline

Filters and search run **in-memory** after `getAll()` — appropriate for personal libraries (typically &lt; 5,000 books).

```
allBooks
  → filterByStatus(status)
  → filterByFormat(format)
  → filterBySearch(query)      // title, author, notes; case-insensitive
  → sortBooks(sortOption)      // P1
  → render
```

**Search implementation (`utils/search.ts`):**

```typescript
function matchesSearch(book: Book, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    book.title.toLowerCase().includes(q) ||
    book.author.toLowerCase().includes(q) ||
    book.notes.toLowerCase().includes(q)
  );
}
```

**Debounce:** `useDebouncedValue(searchInput, 250)` feeds into filter pipeline.

### 5.5 Key Hooks

| Hook | Purpose |
|------|---------|
| `useBooks()` | All books + refresh |
| `useFilteredBooks()` | Combines books + URL filters + search + sort |
| `useBook(id)` | Single book; redirects if not found |
| `useReadingLog(bookId)` | Last 5 entries for detail view |
| `useSettings()` | Settings CRUD |
| `useDebouncedValue(value, ms)` | Search debounce |
| `useLibraryStats()` | Total count, currently reading count |
| `useAnnualGoalProgress()` | P1: finished this year vs goal |

### 5.6 Key Utilities

| Utility | Purpose |
|---------|---------|
| `percentComplete(book)` | Derive % from progress + total pages/minutes |
| `progressLabel(book)` | "Page 142" or "3h 20m" |
| `sortBooks(books, option)` | Stable sort for all sort modes |
| `validateProgress(book, value)` | Cap at total; return error message |
| `applyStatusTransition(book, newStatus)` | Set started_at / finished_at rules |

### 5.7 Status Transition Rules (BookService)

| Transition | Side effects |
|------------|--------------|
| → `currently_reading` | Set `started_at` to today if null |
| → `finished` | Set `finished_at` to today if null; prompt to set progress to 100% |
| → `dnf` | Optional: append reason to notes (UI prompt) |
| → `want_to_read` | Do not clear dates (preserve history) |

**Multiple currently reading (P1):** On transition to `currently_reading`, query `getCurrentlyReading()`. If count ≥ 1 and other books exist, show **warning toast** — do not block.

### 5.8 Progress Update Flow (ProgressService)

```
updateProgress(bookId, value, note?)
  1. Load book
  2. validateProgress(book, value) → throw if invalid
  3. Update book.current_progress, book.updated_at
  4. Create ReadingLogEntry { value, note, logged_at: now }
  5. Transaction: bookRepo.update + logRepo.create
  6. Return updated book + entry
```

### 5.9 Delete Cascade

```
deleteBook(bookId)
  1. Confirm in UI (ConfirmDialog)
  2. Transaction:
     - readingLogRepo.deleteByBookId(bookId)
     - bookRepo.delete(bookId)
```

---

## 6. UI Component Specification

### 6.1 Layout Components

#### `AppShell`

| Prop | Type | Description |
|------|------|-------------|
| — | — | Wraps all pages; renders header, outlet, bottom nav, toasts |

**Responsibilities:** Responsive layout; `min-h-screen`; max-width container on desktop.

#### `PageHeader`

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Page title |
| `subtitle` | `string?` | e.g. "24 books · 3 currently reading" |
| `actions` | `ReactNode?` | Right-side buttons |

---

### 6.2 Library Components (P0)

#### `LibraryPage`

**Responsibilities:** Orchestrate toolbar + list + empty state; read URL search params.

#### `SearchBar`

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Controlled input |
| `onChange` | `(v: string) => void` | Update search |
| `placeholder` | `string?` | Default: "Search title, author, notes…" |

#### `FilterChips`

| Prop | Type | Description |
|------|------|-------------|
| `status` | `ReadingStatus \| null` | Active status filter |
| `format` | `BookFormat \| null` | Active format filter |
| `onStatusChange` | `(s) => void` | |
| `onFormatChange` | `(f) => void` | |
| `onClearAll` | `() => void` | Clear all filters |

**Responsibilities:** Visually indicate active filters; one-click clear.

#### `BookList` / `BookListItem`

| Prop (BookList) | Type | Description |
|-----------------|------|-------------|
| `books` | `Book[]` | Filtered/sorted books |
| `onSelect` | `(id) => void` | Navigate to detail |

| Prop (BookListItem) | Type | Description |
|---------------------|------|-------------|
| `book` | `Book` | |
| `onQuickStatusChange` | `(status) => void` | Quick action menu |

**Responsibilities:** Row shows cover thumbnail, title, author, status badge, progress %.

#### `BookCard` (P1 grid)

Same data as list item; vertical card layout.

#### `EmptyLibrary`

**Responsibilities:** Illustration + "Add your first book" CTA → `/books/new`.

#### `StatusBadge`

| Prop | Type | Description |
|------|------|-------------|
| `status` | `ReadingStatus` | Color-coded badge |

---

### 6.3 Book Detail Components (P0)

#### `BookDetailPage`

| Route param | `id` |
|-------------|------|

**Responsibilities:** Load book + logs; Edit/Delete actions; back link to `/`.

#### `ProgressSection`

| Prop | Type | Description |
|------|------|-------------|
| `book` | `Book` | |
| `onUpdate` | `(value, note?) => Promise<void>` | |

**Responsibilities:** Progress bar, %, inline numeric input, validation message, last updated date.

#### `ReadingLogList`

| Prop | Type | Description |
|------|------|-------------|
| `entries` | `ReadingLogEntry[]` | Max 5 visible |
| `book` | `Book` | For label formatting |

#### `StatusSelector`

| Prop | Type | Description |
|------|------|-------------|
| `status` | `ReadingStatus` | |
| `onChange` | `(s) => void` | Triggers transition logic |

#### `DeleteBookDialog`

Confirm: "Are you sure? This will permanently remove the book and its reading history."

---

### 6.4 Form Components (P0)

#### `BookForm`

| Prop | Type | Description |
|------|------|-------------|
| `initialValues` | `Partial<Book>?` | Pre-fill for edit |
| `onSubmit` | `(data) => Promise<void>` | |
| `onCancel` | `() => void` | |
| `submitLabel` | `string` | "Add book" / "Save changes" |

**Fields:** title*, author*, format, status, cover URL/upload, ISBN, year, pages OR duration (based on format), notes.

**Validation:** Inline errors on blur/submit; submit disabled until title + author valid.

#### `CoverInput`

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string \| null` | |
| `onChange` | `(url: string \| null) => void` | |

**P0:** URL input only. **P1:** File upload → `coverService.fileToDataUrl()`.

---

### 6.5 Settings Components (P0)

#### `DataSection`

**Responsibilities:**
- "Export library" button → `importExportService.export()` → download
- "Import library" → file picker → `ImportDialog`

#### `ImportDialog` / `ImportPreview`

| Prop | Type | Description |
|------|------|-------------|
| `preview` | `ImportPreview` | Add/update counts |
| `onConfirm` | `(mode: ImportMode) => void` | |
| `onCancel` | `() => void` | |

**Replace All:** Secondary destructive button + extra confirmation checkbox.

---

### 6.6 Shared UI Primitives

| Component | Key props | Notes |
|-----------|-----------|-------|
| `Button` | `variant`, `size`, `disabled` | primary, secondary, danger, ghost |
| `Input` | `label`, `error`, `...inputProps` | Accessible label + error id |
| `Select` | `options`, `value`, `onChange` | |
| `Dialog` | `open`, `onClose`, `title` | Focus trap |
| `Toast` | `message`, `type` | success, warning, error |

---

## 7. API / Interface Contracts

All services are **internal** (no HTTP). Exported as singleton instances for simplicity.

### 7.1 BookService

```typescript
interface BookService {
  getAll(): Promise<Book[]>;
  getById(id: string): Promise<Book | null>;
  create(input: CreateBookInput): Promise<Book>;
  update(id: string, input: UpdateBookInput): Promise<Book>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: ReadingStatus, options?: {
    finishedAt?: string;
    dnfReason?: string;
  }): Promise<Book>;
  getCurrentlyReading(): Promise<Book[]>;
  getFinishedInYear(year: number): Promise<Book[]>;  // P1 goals
}
```

### 7.2 ProgressService

```typescript
interface ProgressService {
  updateProgress(
    bookId: string,
    value: number,
    note?: string | null
  ): Promise<{ book: Book; entry: ReadingLogEntry }>;

  getRecentLogs(bookId: string, limit?: number): Promise<ReadingLogEntry[]>;

  validateProgress(book: Book, value: number): {
    valid: boolean;
    error?: string;
  };
}
```

### 7.3 LibraryService

```typescript
interface LibraryQuery {
  search?: string;
  status?: ReadingStatus | null;
  format?: BookFormat | null;
  sort?: SortOption;
}

interface LibraryService {
  query(books: Book[], query: LibraryQuery): Book[];
  getStats(books: Book[]): {
    total: number;
    currentlyReading: number;
    byStatus: Record<ReadingStatus, number>;
  };
}
```

### 7.4 ImportExportService

```typescript
interface ImportExportService {
  export(): Promise<ExportBundle>;
  downloadExport(): Promise<void>;
  parseImportFile(file: File): Promise<ExportBundle>;
  previewImport(bundle: ExportBundle): Promise<ImportPreview>;
  executeImport(bundle: ExportBundle, mode: ImportMode): Promise<ImportResult>;
}
```

### 7.5 SettingsService

```typescript
interface SettingsService {
  get(): Promise<UserSettings>;
  update(partial: Partial<Omit<UserSettings, 'id'>>): Promise<UserSettings>;
  setAnnualGoal(goal: number | null): Promise<UserSettings>;  // P1
}
```

### 7.6 CoverService

```typescript
interface CoverService {
  validateUrl(url: string): boolean;
  fileToDataUrl(file: File): Promise<string>;  // P1; max 2MB, jpeg/png/webp
  getPlaceholder(format: BookFormat): string;   // Static placeholder path
}
```

### 7.7 Error Types

```typescript
class BookwormError extends Error {
  code: 'NOT_FOUND' | 'VALIDATION' | 'IMPORT_INVALID' | 'DB_ERROR';
}

// UI maps codes to user-friendly messages
```

---

## 8. Implementation Plan

Ordered steps for the Senior Engineer. Each step should be a commit or small PR.

### Phase 0: Project Scaffold

| Step | Files | Action |
|------|-------|--------|
| 0.1 | `package.json`, `vite.config.ts`, `tsconfig*.json` | `npm create vite@latest` with React + TS template; add dependencies |
| 0.2 | `tailwind.config.ts`, `src/index.css` | Configure Tailwind v4 |
| 0.3 | `vitest.config.ts`, `src/test/setup.ts` | Vitest + RTL + fake-indexeddb |
| 0.4 | `eslint.config.js` | ESLint + Prettier |
| 0.5 | `src/main.tsx`, `index.html` | Bootstrap app |

**Dependencies to install:**

```bash
npm install react react-dom react-router-dom dexie date-fns zod lucide-react
npm install -D vitest @testing-library/react @testing-library/jest-dom fake-indexeddb jsdom tailwindcss @tailwindcss/vite
```

### Phase 1: Types & Database

| Step | Files | Action |
|------|-------|--------|
| 1.1 | `src/types/*.ts` | All domain types |
| 1.2 | `src/db/schema.ts`, `src/db/index.ts` | Dexie schema v1 |
| 1.3 | `src/utils/id.ts`, `src/utils/dates.ts` | Helpers |
| 1.4 | `src/test/factories/` | Test factories |
| 1.5 | `src/db/schema.test.ts` | Integration: open DB, put/get book |

### Phase 2: Repositories

| Step | Files | Action |
|------|-------|--------|
| 2.1 | `src/repositories/book.repository.ts` | CRUD + indexes |
| 2.2 | `src/repositories/reading-log.repository.ts` | CRUD + deleteByBookId |
| 2.3 | `src/repositories/settings.repository.ts` | Singleton settings |
| 2.4 | `src/repositories/*.test.ts` | Repository tests |

### Phase 3: Services

| Step | Files | Action |
|------|-------|--------|
| 3.1 | `src/utils/validation.ts` | Zod schemas for Book, ExportBundle |
| 3.2 | `src/utils/progress.ts`, `src/utils/search.ts`, `src/utils/sort.ts` | Pure utilities |
| 3.3 | `src/services/book.service.ts` | CRUD + status transitions + cascade delete |
| 3.4 | `src/services/progress.service.ts` | Progress + log creation |
| 3.5 | `src/services/library.service.ts` | Filter/sort/stats |
| 3.6 | `src/services/settings.service.ts` | Settings CRUD |
| 3.7 | `src/services/import-export.service.ts` | Export, import, preview, merge/replace |
| 3.8 | `src/services/*.test.ts` | Unit + round-trip test |

### Phase 4: UI Primitives & Layout

| Step | Files | Action |
|------|-------|--------|
| 4.1 | `src/components/ui/*` | Button, Input, Select, Badge, Card, Dialog, Toast |
| 4.2 | `src/context/ToastContext.tsx` | Toast provider |
| 4.3 | `src/components/layout/AppShell.tsx`, `PageHeader.tsx`, `BottomNav.tsx` | Shell |
| 4.4 | `src/App.tsx` | Router setup |

### Phase 5: Hooks

| Step | Files | Action |
|------|-------|--------|
| 5.1 | `src/hooks/useDebouncedValue.ts` | |
| 5.2 | `src/hooks/useBooks.ts`, `useBook.ts`, `useReadingLog.ts` | |
| 5.3 | `src/hooks/useSettings.ts` | |
| 5.4 | `src/hooks/useFilteredBooks.ts`, `useLibraryStats.ts` | |

### Phase 6: Library (P0 — US-01, US-06)

| Step | Files | Action |
|------|-------|--------|
| 6.1 | `StatusBadge.tsx`, `EmptyLibrary.tsx` | |
| 6.2 | `SearchBar.tsx`, `FilterChips.tsx` | URL-synced filters |
| 6.3 | `BookListItem.tsx`, `BookList.tsx` | List view |
| 6.4 | `LibraryToolbar.tsx`, `LibraryPage.tsx` | Compose library |
| 6.5 | Manual test: empty state, search, filter | |

### Phase 7: Add / Edit Book (P0 — US-02, US-03)

| Step | Files | Action |
|------|-------|--------|
| 7.1 | `FormField.tsx`, `BookForm.tsx`, `CoverInput.tsx` | |
| 7.2 | `AddBookPage.tsx` | Create flow → navigate to detail |
| 7.3 | `EditBookPage.tsx` | Pre-filled form |
| 7.4 | `DeleteBookDialog.tsx` | Confirm delete |

### Phase 8: Book Detail (P0 — US-04, US-05, US-07)

| Step | Files | Action |
|------|-------|--------|
| 8.1 | `BookCover.tsx`, `BookMeta.tsx` | |
| 8.2 | `ProgressBar.tsx`, `ProgressInput.tsx`, `ProgressSection.tsx` | |
| 8.3 | `ReadingLogList.tsx`, `NotesSection.tsx` | |
| 8.4 | `StatusSelector.tsx`, `QuickStatusMenu.tsx` | Status + warning toast |
| 8.5 | `BookDetailPage.tsx` | Full detail page |

### Phase 9: Settings & Data (P0 — US-08)

| Step | Files | Action |
|------|-------|--------|
| 9.1 | `src/utils/download.ts` | JSON download helper |
| 9.2 | `DataSection.tsx`, `ImportPreview.tsx`, `ImportDialog.tsx` | |
| 9.3 | `SettingsPage.tsx` | |
| 9.4 | Integration test: export → clear → import round-trip | |

### Phase 10: P1 Features

| Step | Files | Action |
|------|-------|--------|
| 10.1 | `SortDropdown.tsx`, wire `default_sort` in settings | US-10 |
| 10.2 | `ViewToggle.tsx`, `BookGrid.tsx`, `BookCard.tsx` | Grid view |
| 10.3 | `cover.service.ts` file upload in `CoverInput` | Cover upload |
| 10.4 | Multiple currently-reading warning in `BookService.updateStatus` | |
| 10.5 | `LibraryStateContext.tsx`, `useScrollRestoration.ts` | Back nav state |
| 10.6 | `GoalSetting.tsx`, `useAnnualGoalProgress.ts`, library header widget | US-09 |

### Phase 11: Polish & Ship

| Step | Action |
|------|--------|
| 11.1 | Responsive pass (mobile bottom nav, desktop toolbar) |
| 11.2 | Accessibility: focus management, aria labels, keyboard nav |
| 11.3 | README: setup, export/import instructions, limitations |
| 11.4 | Full P0 acceptance criteria checklist QA |
| 11.5 | Cross-browser smoke test |

---

## 9. Key Technical Decisions

### ADR-001: IndexedDB via Dexie (not localStorage or raw IDB)

| | |
|---|---|
| **Status** | Accepted |
| **Context** | Requirements specify IndexedDB; books + logs can grow large; need indexes |
| **Decision** | Use Dexie.js |
| **Consequences** | + Simpler transactions, hooks, migrations. − Additional dependency (small, stable) |
| **Alternatives rejected** | localStorage (size limit, no indexes); raw IDB (verbose, error-prone) |

### ADR-002: No global state library

| | |
|---|---|
| **Status** | Accepted |
| **Context** | Single-user app; no shared server state |
| **Decision** | React hooks + context + IndexedDB |
| **Consequences** | + Less boilerplate, easier onboarding. − May revisit if real-time sync added in v2 |
| **Alternatives rejected** | Zustand/Redux (unnecessary complexity for v1) |

### ADR-003: In-memory search/filter over IndexedDB queries

| | |
|---|---|
| **Status** | Accepted |
| **Context** | Personal libraries are small; need multi-field partial search on title/author/notes |
| **Decision** | `getAll()` then filter in `LibraryService` |
| **Consequences** | + Simple code, combined filters easy. − Revisit if perf issues at 10k+ books (add FlexSearch index) |
| **Alternatives rejected** | Dexie `filter()` per field (awkward for OR across fields) |

### ADR-004: Stable UUIDs for export/import identity

| | |
|---|---|
| **Status** | Accepted |
| **Context** | US-08 requires merge by ID across devices |
| **Decision** | `crypto.randomUUID()` on create; IDs never change |
| **Consequences** | + Reliable round-trip. − Duplicates (same title, different formats) get different IDs (intentional per PM) |

### ADR-005: Base64 cover images in export JSON

| | |
|---|---|
| **Status** | Accepted |
| **Context** | Open question in requirements; import must restore covers |
| **Decision** | Store uploaded covers as data URLs in `cover_url`; included in export |
| **Consequences** | + Portable backups. − Larger JSON files (acceptable for personal libraries) |
| **Mitigation** | Cap upload size at 2MB; recommend URL for large images |

### ADR-006: Warn on multiple "Currently Reading" (don't block)

| | |
|---|---|
| **Status** | Accepted |
| **Context** | US-04 product decision |
| **Decision** | Toast warning when ≥1 other book is already `currently_reading` |
| **Consequences** | + Respects real reading habits. − No hard constraint |

### ADR-007: Merge is default import mode

| | |
|---|---|
| **Status** | Accepted |
| **Context** | US-08; avoid accidental data loss |
| **Decision** | Import UI defaults to Merge; Replace requires explicit destructive confirmation |
| **Consequences** | + Safe default. − Users must understand ID-based matching |

### ADR-008: URL-synced library filters

| | |
|---|---|
| **Status** | Accepted |
| **Context** | Shareable state, browser back button works |
| **Decision** | `?q=...&status=...&format=...` via `useSearchParams` |
| **Consequences** | + Refresh preserves filters. − Slightly more router code |

### ADR-009: Native `<dialog>` for modals (MVP)

| | |
|---|---|
| **Status** | Accepted |
| **Context** | Few modals (delete, import, confirm finish) |
| **Decision** | Use native dialog element with thin wrapper |
| **Consequences** | + Zero dependency, good a11y in modern browsers. − May swap to Radix if styling needs grow |

### ADR-010: Vitest over Jest

| | |
|---|---|
| **Status** | Accepted |
| **Context** | Vite-native test runner |
| **Decision** | Vitest + fake-indexeddb |
| **Consequences** | + Same config as build; fast. − Team must know Vitest API |

---

## 10. Appendix: P1 / P2 Notes

### P1 — Implement after P0 (schema already supports)

| Feature | Notes |
|---------|-------|
| US-10 Sort | `SortDropdown` + `utils/sort.ts`; persist in settings |
| US-09 Annual goal | Count `finished` books where `finished_at` in current year |
| Grid view | `BookGrid` + `ViewToggle`; `default_view` in settings |
| Cover upload | `CoverService.fileToDataUrl`; 2MB limit |
| Scroll restoration | Save `scrollY` in `LibraryStateContext` before navigate to detail |
| Multiple reading warning | Toast in `updateStatus` |

### P2 — Deferred

| Feature | Architectural note |
|---------|-------------------|
| Dark mode | `theme` in settings + Tailwind `dark:` + `prefers-color-scheme` |
| Keyboard shortcuts | Global `useKeyboardShortcuts`; `/` focuses search |
| PWA | `vite-plugin-pwa`; cache static assets only |
| Fuzzy duplicate detection on import | Client-side string similarity in `ImportExportService` |
| FlexSearch index | Add if library exceeds 5k books |

---

## Implementation Checklist (Senior Engineer)

Use this as a step-by-step shipping list. Check off in order.

### Scaffold & Foundation
- [ ] **1.** Initialize Vite + React + TypeScript project; configure path alias `@/` → `src/`
- [ ] **2.** Add Tailwind CSS, ESLint, Prettier, Vitest, fake-indexeddb
- [ ] **3.** Create all files in `src/types/` with domain interfaces
- [ ] **4.** Implement `src/db/schema.ts` (Dexie v1) and export singleton `db`
- [ ] **5.** Implement repositories: `book`, `reading-log`, `settings`
- [ ] **6.** Write repository integration tests

### Services & Logic
- [ ] **7.** Implement `utils/validation.ts` (Zod schemas)
- [ ] **8.** Implement `book.service.ts` (CRUD, status rules, delete cascade)
- [ ] **9.** Implement `progress.service.ts` (validate, log, update)
- [ ] **10.** Implement `library.service.ts` (search, filter, sort, stats)
- [ ] **11.** Implement `import-export.service.ts` (export, preview, merge, replace)
- [ ] **12.** Implement `settings.service.ts`
- [ ] **13.** Write service unit tests + export/import round-trip test

### UI Shell
- [ ] **14.** Build UI primitives (`Button`, `Input`, `Select`, `Dialog`, `Toast`, etc.)
- [ ] **15.** Build `AppShell`, `PageHeader`, `BottomNav`, `ToastContext`
- [ ] **16.** Configure React Router routes in `App.tsx`

### Hooks
- [ ] **17.** Implement `useDebouncedValue`, `useBooks`, `useBook`, `useReadingLog`, `useSettings`
- [ ] **18.** Implement `useFilteredBooks` with URL search params

### P0 Features (MVP)
- [ ] **19.** `LibraryPage` — list view, empty state, search, filters (US-01, US-06)
- [ ] **20.** `AddBookPage` + `BookForm` — validation, create book (US-02)
- [ ] **21.** `BookDetailPage` — meta, notes, reading log (US-07)
- [ ] **22.** `EditBookPage` + `DeleteBookDialog` (US-03)
- [ ] **23.** `StatusSelector` + quick status on library row (US-04)
- [ ] **24.** `ProgressSection` — update progress, show %, recent logs (US-05)
- [ ] **25.** `SettingsPage` + `DataSection` — export download, import with preview (US-08)
- [ ] **26.** Responsive layout — mobile + desktop verified
- [ ] **27.** QA all P0 acceptance criteria; fix bugs
- [ ] **28.** Write README with export/import docs

### P1 (post-MVP)
- [ ] **29.** Sort dropdown + persistence (US-10)
- [ ] **30.** Grid view toggle (US-01 grid)
- [ ] **31.** Cover file upload
- [ ] **32.** Multiple currently-reading warning toast
- [ ] **33.** Scroll/filter restoration on back navigation
- [ ] **34.** Annual reading goal in settings + header (US-09)

---

*End of architecture document.*