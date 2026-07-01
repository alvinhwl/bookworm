# Bookworm v1 — Product Requirements (MVP)

**Version:** 1.0  
**Status:** Draft  
**Last updated:** July 1, 2026

---

## 1. Product Vision

**Bookworm** is a personal, local-first reading companion that helps individuals track what they own, what they're reading, and what they've finished. It replaces scattered notes, spreadsheets, and mental lists with one calm place to manage a personal library.

Bookworm is for **solo readers** who want to stay organized without social pressure, subscriptions, or cloud lock-in. v1 targets readers who manually curate their collection—physical books, ebooks, and audiobooks—and want simple tools to add books, update progress, and find titles quickly on any device they use day to day.

---

## 2. User Stories

### US-01: View my library

**As a** reader, **I want** to see all my books in one library view, **so that** I can quickly understand what I own and my reading status.

**Acceptance criteria:**
- Library displays books as a list or grid with title, author, and reading status (Want to Read, Currently Reading, Finished, Did Not Finish).
- User can switch between list and grid layout; preference persists across sessions.
- Empty state explains how to add the first book with a clear call to action.
- Library loads from local storage without network dependency.
- Each book card/row is tappable to open book detail.

---

### US-02: Add a book manually

**As a** reader, **I want** to add a book by entering its details myself, **so that** I can catalog titles that aren't in any online database.

**Acceptance criteria:**
- Add Book form includes: title (required), author (required), format (physical / ebook / audiobook), optional cover image URL or file upload, optional ISBN, optional publication year, optional page count, optional notes.
- User selects initial reading status at add time (default: Want to Read).
- Validation prevents saving without title and author; shows inline errors.
- On save, book appears in library immediately without page reload.
- User can cancel and return to library without saving.

---

### US-03: Edit and delete a book

**As a** reader, **I want** to edit or remove books from my library, **so that** my collection stays accurate over time.

**Acceptance criteria:**
- Book detail view exposes Edit and Delete actions.
- Edit reuses the same fields as Add Book, pre-filled with current values.
- Delete requires confirmation ("Are you sure?") before permanent removal.
- Edits and deletes persist locally and reflect in library view immediately.
- Deleting a book also removes its associated reading log entries.

---

### US-04: Update reading status

**As a** reader, **I want** to change a book's reading status, **so that** I can track where each title sits in my reading life.

**Acceptance criteria:**
- Status options: Want to Read, Currently Reading, Finished, Did Not Finish.
- Status can be changed from book detail view and via quick action on library card/row.
- Changing to "Currently Reading" sets `started_at` if not already set.
- Changing to "Finished" sets `finished_at` and prompts user to confirm or adjust final page/progress.
- Changing to "Did Not Finish" optionally captures a reason in notes.
- Only one book may be marked "Currently Reading" at a time, OR user is warned (not blocked) if multiple are active—product decision: **warn, don't block** (some readers juggle multiple books).

---

### US-05: Track reading progress

**As a** reader, **I want** to log how far I've read, **so that** I can see momentum and know where I left off.

**Acceptance criteria:**
- Progress is tracked as current page (physical/ebook) or current time/chapter (audiobook).
- User can update progress from book detail with a simple numeric input or slider.
- Progress cannot exceed total pages/duration when those are set; validation message shown if exceeded.
- Each progress update is timestamped and stored in a reading log.
- Book detail shows: percent complete (when total known), last updated date, and recent log entries (last 5).
- Finished books display 100% or final page/time.

---

### US-06: Search and filter my library

**As a** reader, **I want** to search and filter books, **so that** I can find a specific title or group quickly.

**Acceptance criteria:**
- Search matches title, author, and notes (case-insensitive, partial match).
- Filters available: reading status, format (physical / ebook / audiobook).
- Filters and search can be combined (e.g., "Currently Reading" + "audiobook").
- Active filters are visibly indicated; user can clear all filters with one action.
- Results update as user types (debounced, ≤ 300ms feel).
- "No results" state suggests clearing filters or adding a new book.

---

### US-07: View book details and reading history

**As a** reader, **I want** a dedicated detail page for each book, **so that** I can see everything about one title in one place.

**Acceptance criteria:**
- Detail view shows: cover (or placeholder), title, author, format, status, progress, dates (added, started, finished), notes, and reading log.
- Notes field supports free-form multi-line text, editable inline or via edit mode.
- Reading log lists progress updates with date and value (e.g., "Page 142 — Mar 4, 2026").
- Back navigation returns to library preserving scroll position and active filters.

---

### US-08: Export and import my library

**As a** reader, **I want** to export and import my data, **so that** I can back up my library and move it between devices.

**Acceptance criteria:**
- Export produces a single JSON file containing all books and reading logs.
- Export is available from a Settings or Data section; download triggers immediately.
- Import accepts a previously exported JSON file; validates structure before merge.
- Import preview shows: books to add, books to update (matched by ID), and conflicts.
- User chooses: Merge (default) or Replace All (destructive, requires extra confirmation).
- Successful import shows summary count (added / updated / skipped).
- Invalid file shows clear error without corrupting existing data.

