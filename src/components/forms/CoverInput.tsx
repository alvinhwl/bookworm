import { useRef } from 'react'
import { ImagePlus, Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { coverService } from '@/services'

interface CoverInputProps {
  value: string | null
  onChange: (url: string | null) => void
  onManualChange?: (url: string | null) => void
  lookingUp?: boolean
  autoFound?: boolean
  onLookup?: () => void
  error?: string
}

export function CoverInput({
  value,
  onChange,
  onManualChange,
  lookingUp = false,
  autoFound = false,
  onLookup,
  error,
}: CoverInputProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleUrlChange(next: string | null) {
    onManualChange?.(next)
    onChange(next)
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await coverService.fileToDataUrl(file)
      handleUrlChange(dataUrl)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload cover')
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      <Input
        label="Cover image"
        value={value ?? ''}
        onChange={(e) => handleUrlChange(e.target.value || null)}
        placeholder="Found automatically, or paste a URL"
        error={error}
      />

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          Upload image
        </Button>

        {onLookup && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onLookup}
            disabled={lookingUp}
          >
            {lookingUp ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Find cover online
          </Button>
        )}

        {lookingUp && (
          <span className="text-sm text-stone-500">Looking up cover…</span>
        )}

        {!lookingUp && autoFound && value && (
          <span className="text-sm text-emerald-700">Cover found online</span>
        )}

        {value && (
          <img
            src={value}
            alt="Cover preview"
            className="h-16 w-11 rounded object-cover"
          />
        )}
      </div>
    </div>
  )
}