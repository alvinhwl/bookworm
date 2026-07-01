import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { LibraryPage } from '@/components/library/LibraryPage'
import { BookDetailPage } from '@/components/book/BookDetailPage'
import { AddBookPage } from '@/components/forms/AddBookPage'
import { EditBookPage } from '@/components/forms/EditBookPage'
import { SettingsPage } from '@/components/settings/SettingsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <LibraryPage /> },
      { path: 'books/new', element: <AddBookPage /> },
      { path: 'books/:id', element: <BookDetailPage /> },
      { path: 'books/:id/edit', element: <EditBookPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}