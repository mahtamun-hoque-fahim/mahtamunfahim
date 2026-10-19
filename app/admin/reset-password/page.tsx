'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { authClient } from '@/lib/auth-client'

function ResetPasswordInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#FFFFFF]">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="inline-block mb-12" aria-label="Mahtamun — home">
            <Logo height={26} className="mx-auto" />
          </Link>
          <p
            className="text-[#5B6475]"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Invalid or expired reset link.{' '}
            <Link
              href="/admin/forgot-password"
              className="text-[#2563FF] hover:underline"
            >
              Request a new one
            </Link>
          </p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      })
      if (error) throw new Error(error.message || 'Failed to reset password')

      setSuccess(true)
      setTimeout(() => router.push('/admin/login'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#FFFFFF]">
        <div className="w-full max-w-md text-center">
          <div
            className="w-12 h-12 rounded-full bg-[#2563FF]/10 border border-[#2563FF]/30 flex items-center justify-center mx-auto mb-6"
            aria-hidden="true"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563FF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold text-[#0B0F19] mb-2"
            style={{ fontFamily: 'var(--font-clash)' }}
          >
            Password reset
          </h1>
          <p className="text-[#5B6475]" style={{ fontFamily: 'var(--font-jakarta)' }}>
            Your password has been reset successfully. Redirecting to sign in...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#FFFFFF]">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-block mb-12" aria-label="Mahtamun — home">
          <Logo height={26} />
        </Link>

        <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-2xl p-8">
          <h1
            className="text-2xl font-bold text-[#0B0F19] mb-2"
            style={{ fontFamily: 'var(--font-clash)' }}
          >
            Create new password
          </h1>
          <p
            className="text-[#5B6475] text-sm mb-8"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Enter a new password for your account.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p
                className="text-red-600 text-sm"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-[#0B0F19] text-sm mb-2 font-medium"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg text-[#0B0F19] placeholder-[#6B7280] focus:outline-none focus:border-[#2563FF] transition-colors"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              />
            </div>

            <div>
              <label
                className="block text-[#0B0F19] text-sm mb-2 font-medium"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="w-full px-4 py-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg text-[#0B0F19] placeholder-[#6B7280] focus:outline-none focus:border-[#2563FF] transition-colors"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-3 bg-[#2563FF] text-white rounded-lg font-medium hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  )
}