---

### US-09: Set reading goals (optional P1)

**As a** reader, **I want** to set a simple annual books-read goal, **so that** I stay motivated to finish more books.

**Acceptance criteria:**
- User can set a numeric goal (e.g., "Read 24 books in 2026") in Settings.
- Dashboard or library header shows progress toward goal (e.g., "12 / 24 finished this year").
- Only books marked Finished with `finished_at` in the current calendar year count.
- Goal is optional; UI degrades gracefully when unset.

---

### US-10: Sort my library

**As a** reader, **I want** to sort my library by different criteria, **so that** I can browse in the order most useful to me.

**Acceptance criteria:**
- Sort options: Title (A–Z), Author (A–Z), Date Added (newest/oldest), Date Finished (newest/oldest), Progress (highest/lowest).
- Current sort is visible in the UI and persists across sessions.
- Sort applies within the current filtered result set.
- Default sort: Date Added (newest first).

---

## 3. MVP Scope

### In Scope (v1)

| Area | Included |
|------|----------|
| **Library management** | Add, edit, delete books manually |
| **Reading lifecycle** | Status tracking, progress logging, reading history |
| **Discovery (local)** | Search, filter by status/format, sort |
| **Book detail** | Full detail view with notes and log |
| **Data ownership** | Local-first storage, JSON export/import |
| **UX basics** | List/grid toggle, empty states, responsive layout (desktop + mobile web) |
| **Covers** | Manual cover URL or local image upload (no auto-fetch) |

### Out of Scope (Deferred)

| Area | Rationale |
|------|-----------|
| Social features (sharing, friends, activity feeds) | Not core to solo reading workflow |
| AI recommendations or summaries | Adds complexity; not needed to manage a library |
| External API integrations (Google Books, Open Library, Goodreads sync) | v1 is manual-first; reduces dependencies and API keys |
| Multi-user accounts / authentication | Single-user, local-first for MVP |
| Cloud sync / cross-device real-time sync | Export/import covers portability for v1 |
| Barcode/ISBN lookup | Requires external API; defer to v2 |
| Reading statistics dashboards (charts, streaks, heatmaps) | P2; simple goal counter may suffice in P1 |
| Tags, shelves, custom collections beyond status | Adds taxonomy complexity; status + search covers MVP |
| Full-text book content or highlights/annotations sync | Out of product scope |
| Native mobile apps (iOS/Android) | Responsive web first |
| Email notifications or reminders | No notification infra in v1 |
| Offline PWA install / service worker | Nice enhancement; not blocking MVP |

---

## 4. Feature Priorities

### P0 — Must Have (MVP launch blockers)

- US-01: View library (list view minimum; grid optional if low cost)
- US-02: Add book manually
- US-03: Edit and delete book
- US-04: Update reading status
- US-05: Track reading progress
- US-06: Search and filter
- US-07: Book detail and reading history
- US-08: Export and import (JSON)
- Local persistence (data survives browser refresh/restart)
- Responsive layout usable on phone and desktop

### P1 — Should Have (high value, ship soon after P0)

- US-10: Sort library
- US-09: Annual reading goal
- Grid view toggle
- Cover image upload (local file)
- Multiple "Currently Reading" warning (soft constraint)
- Preserve scroll/filter state on navigation

### P2 — Nice to Have (if time permits)

- Dark mode / theme toggle
- Keyboard shortcuts (e.g., `/` to focus search)
- Bulk status update (select multiple books)
- Duplicate detection on import (fuzzy title+author match)
- Reading session timer (manual "I read for 30 min" log)
- PWA offline support

---

## 5. Data Model (Product Level)

### Book

The central entity representing a title in the user's library.

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (stable across export/import) |
| `title` | Book title |
| `author` | Primary author (single string; multi-author as "Author A, Author B") |
| `format` | `physical` \| `ebook` \| `audiobook` |
| `status` | `want_to_read` \| `currently_reading` \| `finished` \| `dnf` |
| `cover_url` | Optional URL or local reference to cover image |
| `isbn` | Optional ISBN-10 or ISBN-13 |
| `published_year` | Optional publication year |
| `total_pages` | Optional; used for physical/ebook progress % |
| `total_duration_minutes` | Optional; used for audiobook progress % |
| `current_progress` | Current page number or minutes listened |
| `notes` | Free-form user notes |
| `started_at` | Date reading began (auto-set on status → Currently Reading) |
| `finished_at` | Date marked Finished |
| `created_at` | When book was added to library |
| `updated_at` | Last modification timestamp |

### ReadingLogEntry

A timestamped record of a progress update.

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `book_id` | Reference to Book |
| `value` | Page number or minutes at time of log |
| `note` | Optional short note ("Chapter 12", "Halfway!") |
| `logged_at` | Timestamp of entry |

### UserSettings

App-level preferences stored locally.

