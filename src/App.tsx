import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { isSupabaseEnabled } from '@/lib/supabase'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/components/auth/LoginPage'
import { SignUpPage } from '@/components/auth/SignUpPage'
import { ResetPasswordPage } from '@/components/auth/ResetPasswordPage'
import { AppShell } from '@/components/layout/AppShell'
import { LibraryPage } from '@/components/library/LibraryPage'
import { BookDetailPage } from '@/components/book/BookDetailPage'
import { AddEntryPage } from '@/components/forms/AddEntryPage'
import { AddBookPage } from '@/components/forms/AddBookPage'
import { AddCollectionPage } from '@/components/collections/AddCollectionPage'
import { CollectionDetailPage } from '@/components/collections/CollectionDetailPage'
import { EditBookPage } from '@/components/forms/EditBookPage'
import { SettingsPage } from '@/components/settings/SettingsPage'

const useCloud = isSupabaseEnabled()

const shell = useCloud ? (
  <ProtectedRoute>
    <AppShell />
  </ProtectedRoute>
) : (
  <AppShell />
)

const router = createBrowserRouter([
  ...(useCloud
    ? [
        { path: '/login', element: <LoginPage /> },
        { path: '/signup', element: <SignUpPage /> },
        { path: '/reset-password', element: <ResetPasswordPage /> },
      ]
    : []),
  {
    path: '/',
    element: shell,
    children: [
      { index: true, element: <LibraryPage /> },
      { path: 'add', element: <AddEntryPage /> },
      { path: 'books/new', element: <AddBookPage /> },
      { path: 'collections/new', element: <AddCollectionPage /> },
      { path: 'collections/:id', element: <CollectionDetailPage /> },
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