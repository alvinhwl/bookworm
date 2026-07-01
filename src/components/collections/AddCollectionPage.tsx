import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { VolumeMode } from '@/types'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { CoverInput } from '@/components/forms/CoverInput'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { collectionService, coverLookupService } from '@/services'
export function AddCollectionPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [coverLookingUp, setCoverLookingUp] = useState(false)
  const [coverAutoFound, setCoverAutoFound] = useState(false)
  const coverManualRef = useRef(false)
  const debouncedName = useDebouncedValue(name, 500)
  const debouncedAuthor = useDebouncedValue(author, 500)
  const [volumeMode, setVolumeMode] = useState<VolumeMode>('named')
  const [expectedCount, setExpectedCount] = useState('')
  const [namedTitles, setNamedTitles] = useState('')
  const [numberedCount, setNumberedCount] = useState('1')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isValid = name.trim() && author.trim()

  useEffect(() => {
    if (coverManualRef.current) return
    if (!debouncedName.trim() || !debouncedAuthor.trim()) return

    let cancelled = false
    setCoverLookingUp(true)

    void coverLookupService
      .lookup({ title: debouncedName, author: debouncedAuthor })
      .then((url) => {
        if (cancelled || coverManualRef.current) return
        setCoverUrl(url)
        setCoverAutoFound(Boolean(url))
      })
      .finally(() => {
        if (!cancelled) setCoverLookingUp(false)
      })

    return () => {
      cancelled = true
    }
  }, [debouncedName, debouncedAuthor])

  async function handleFindCover() {
    if (!name.trim() || !author.trim()) return

    coverManualRef.current = false
    setCoverLookingUp(true)
    try {
      const url = await coverLookupService.lookup({ title: name, author })
      setCoverUrl(url)
      setCoverAutoFound(Boolean(url))
    } finally {
      setCoverLookingUp(false)
    }
  }

  function handleCoverManualChange() {
    coverManualRef.current = true
    setCoverAutoFound(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    let volumes: { title: string; volume_number?: number }[] = []

    if (volumeMode === 'named') {
      volumes = namedTitles
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((title) => ({ title }))
    } else {
      const count = Number(numberedCount)
      if (!Number.isInteger(count) || count < 1) {
        setError('Enter a valid volume count (at least 1).')
        return
      }
      volumes = Array.from({ length: count }, (_, i) => ({
        title: name.trim(),
        volume_number: i + 1,
      }))
    }

    if (volumes.length < 1) {
      setError('Add at least one book to this collection.')
      return
    }

    setSubmitting(true)
    try {
      const collection = await collectionService.create({
        name: name.trim(),
        author: author.trim(),
        description,
        cover_url: coverUrl,
        volume_mode: volumeMode,
        expected_volume_count: expectedCount ? Number(expectedCount) : null,
        volumes,
      })
      navigate(`/collections/${collection.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Add Collection" subtitle="Catalog a series or multi-volume set" />
      <div className="max-w-xl rounded-xl border border-stone-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Series name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
          <CoverInput
            value={coverUrl}
            onChange={setCoverUrl}
            onManualChange={handleCoverManualChange}
            lookingUp={coverLookingUp}
            autoFound={coverAutoFound}
            onLookup={handleFindCover}
          />

          <Select
            label="Volume style"
            options={[
              { value: 'named', label: 'Named volumes (each book has its own title)' },
              { value: 'numbered', label: 'Numbered volumes (shared series name)' },
            ]}
            value={volumeMode}
            onChange={(e) => setVolumeMode(e.target.value as VolumeMode)}
          />

          <Input
            label="Expected total volumes"
            type="number"
            min={1}
            value={expectedCount}
            onChange={(e) => setExpectedCount(e.target.value)}
            placeholder="Optional"
          />

          {volumeMode === 'named' ? (
            <Textarea
              label="Volume titles"
              value={namedTitles}
              onChange={(e) => setNamedTitles(e.target.value)}
              placeholder={'One title per line\ne.g.\nThe Eye of the World\nThe Great Hunt'}
              rows={6}
            />
          ) : (
            <Input
              label="Number of volumes"
              type="number"
              min={1}
              value={numberedCount}
              onChange={(e) => setNumberedCount(e.target.value)}
              required
            />
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={!isValid || submitting}>
              {submitting ? 'Saving…' : 'Create collection'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/add')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}