'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import { authClient } from '@/lib/auth-client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await authClient.signIn.email({ email, password })
      if (error) throw new Error(error.message || 'Sign in failed')

      // Hard redirect: forces a full page load so AdminLayout re-runs
      // isAuthenticated() with the newly-set session cookie. A client-side
      // router.push() keeps the shared layout alive in its unauthenticated
      // state and router.refresh() races with the navigation and loses.
      window.location.href = '/admin'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
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
            Welcome back
          </h1>
          <p
            className="text-[#5B6475] text-sm mb-8"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Sign in to manage posts, testimonials, and messages.
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

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div>
              <label
                className="block text-[#0B0F19] text-sm mb-2 font-medium"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                Password
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
              <Link
                href="/admin/forgot-password"
                className="inline-block mt-2 text-xs text-[#5B6475] hover:text-[#2563FF] transition-colors"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 px-4 py-3 bg-[#2563FF] text-white rounded-lg font-medium hover:bg-[#1D4ED8] disabled:opacity-50 transition-colors"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              {loading ? 'Please wait...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
