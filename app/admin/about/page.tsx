import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-utils'
import { getAboutContent } from '@/lib/db/queries'
import AboutForm from './AboutForm'

export const metadata = { title: 'About page' }

export default async function AdminAboutPage() {
  const authenticated = await isAuthenticated()
  if (!authenticated) redirect('/admin/login')

  const about = await getAboutContent()

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p
          className="text-xs uppercase tracking-widest text-[#5B6475] mb-2"
          style={{ fontFamily: 'var(--font-jetbrains)' }}
        >
          Admin · About
        </p>
        <h1
          className="text-4xl font-bold text-[#0B0F19]"
          style={{ fontFamily: 'var(--font-clash)' }}
        >
          About content<span className="text-[#2563FF]">.</span>
        </h1>
        <p
          className="text-sm text-[#5B6475] mt-2"
          style={{ fontFamily: 'var(--font-jakarta)' }}
        >
          Text and images for the public About page. Cached for an hour on
          the public site; saving here refreshes it immediately.
        </p>
      </div>

      <AboutForm about={about} />
    </div>
  )
}
