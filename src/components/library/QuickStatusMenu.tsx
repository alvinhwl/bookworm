import type { ReadingStatus } from '@/types'
import { READING_STATUS_LABELS } from '@/utils/status'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const statuses: ReadingStatus[] = [
  'want_to_read',
  'currently_reading',
  'finished',
  'dnf',
]

interface QuickStatusMenuProps {
  status: ReadingStatus
  onStatusChange: (status: ReadingStatus) => void
}

export function QuickStatusMenu({ status, onStatusChange }: QuickStatusMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-medium text-stone-600 hover:bg-stone-50"
        aria-label="Change status"
      >
        {READING_STATUS_LABELS[status]}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 min-w-[160px] rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={(e) => {
                e.stopPropagation()
                onStatusChange(s)
                setOpen(false)
              }}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-stone-50 ${
                s === status ? 'font-medium text-amber-800' : 'text-stone-700'
              }`}
            >
              {READING_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}