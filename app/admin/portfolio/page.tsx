import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-utils'
import { getPortfolioItems } from '@/lib/db/queries'
import PortfolioManager from './PortfolioManager'

export const metadata = { title: 'Portfolio' }

export default async function AdminPortfolioPage() {
  if (!(await isAuthenticated())) redirect('/admin/login')

  const items = await getPortfolioItems()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B0F19]" style={{ fontFamily: 'var(--font-clash)' }}>
          Portfolio
        </h1>
        <p className="text-sm text-[#6B7280] mt-1" style={{ fontFamily: 'var(--font-jakarta)' }}>
          Work for businesses, shown on /portfolio as a bento grid. Each item opens its own page with the cover photo,
          the details and the images. The Portfolio link in the navbar shows only while something is published.
        </p>
      </div>
      <PortfolioManager initial={items} />
    </div>
  )
}
