import { useState, type KeyboardEvent } from 'react'
import { X, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { normalizeTagName } from '@/utils/tag-suggestion'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  onSuggest?: () => void
  suggesting?: boolean
  label?: string
}

export function TagInput({
  tags,
  onChange,
  onSuggest,
  suggesting = false,
  label = 'Tags',
}: TagInputProps) {
  const [draft, setDraft] = useState('')

  function addTag(raw: string) {
    const name = normalizeTagName(raw)
    if (!name || tags.includes(name) || tags.length >= 10) return
    onChange([...tags, name])
    setDraft('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(draft)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-stone-700">{label}</label>
        {onSuggest && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSuggest}
            disabled={suggesting}
          >
            <Sparkles className="h-4 w-4" />
            {suggesting ? 'Suggesting…' : 'Suggest tags'}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="group inline-flex items-center gap-1"
          >
            <Badge variant="default">{tag}</Badge>
            <X className="h-3 w-3 text-stone-400 group-hover:text-stone-600" />
          </button>
        ))}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a tag and press Enter"
      />
      <p className="text-xs text-stone-500">Up to 10 tags, lowercase, max 30 characters.</p>
    </div>
  )
}

