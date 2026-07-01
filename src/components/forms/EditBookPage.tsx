import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { BookForm } from './BookForm'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useBook } from '@/hooks/useBook'
import { bookService } from '@/services'
import type { CreateBookInput } from '@/types'

export function EditBookPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { book, loading } = useBook(id)

  async function handleSubmit(data: CreateBookInput, tagNames: string[]) {
    if (!id) return
    await bookService.update(id, data)
    await bookService.updateTags(id, tagNames)
    navigate(`/books/${id}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="py-20 text-center">
        <p className="text-stone-600">Book not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/')}>
          Back to library
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Edit Book" subtitle={book.title} />
      <div className="max-w-xl rounded-xl border border-stone-200 bg-white p-6">
        <BookForm
          initialValues={book}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/books/${book.id}`)}
          submitLabel="Save changes"
        />
      </div>
    </div>
  )
}