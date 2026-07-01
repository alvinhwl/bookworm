# Bookworm v2 — Product Requirements

**Version:** 2.1  
**Status:** Approved — stakeholder decisions incorporated  
**Last updated:** July 1, 2026  
**Author:** Product Manager

---

## 1. Product Vision (v2)

Bookworm evolves from a **solo, local-first** reading tracker into a **multi-user, cloud-backed** reading companion. Users sign in from any device, manage standalone books and series collections, get automatic tag suggestions, and see a personal dashboard with meaningful reading statistics.

**What changes from v1:**

| v1 | v2 |
|----|-----|
| IndexedDB only | Cloud database (source of truth) |
| Single browser profile | User accounts with isolated libraries |
| Manual taxonomy (status + search) | Auto-suggested tags + collections |
| Library list as home | Dashboard as home; library as secondary view |
| Export/import for portability | Cloud sync; export/import retained as backup |

**What stays the same:**

- Manual book entry (no mandatory external API)
- Reading lifecycle: status, progress, reading log
- Calm, utility-first UX — no social feeds
- JSON export/import for backup and migration

---

## 2. Release Phasing

v2 is too large for one release. Build in dependency order:

| Phase | Theme | Features | Rationale |
|-------|-------|----------|-----------|
| **2.0** | Foundation | Cloud database, user accounts, data migration | Unblocks multi-device and multi-user |
| **2.1** | Organization | Auto-tags, collections | Richer catalog without changing auth |
| **2.2** | Insight | User dashboard | Needs stable cloud data + tags + collections |

**Recommended build order:** 4 → 3 → 1 → 2 → 5 (cloud and auth first; dashboard last).

---

## 3. User Stories

### US-20: Create an account and sign in

**As a** reader, **I want** to create an account and sign in, **so that** my library is available on any device and belongs only to me.

**Acceptance criteria:**
- User can sign up with **email + password only** (minimum 8 characters).
- User can sign in with email + password.
- User can sign out; session clears and protected routes redirect to login.
- Invalid credentials show a clear error without revealing whether email exists.
- Signed-in user lands on Dashboard (v2.2) or Library (v2.0 interim).
- Each user sees only their own books, collections, tags, logs, and settings.
- Password reset flow via email link (can ship in 2.0.1 if 2.0 is time-constrained).

**Decided:** Email/password is the sole auth method for v2.0–v2.2. OAuth (Google, GitHub, etc.) is deferred to a future release.

---

### US-21: Migrate from local v1 data to cloud

**As an** existing v1 user, **I want** to upload my local library after signing in, **so that** I don't lose my reading history when upgrading.

**Acceptance criteria:**
- On first sign-in, if browser has v1 IndexedDB data, app offers one-time migration.
- Migration imports all books, reading logs, and settings into the signed-in user's cloud library.
- Migration is idempotent: running twice does not duplicate records (match by book `id`).
- User can skip migration and start fresh.
- After successful migration, v1 local data remains untouched (user can export as backup).
- Migration summary shows counts: books added, logs added, skipped.

---

### US-22: Store library data in the cloud

**As a** signed-in reader, **I want** my books and progress saved to the cloud, **so that** changes sync when I use Bookworm on another device.

**Acceptance criteria:**
- All CRUD operations (books, progress, logs, settings) persist to cloud database.
- Data loads from cloud on sign-in; no manual import required for normal use.
- Optimistic UI with rollback on failure; user sees error toast if save fails.
- App remains usable on slow networks (loading states, retry).
- Row-level security: users cannot read or write another user's data.
- Cover images stored in cloud object storage or as managed blobs (not only base64 in DB rows).

---

### US-23: Auto-suggest tags when adding a book

**As a** reader, **I want** Bookworm to suggest 3–5 tags when I add a book, **so that** I can organize my library without typing taxonomy from scratch.

