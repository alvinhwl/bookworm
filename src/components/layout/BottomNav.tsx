import { NavLink } from 'react-router-dom'
import { BookOpen, Plus, Settings } from 'lucide-react'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
    isActive ? 'text-amber-800' : 'text-stone-500 hover:text-stone-700'
  }`

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-3xl">
        <NavLink to="/" className={linkClass} end>
          <BookOpen className="h-5 w-5" />
          Library
        </NavLink>
        <NavLink to="/add" className={linkClass}>
          <Plus className="h-5 w-5" />
          Add
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
      </div>
    </nav>
  )
}