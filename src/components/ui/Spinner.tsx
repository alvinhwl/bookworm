export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-2 border-amber-200 border-t-amber-700 ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}