import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, LogOut, Plus, Settings } from 'lucide-react'
import { BottomNav } from './BottomNav'
import { ToastContainer } from '@/components/ui/Toast'
import { MigrationPrompt } from '@/components/auth/MigrationPrompt'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-amber-100 text-amber-900'
      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  }`

export function AppShell() {
  const { enabled, user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-amber-800" />
            <span className="font-serif text-xl font-bold text-stone-900">
              Bookworm
            </span>
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" className={navLinkClass} end>
              Library
            </NavLink>
            <NavLink to="/add" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                Add
              </span>
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Settings className="h-4 w-4" />
                Settings
              </span>
            </NavLink>
            {enabled && user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-stone-600"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>

      <BottomNav />
      <MigrationPrompt />
      <ToastContainer />
    </div>
  )
}