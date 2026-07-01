import { PageHeader } from '@/components/layout/PageHeader'
import { DataSection } from './DataSection'
import { useBooks } from '@/hooks/useBooks'

export function SettingsPage() {
  const { refresh } = useBooks()

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your data and preferences"
      />

      <div className="max-w-xl space-y-6">
        <DataSection onImportComplete={refresh} />

        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="mb-2 font-serif text-lg font-semibold text-stone-900">
            About
          </h2>
          <p className="text-sm text-stone-500">
            Bookworm is a local-first reading companion. Your data stays in your
            browser — no account required, no cloud sync.
          </p>
          <ul className="mt-3 list-inside list-disc text-sm text-stone-500">
            <li>All data stored locally in IndexedDB</li>
            <li>Export/import JSON for backup and portability</li>
            <li>Manual book entry only (no external APIs)</li>
          </ul>
        </section>
      </div>
    </div>
  )
}