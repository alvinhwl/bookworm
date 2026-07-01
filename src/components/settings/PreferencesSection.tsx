import { useEffect, useState } from 'react'
import type { SortOption } from '@/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { useSettings } from '@/hooks/useSettings'
import { useToast } from '@/context/ToastContext'

const SORT_PRESETS: { value: string; label: string; sort: SortOption }[] = [
  { value: 'created_at:desc', label: 'Recently added', sort: { field: 'created_at', direction: 'desc' } },
  { value: 'title:asc', label: 'Title A–Z', sort: { field: 'title', direction: 'asc' } },
  { value: 'author:asc', label: 'Author A–Z', sort: { field: 'author', direction: 'asc' } },
  { value: 'finished_at:desc', label: 'Recently finished', sort: { field: 'finished_at', direction: 'desc' } },
  { value: 'progress:desc', label: 'Reading progress', sort: { field: 'progress', direction: 'desc' } },
]

function sortToPresetValue(sort: SortOption): string {
  return `${sort.field}:${sort.direction}`
}

export function PreferencesSection() {
  const { settings, loading, update } = useSettings()
  const { showToast } = useToast()
  const [annualGoal, setAnnualGoal] = useState('')
  const [sortPreset, setSortPreset] = useState(SORT_PRESETS[0].value)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!settings) return
    setAnnualGoal(settings.annual_goal?.toString() ?? '')
    setSortPreset(sortToPresetValue(settings.default_sort))
  }, [settings])

  async function saveAnnualGoal(raw: string) {
    const trimmed = raw.trim()
    const goal = trimmed === '' ? null : Number(trimmed)
    if (goal !== null && (!Number.isInteger(goal) || goal < 1)) {
      showToast('Enter a whole number of books, or leave blank', 'warning')
      return
    }
    setSaving(true)
    try {
      await update({ annual_goal: goal })
    } catch {
      showToast('Could not save reading goal', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function saveSort(value: string) {
    const preset = SORT_PRESETS.find((p) => p.value === value)
    if (!preset) return
    setSortPreset(value)
    setSaving(true)
    try {
      await update({ default_sort: preset.sort })
    } catch {
      showToast('Could not save sort preference', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="flex justify-center rounded-xl border border-stone-200 bg-white p-8">
        <Spinner />
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="mb-2 font-serif text-lg font-semibold text-stone-900">
        Preferences
      </h2>
      <p className="mb-4 text-sm text-stone-500">
        Saved to your account and applied across devices.
      </p>

      <div className="space-y-5">
        <Input
          label="Annual reading goal"
          type="number"
          min={1}
          value={annualGoal}
          onChange={(e) => setAnnualGoal(e.target.value)}
          onBlur={() => void saveAnnualGoal(annualGoal)}
          placeholder="Optional — books to finish this year"
          disabled={saving}
        />

        <Select
          label="Default library sort"
          options={SORT_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
          value={sortPreset}
          onChange={(e) => void saveSort(e.target.value)}
          disabled={saving}
        />
      </div>
    </section>
  )
}