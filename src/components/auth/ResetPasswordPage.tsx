import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthLayout } from './AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ResetPasswordPage() {
  const { enabled, resetPassword, updatePassword, session } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isRecovery = Boolean(session)

  if (!enabled) return <Navigate to="/" replace />

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)
    try {
      await resetPassword(email.trim())
      setMessage('Check your email for a password reset link.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      await updatePassword(password)
      setMessage('Password updated. You can sign in with your new password.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title={isRecovery ? 'Set new password' : 'Reset password'}
      subtitle={
        isRecovery
          ? 'Enter a new password for your account.'
          : 'We will email you a link to reset your password.'
      }
    >
      {isRecovery ? (
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            Update password
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRequest} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-stone-600">
        <Link to="/login" className="text-amber-800 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}