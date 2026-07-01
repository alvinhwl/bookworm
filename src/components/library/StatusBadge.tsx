import type { ReadingStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { READING_STATUS_LABELS } from '@/utils/status'

const statusVariants: Record<
  ReadingStatus,
  'default' | 'success' | 'warning' | 'info' | 'muted'
> = {
  want_to_read: 'muted',
  currently_reading: 'info',
  finished: 'success',
  dnf: 'warning',
}

interface StatusBadgeProps {
  status: ReadingStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]}>
      {READING_STATUS_LABELS[status]}
    </Badge>
  )
}