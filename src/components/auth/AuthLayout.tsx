import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-9 w-9 text-amber-800" />
          <span className="font-serif text-2xl font-bold text-stone-900">
            Bookworm
          </span>
        </Link>
        <h1 className="mt-4 text-xl font-semibold text-stone-900">{title}</h1>
        <p className="max-w-sm text-sm text-stone-600">{subtitle}</p>
      </div>
      <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  )
}