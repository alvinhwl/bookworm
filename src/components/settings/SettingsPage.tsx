import { PageHeader } from '@/components/layout/PageHeader'
import { isSupabaseEnabled } from '@/lib/supabase'
import { AccountSection } from './AccountSection'
import { PreferencesSection } from './PreferencesSection'
import { DataSection } from './DataSection'
import { useBooks } from '@/hooks/useBooks'

function LocalDataSection() {
  const { refresh } = useBooks()
  return <DataSection onImportComplete={refresh} />
}

export function SettingsPage() {
  const cloud = isSupabaseEnabled()

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle={cloud ? 'Account and preferences' : 'Manage your data and preferences'}
      />

      <div className="max-w-xl space-y-6">
        {cloud && <AccountSection />}
        <PreferencesSection />
        {!cloud && <LocalDataSection />}

        <section className="rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="mb-2 font-serif text-lg font-semibold text-stone-900">
            About Bookworm
          </h2>
          {cloud ? (
            <>
              <p className="text-sm text-stone-500">
                A calm reading companion with your library in the cloud — sign in
                from any device and pick up where you left off.
              </p>
              <ul className="mt-3 list-inside list-disc text-sm text-stone-500">
                <li>Books, progress, and reading logs synced to your account</li>
                <li>Tags, collections, and cover lookup from Open Library</li>
                <li>Your data is private to you — no social feeds or sharing</li>
              </ul>
            </>
          ) : (
            <>
              <p className="text-sm text-stone-500">
                Bookworm is a local-first reading companion. Your data stays in
                your browser — no account required.
              </p>
              <ul className="mt-3 list-inside list-disc text-sm text-stone-500">
                <li>All data stored locally in IndexedDB</li>
                <li>Export/import JSON for backup and portability</li>
                <li>Manual book entry with optional cover lookup</li>
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  )
}