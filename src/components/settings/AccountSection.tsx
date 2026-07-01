import { useNavigate } from 'react-router-dom'
import { LogOut, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export function AccountSection() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="mb-2 font-serif text-lg font-semibold text-stone-900">
        Account
      </h2>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Cloud className="h-5 w-5 text-amber-800" />
        </div>
        <div>
          <p className="font-medium text-stone-900">{user?.email ?? 'Signed in'}</p>
          <p className="mt-1 text-sm text-stone-500">
            Your library is stored in the cloud and stays in sync across devices.
          </p>
        </div>
      </div>
      <Button variant="secondary" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </section>
  )
}