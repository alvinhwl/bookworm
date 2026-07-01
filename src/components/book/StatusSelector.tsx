import type { ReadingStatus } from '@/types'
import { READING_STATUS_LABELS } from '@/utils/status'
import { Select } from '@/components/ui/Select'

const statusOptions = (
  Object.entries(READING_STATUS_LABELS) as [ReadingStatus, string][]
).map(([value, label]) => ({ value, label }))

interface StatusSelectorProps {
  status: ReadingStatus
  onChange: (status: ReadingStatus) => void
}

export function StatusSelector({ status, onChange }: StatusSelectorProps) {
  return (
    <Select
      label="Reading status"
      options={statusOptions}
      value={status}
      onChange={(e) => onChange(e.target.value as ReadingStatus)}
    />
  )
}