**Acceptance criteria:**
- On save (add or edit), system suggests **3–5 tags** derived from title, author, notes, and format.
- Suggestions appear before final save OR immediately after save on detail view — product choice: **show on form before save** so user can accept/edit.
- User can accept all, remove individual tags, or add custom tags.
- Tags are lowercase, trimmed, max 30 characters, max 10 tags per book.
- No duplicate tags on the same book.
- If suggestion service fails, book still saves; tags section shows "Add tags manually" with no blocking error.
- Tags are user-scoped (same tag string on two users' books are independent).
- Library supports filter by one or more tags (AND logic).
- Search includes tag names.

**Tag suggestion approach (PM recommendation):**
1. **Primary:** LLM or rules-based classifier using title + author + notes → 3–5 topical tags (e.g. `fantasy`, `sci-fi`, `memoir`, `business`).
2. **Fallback:** Keyword extraction from title/notes if AI unavailable.
3. **Never auto-save without user confirmation** on first add — pre-fill suggestions, user confirms.

---

### US-24: Add a standalone book or a collection

**As a** reader, **I want** to add either a single book or an entire collection, **so that** I can catalog series and one-offs appropriately.

**Acceptance criteria:**
- Add flow starts with choice: **Single book** | **Collection**.
- Single book uses existing form (extended with tags).
- Collection form captures: series name (required), author (required), optional cover, optional description, optional total planned volumes.
- User must add **at least one volume** before the collection can be saved — empty collections are not allowed.
- Collection creation is a single flow: metadata + first volume(s) → save creates both collection and books atomically.
- Validation blocks save if zero volumes are present; inline message: "Add at least one book to this collection."

---

### US-25: Add collection volumes (named titles vs numbered)

**As a** reader, **I want** two ways to add books inside a collection, **so that** I can model series where each volume has a unique title or shares the series name.

**Acceptance criteria:**

**Mode A — Named volumes** (each volume has its own title):
- User adds volumes one-by-one or in bulk (e.g. paste list).
- Each volume: title (required), optional volume number, format, status, pages.
- Library shows volume title; collection name shown as subtitle/badge.
- Example: Collection "The Wheel of Time" → volumes "The Eye of the World", "The Great Hunt", …

**Mode B — Numbered volumes** (shared series name):
- User specifies count (e.g. 7) OR adds volumes incrementally.
- Each volume uses **collection name as title**; distinguished by `volume_number` (required).
- Library shows "Harry Potter · Vol. 3" (or equivalent).
- User can set status/progress per volume independently.

**Shared collection rules:**
- Collection detail page lists all volumes with status and progress.
- Collection shows aggregate progress: "4 / 7 finished".
- A collection must always contain **at least one book**; collections with zero books cannot exist.
- A book belongs to at most one collection.
- User can move a standalone book into a collection later (edit flow).
- Removing the last book from a collection requires an explicit choice: **delete the collection** or **move the book out** (becomes standalone). The UI must not leave a collection in a zero-book state.

---

### US-26: View and manage collections in the library

**As a** reader, **I want** to browse collections alongside books, **so that** I can track series progress at a glance.

**Acceptance criteria:**
- Library view toggle or section: **All** | **Books** | **Collections**.
- Collection card/row shows: name, author, cover, volume count, finished count, aggregate status.
- Tap collection → Collection detail with volume list sorted by volume number then title.
- Search matches collection name and volume titles.
- Filter by collection on library (when viewing books).

---

### US-28: Delete a collection

**As a** reader, **I want** to delete a collection with control over what happens to its books, **so that** I can clean up my catalog without accidentally losing reading history.

**Acceptance criteria:**
- Collection detail and edit views expose a **Delete collection** action.
- Delete opens a confirmation dialog with two explicit options:

| Option | Behavior |
|--------|----------|
| **Delete collection and all books** (destructive) | Permanently removes the collection and every book within it, including reading logs. Requires secondary confirmation (e.g. checkbox: "I understand this cannot be undone"). |
| **Delete collection only — keep books** (default) | Removes the collection record; all books become **standalone** books. Reading status, progress, notes, tags, and reading logs are preserved. `collection_id` and collection-specific volume fields are cleared. |

- **Delete collection only** is the default/pre-selected option to reduce accidental data loss.
- After either action, the collection no longer appears in the library.
- If user chooses "keep books," each former volume appears in the standalone books list with its existing title and history intact.
- Cancel dismisses the dialog with no changes.

---

### US-27: Personal reading dashboard

**As a** signed-in reader, **I want** a dashboard with my reading statistics, **so that** I can understand my habits and progress at a glance.

**Acceptance criteria:**

Dashboard is the **default home route** after sign-in (`/`).

**Required widgets (v2.2 MVP):**

| Widget | Content |
|--------|---------|
| **Summary cards** | Total books · Currently reading · Finished (all time) · Finished this year |
| **Annual goal** | Progress bar toward user-defined goal (reuse v1 setting) |
| **Status breakdown** | Count or chart: Want to Read / Reading / Finished / DNF |
| **Format breakdown** | Physical / Ebook / Audiobook counts |
| **Recently finished** | Last 5 finished books with finish date |
| **Active collections** | Top 3 collections by % complete (at least 2 volumes) |

**Conditional widgets (show when data exists):**

| Widget | Content |
|--------|---------|
| **Top tags** | 5 most-used tags with book counts |
| **Reading pace** | Books finished per month (last 6 months) |
| **DNF rate** | % of started books marked DNF |

**UX rules:**
- Empty states per widget ("No finished books yet") — dashboard never looks broken for new users.
- Dashboard data scoped to signed-in user only.
- Tap a stat card → navigates to filtered library view.
- Mobile: single-column scroll; Desktop: 2-column grid.

---

## 4. Feature Priorities

### P0 — v2.0 Foundation (must ship first)

| ID | Story | Notes |
|----|-------|-------|
| US-20 | User accounts | Email/password via Supabase Auth (recommended) |
| US-22 | Cloud database | Replaces IndexedDB as source of truth |
| US-21 | v1 → cloud migration | Critical for existing users |

### P1 — v2.1 Organization

| ID | Story | Notes |
|----|-------|-------|
| US-23 | Auto-suggest tags | 3–5 tags; user confirms |
| US-24 | Add book or collection | New add-flow entry point |
| US-25 | Collection volume modes | Named vs numbered; min 1 book |
| US-26 | Collection browsing | Library integration |
| US-28 | Delete collection | Keep books or delete all |

### P1 — v2.2 Insight

| ID | Story | Notes |
|----|-------|-------|
| US-27 | User dashboard | New home page |

### P2 — Post v2.2

| Feature | Rationale |
|---------|-----------|
| OAuth (Google) sign-in | Convenience; not blocking |
| Shared household / family library | Different permission model |
| Reading streaks & heatmaps | Engagement; not core utility |
| ISBN lookup + richer metadata | External API dependency |
| Real-time sync indicators | Nice polish |
| Admin panel | No admin users in v2 |

---

## 5. Data Model (Product Level)

### User (new)

| Field | Description |
|-------|-------------|
| `id` | Unique user ID (from auth provider) |
| `email` | Login email |
| `display_name` | Optional friendly name |
| `created_at` | Account creation |

### Book (extended)

| Field | New/Changed | Description |
|-------|-------------|-------------|
| `user_id` | **New** | Owner; required on all rows |
| `collection_id` | **New** | Nullable FK to Collection |
| `volume_number` | **New** | Nullable; required when collection mode = numbered |
| `volume_mode` | **New** | `named` \| `numbered` \| null (standalone) |
| `tags` | **New** | Array of tag strings (denormalized) or junction table |
| *(existing fields)* | — | title, author, format, status, progress, etc. |

### Collection (new)

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `user_id` | Owner |
| `name` | Series / collection name |
| `author` | Primary author |
| `description` | Optional |
| `cover_url` | Optional |
| `volume_mode` | `named` \| `numbered` — fixed at creation |
| `expected_volume_count` | Optional planned total |
| `book_count` | Derived; must be ≥ 1 for collection to exist |
| `created_at` / `updated_at` | Timestamps |

**Invariant:** A `Collection` row must have `book_count ≥ 1`. Enforced at application layer; delete/move flows must never leave a collection empty.

### Tag (new)

| Field | Description |
|-------|-------------|
| `id` | Unique identifier |
| `user_id` | Owner |
| `name` | Normalized tag string (unique per user) |

### BookTag (junction, if normalized)

| Field | Description |
|-------|-------------|
| `book_id` | FK |
| `tag_id` | FK |

### ReadingLogEntry, UserSettings (extended)

- Add `user_id` to all entities.
- Settings become per-user (not singleton `'user'` key).

---

## 6. UX Flows (New / Changed)

### Flow H: Sign up → first use

```
Landing (logged out)
  → Sign up (email, password)
  → [If v1 local data detected] Migration prompt
      → Migrate now → Summary → Dashboard
      → Skip → Empty Dashboard
  → Dashboard (or Library until 2.2 ships)
```

### Flow I: Add collection (numbered mode)

```
Library → Add → Collection
  → Enter series name, author, choose "Numbered volumes"
  → "How many volumes?" (e.g. 7) — minimum 1
  → Bulk: creates N book rows titled [series name], vol 1–N, status Want to Read
  → Save (blocked until N ≥ 1) → Collection detail
```

### Flow J: Add collection (named mode)

```
Library → Add → Collection
  → Enter series name, author, choose "Named volumes"
  → Add at least one volume: title per book (+ optional vol #)
  → Save (blocked until ≥ 1 volume) → Collection detail with volume list
```

### Flow M: Delete collection

```
Collection detail → Delete collection
  → Dialog (default: "Delete collection only — keep books")
      → Keep books → collection removed; volumes become standalone in library
      → Delete all → extra confirmation → collection + all books + logs removed
  → Cancel → no changes
```

### Flow N: Remove last book from collection

```
Collection detail → Delete last remaining volume
  → Prompt: "This is the only book in the collection."
      → Delete book and collection
      → Move book out (standalone) and delete empty collection
  → Cannot silently leave collection with zero books
```

### Flow K: Add book with tag suggestions

```
Add → Single book → fill title, author, notes
  → Tags section shows 3–5 suggested tags (editable)
  → User adjusts tags → Save
  → Book detail with confirmed tags
```

### Flow L: Dashboard

```
Sign in → Dashboard (/)
  → Scan summary cards + charts
  → Tap "Finished this year" → Library filtered to finished + this year
  → Tap collection progress → Collection detail
```

---

## 7. Decided Product Rules

| Topic | Decision |
|-------|----------|
| **Authentication** | Email + password only for v2.0–v2.2. OAuth deferred. |
| **Collection minimum size** | Every collection must have ≥ 1 book. Cannot create or persist an empty collection. |
| **Collection delete** | User chooses: (1) delete collection only — keep all books as standalone (**default**), or (2) delete collection and all books (**destructive**, extra confirmation). |
| **Last book in collection** | Removing the final volume must either delete the collection or convert the book to standalone — never leave a zero-book collection. |
| **Multi-user access** | Isolated per-user libraries only; no shared libraries in v2. |

## 8. Open Questions for Architect

| # | Question | PM recommendation |
|---|----------|---------------------|
| 1 | Cloud provider? | **Supabase** (Postgres + Auth + Storage + RLS) — fits Vercel-hosted SPA |
| 2 | Tag suggestion implementation? | Server-side edge function calling LLM; cache by title+author hash |
| 3 | Offline / local fallback? | v2.0 is online-first; IndexedDB as read-cache optional in 2.3 |
| 4 | Auto-tag on edit? | Re-suggest only when user clicks "Suggest tags"; don't overwrite on every save |

---

## 9. Success Metrics (v2)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Sign-up to first book added | ≤ 2 minutes | Funnel analytics |
| v1 migration success rate | ≥ 95% | Migration job completion |
| Tag acceptance rate | ≥ 60% of suggestions kept | Diff suggested vs saved |
| Collection creation | ≥ 20% of users with 10+ books create ≥1 collection | Product analytics |
| Dashboard engagement | ≥ 50% of sessions start on dashboard | Route analytics |
| Cross-device return | User adds book on device A, sees it on device B within 30s | QA + integration test |

---

## 10. Definition of Done — v2

### v2.0
- [ ] User can sign up, sign in, sign out
- [ ] All book data stored in cloud with per-user isolation
- [ ] v1 local data migrates successfully
- [ ] Export/import still works (now includes user-scoped backup)
- [ ] Deployed on Vercel with env-configured cloud backend

### v2.1
- [ ] 3–5 tag suggestions on add book; user can edit
- [ ] Filter and search by tags
- [ ] Add single book or collection (collection requires ≥ 1 book at creation)
- [ ] Named and numbered collection volume modes
- [ ] Collection detail and library integration
- [ ] Delete collection with "keep books" (default) or "delete all" options
- [ ] Last-book removal never leaves an empty collection

### v2.2
- [ ] Dashboard is default home with all required widgets
- [ ] Stats link through to filtered library views
- [ ] Responsive layout on mobile and desktop

---

## 11. Dependencies & Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Auth + DB scope creep | Delays all features | Ship 2.0 before tags/collections |
| AI tag cost/latency | Slow add-book flow | Fallback rules; debounce; cache |
| Collection UX complexity | User confusion | Clear mode picker with examples; min-1-book validation |
| Accidental collection data loss | User trust | Default delete = keep books; destructive path needs extra confirm |
| v1 user data loss | Trust damage | Migration prompt + export retained |
| Cover image storage costs | Storage bills | Size limits; optional URL-only |

---

*Next step: Architect reviews this document and produces `docs/architecture-v2.md` with schema, API, and auth design. Senior Engineer implements phase 2.0 first.*