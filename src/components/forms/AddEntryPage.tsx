import { useNavigate } from 'react-router-dom'
import { BookOpen, Library } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function AddEntryPage() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        title="Add to library"
        subtitle="Catalog a single book or an entire collection"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="cursor-pointer p-6 transition-shadow hover:shadow-md" onClick={() => navigate('/books/new')}>
          <BookOpen className="mb-3 h-8 w-8 text-amber-800" />
          <h2 className="font-serif text-lg font-semibold text-stone-900">Single book</h2>
          <p className="mt-2 text-sm text-stone-600">
            Add one title with tags, cover, and reading status.
          </p>
          <Button className="mt-4" onClick={() => navigate('/books/new')}>
            Add book
          </Button>
        </Card>
        <Card className="cursor-pointer p-6 transition-shadow hover:shadow-md" onClick={() => navigate('/collections/new')}>
          <Library className="mb-3 h-8 w-8 text-amber-800" />
          <h2 className="font-serif text-lg font-semibold text-stone-900">Collection</h2>
          <p className="mt-2 text-sm text-stone-600">
            Add a series with named volumes or numbered editions.
          </p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate('/collections/new')}>
            Add collection
          </Button>
        </Card>
      </div>
    </div>
  )
}