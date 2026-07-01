import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { BookForm } from './BookForm'
import { bookService } from '@/services'
import type { CreateBookInput } from '@/types'

export function AddBookPage() {
  const navigate = useNavigate()

  async function handleSubmit(data: CreateBookInput, tagNames: string[]) {
    const book = await bookService.create(data, tagNames)
    navigate(`/books/${book.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Add Book"
        subtitle="Catalog a new title in your library"
      />
      <div className="max-w-xl rounded-xl border border-stone-200 bg-white p-6">
        <BookForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/')}
          submitLabel="Add book"
        />
      </div>
    </div>
  )
}