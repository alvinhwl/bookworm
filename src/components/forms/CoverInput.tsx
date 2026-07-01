import { useRef } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { coverService } from '@/services'
import { ImagePlus } from 'lucide-react'

interface CoverInputProps {
  value: string | null
  onChange: (url: string | null) => void
  error?: string
}

export function CoverInput({ value, onChange, error }: CoverInputProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await coverService.fileToDataUrl(file)
      onChange(dataUrl)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload cover')
    }
    e.target.value = ''
  }

  return (
    <div className="space-y-3">
      <Input
        label="Cover image URL"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder="https://example.com/cover.jpg"
        error={error}
      />
      <div className="flex items-center gap-3">
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