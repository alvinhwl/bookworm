interface ProgressBarProps {
  percent: number | null
}

export function ProgressBar({ percent }: ProgressBarProps) {
  const value = percent ?? 0

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
      <div
        className="h-full rounded-full bg-amber-600 transition-all duration-300"
        style={{ width: `${value}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}