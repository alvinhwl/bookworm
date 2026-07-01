import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'muted'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-amber-100 text-amber-900',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-orange-100 text-orange-800',
  info: 'bg-sky-100 text-sky-800',
  muted: 'bg-stone-100 text-stone-600',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}