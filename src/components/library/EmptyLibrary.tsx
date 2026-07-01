import { useNavigate } from 'react-router-dom'
import { BookOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function EmptyLibrary() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-white px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-amber-50 p-4">
        <BookOpen className="h-10 w-10 text-amber-700" />
      </div>
      <h2 className="font-serif text-xl font-semibold text-stone-900">
        Your library is empty
      </h2>
      <p className="mt-2 max-w-sm text-stone-500">
        Start building your personal reading collection by adding your first book.
      </p>
      <Button className="mt-6" onClick={() => navigate('/books/new')}>
        <Plus className="h-4 w-4" />
        Add your first book
      </Button>
    </div>
  )
}