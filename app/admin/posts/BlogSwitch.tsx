'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { setBlogEnabledAction } from '@/app/admin/actions'

/** Shows or hides the whole blog on the public site. Posts stay editable either way. */
export default function BlogSwitch({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = useState(initial)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  const toggle = () => {
    const next = !enabled
    setError('')
    start(async () => {
      const res = await setBlogEnabledAction(next)
      if (res.error) setError(res.error)
      else setEnabled(next)
    })
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-5 mb-8 flex items-start justify-between gap-6" style={{ fontFamily: 'var(--font-jakarta)' }}>
      <div>
        <p className="font-semibold text-[#0B0F19]">Blog on the public site: {enabled ? 'on' : 'off'}</p>
        <p className="text-sm text-[#5B6475] mt-1 max-w-xl">
          {enabled
            ? 'Published posts show on /blog, in the navbar, the footer, the homepage and the sitemap.'
            : 'The blog is hidden everywhere: /blog and every post page show "not found", and its links leave the navbar, the footer, the homepage and the sitemap. You can still write and publish posts here; they appear once you turn it on.'}
        </p>
        {error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Show the blog on the public site"
        onClick={toggle}
        disabled={pending}
        className={`relative shrink-0 inline-flex h-7 w-12 items-center rounded-full transition-colors ${enabled ? 'bg-[#2563FF]' : 'bg-[#D1D5DB]'}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        {pending && <Loader2 className="absolute -left-6 w-4 h-4 animate-spin text-[#6B7280]" />}
      </button>
    </div>
  )
}
