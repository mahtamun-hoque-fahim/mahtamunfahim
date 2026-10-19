'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { authClient } from '@/lib/auth-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/admin/reset-password`,
      })
      if (error) throw new Error(error.message || 'Failed to send reset email')
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#FFFFFF]">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-block mb-12" aria-label="Mahtamun — home">
            <Logo height={26} />
          </Link>

          <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-2xl p-8 text-center">
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
              Check your email
            </h1>
            <p
              className="text-[#5B6475] text-sm mb-8"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              We sent a password reset link to <strong>{email}</strong>. Click the link in
              your email to create a new password.
            </p>

            <p
              className="text-[#5B6475] text-xs mb-8"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              The link expires in 24 hours. Check spam if you don&apos;t see it.
            </p>

            <Link
              href="/admin/login"
              className="inline-block px-6 py-3 bg-[#2563FF] text-white rounded-lg font-medium hover:bg-[#1D4ED8] transition-colors"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              Back to sign in
            </Link>
          </div>
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
            Reset password
          </h1>
          <p
            className="text-[#5B6475] text-sm mb-8"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Enter your email and we&apos;ll send you a link to reset your password.
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
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
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
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <p
            className="text-[#5B6475] text-sm text-center mt-6"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Remember your password?{' '}
            <Link
              href="/admin/login"
              className="text-[#2563FF] hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
