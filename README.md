# Bookworm

A personal, local-first reading companion for tracking your library, reading progress, and finished books. All data stays in your browser — no account, no cloud.

## Features

- **Library management** — Add, edit, and delete books manually
- **Reading lifecycle** — Track status (Want to Read, Currently Reading, Finished, DNF) and log progress
- **Search & filter** — Find books by title, author, or notes; filter by status and format
- **Book detail** — View cover, metadata, notes, progress, and reading history
- **Export / import** — Backup and restore your library as JSON

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Install & run

```bash
cd bookworm
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

### Run tests

```bash
npm test
```

## Export & Import

### Export

1. Go to **Settings**
2. Click **Export library**
3. A JSON file downloads: `bookworm-export-YYYY-MM-DD.json`

The export includes all books, reading log entries, and app settings.

### Import

1. Go to **Settings**
2. Click **Import library** and select a previously exported JSON file
3. Review the preview (books to add/update, log entries)
4. Choose:
   - **Merge (recommended)** — Adds new books and updates existing ones matched by ID
   - **Replace all** — Deletes your current library and replaces it entirely (requires confirmation checkbox)

### Export file format

```json
{
  "version": 1,
  "exported_at": "2026-07-01T14:30:00.000Z",
  "books": [ /* Book objects */ ],
  "reading_log": [ /* ReadingLogEntry objects */ ],
  "settings": {
    "annual_goal": null,
    "default_view": "list",
    "default_sort": { "field": "created_at", "direction": "desc" },
    "theme": "light"
  }
}
```

Cover images uploaded as files are stored as base64 data URLs and included in exports for portability.

## Data storage

- All data is stored in **IndexedDB** (via Dexie.js) in your browser
- Data persists across page refreshes and browser restarts
- Clearing browser data will delete your library — use export for backups
- No cloud sync; use export/import to move data between devices

## Known limitations (v1)

- Single user per browser profile (no authentication)
- Manual book entry only (no ISBN lookup or external APIs)
- No real-time cross-device sync
- English UI only

## Tech stack

- React 19 + TypeScript + Vite
- React Router 7
- Dexie.js (IndexedDB)
- Tailwind CSS 4
- Vitest + Testing Library

## Project structure

```
src/
├── types/          # Domain types
├── db/             # Dexie schema
├── repositories/   # Data access layer
├── services/       # Business logic
├── hooks/          # React hooks
├── components/     # UI components
├── utils/          # Pure utilities
└── context/        # React context providers
```

## License

Private / personal use.