| Field | Description |
|-------|-------------|
| `annual_goal` | Optional target number of books to finish this year |
| `default_view` | `list` \| `grid` |
| `default_sort` | Sort field and direction |
| `theme` | `light` \| `dark` \| `system` (P2) |

### ExportBundle

Conceptual shape of exported data (not a stored entity).

| Field | Description |
|-------|-------------|
| `version` | Schema version for forward compatibility |
| `exported_at` | Export timestamp |
| `books` | Array of Book objects |
| `reading_log` | Array of ReadingLogEntry objects |
| `settings` | UserSettings object |

---

## 6. UX Flows

### Flow A: First-time user → Add first book

```
Landing / Empty Library
    → Tap "Add your first book"
    → Add Book form (title, author required)
    → Select status (default: Want to Read)
    → Save
    → Library view with one book card
```

**Key UX notes:** Onboarding is action-oriented—no account creation, no tutorial carousel. Empty state is the onboarding.

---

### Flow B: Library browsing

```
Open app → Library (default view)
    → [Optional] Toggle list/grid
    → [Optional] Apply filter (status, format)
    → [Optional] Type in search bar
    → [Optional] Change sort order
    → Tap book → Book Detail
```

**Key UX notes:** Filters and search persist until cleared. Library header shows count: "24 books · 3 currently reading".

---

### Flow C: Add a new book

```
Library → "+" or "Add Book" button
    → Add Book form
    → Fill required fields (title, author)
    → [Optional] Add cover, ISBN, pages, notes
    → Set initial status
    → Save → Book Detail (or back to Library — prefer Book Detail for confirmation)
```

**Validation:** Inline errors on blur/submit. Save button disabled until required fields valid.

---

### Flow D: Update reading progress

```
Library or Book Detail
    → "Update progress" action
    → Enter current page (or minutes for audiobook)
    → [Optional] Add session note
    → Save
    → Progress bar and % refresh
    → New entry appears in reading log
```

**Shortcut from Book Detail:** Progress inline editor (not a separate modal) for speed.

---

### Flow E: Mark book as finished

```
Book Detail
    → Change status to "Finished"
    → If progress < total: prompt "Mark as 100% complete?"
    → Set finished_at (default: today, editable)
    → Save
    → Status badge updates; book appears in Finished filter
    → [If goal set] Goal counter increments
```

---

### Flow F: Export / Import data

**Export:**
```
Settings / Data
    → "Export library"
    → JSON file downloads (bookworm-export-YYYY-MM-DD.json)
```

**Import:**
```
Settings / Data
    → "Import library"
    → Select JSON file
    → Preview summary (add / update / conflicts)
    → Choose Merge or Replace All
    → Confirm → Success toast with counts
```

---

### Flow G: Edit or delete a book

```
Book Detail
    → Edit → Modify fields → Save (or Cancel)
    OR
    → Delete → Confirm dialog → Removed from library
```

---

## 7. Success Metrics

### Primary (MVP validation)

| Metric | Target | How to measure |
|--------|--------|----------------|
| **Core loop completion** | ≥ 80% of test users can add a book, update progress, and find it via search in < 3 min | Usability test (5 users) |
| **Data persistence** | 100% of books/progress survive refresh and browser restart | QA test cases |
| **Export/import fidelity** | 100% record match after export → import round-trip | Automated integration test |
| **Search usefulness** | User finds intended book in ≤ 3 keystrokes (title search) | Usability test |

### Secondary (post-launch, if analytics added locally)

| Metric | Target | Notes |
|--------|--------|-------|
| **Books per user** | Median ≥ 10 within first week | Indicates real adoption |
| **Progress updates per active book** | ≥ 2 updates per "Currently Reading" book | Indicates ongoing engagement |
| **Finished rate** | ≥ 30% of books reach Finished status | Validates lifecycle tracking value |

### Non-goals for v1 metrics

- Daily active users (single-user, local app—DAU less meaningful)
- Viral/social sharing
- Time-on-site maximization (utility app, not engagement bait)

### Definition of Done — MVP Shipped

- [ ] All P0 user stories pass acceptance criteria
- [ ] Works in latest Chrome, Firefox, Safari (desktop + mobile)
- [ ] No data loss on normal usage paths
- [ ] Export/import documented in a brief README
- [ ] Known limitations listed (no cloud sync, manual entry only)

---

## Appendix: Assumptions & Open Questions

### Assumptions

1. Single user per browser/device profile; no login required.
2. Data stored in browser local storage (IndexedDB or equivalent)—Architect to decide.
3. English UI for v1; i18n deferred.
4. One author string is sufficient; no separate contributor model.

### Open Questions (for Architect / PM follow-up)

1. **Cover images:** Store as base64 in export, or reference local blob URLs only (import won't restore covers)? Recommendation: base64 in export for portability.
2. **Audiobook progress:** Minutes vs. percentage vs. chapter—MVP uses minutes; confirm with early users.
3. **Duplicate books:** Allow same title/author twice (e.g., physical + ebook)? Recommendation: allow, distinguish by format field.

---

*End of requirements document.*