import type { Metadata } from 'next'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlurWords from '@/components/BlurWords'
import PortfolioGrid from '@/components/PortfolioGrid'
import { getPortfolioItems } from '@/lib/db/queries'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Websites and digital systems built for businesses: what each one needed, what was built, and what changed.',
  alternates: { canonical: 'https://mahtamunhoquefahim.vercel.app/portfolio' },
}

export const revalidate = 60

export default async function PortfolioPage() {
  const items = await getPortfolioItems({ publishedOnly: true })

  return (
    <>
      <Navbar />
      <main className="pt-32 max-w-6xl mx-auto px-6">
        <div className="pb-16">
          <BlurWords as="h1" text="Work that brings businesses customers." mode="load" className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-[#0B0F19] leading-[1] mb-6 max-w-4xl" style={{ fontFamily: 'var(--font-clash)' }} />
          <p
            className="blur-load text-[#5B6475] text-lg max-w-xl leading-relaxed"
            style={{ fontFamily: 'var(--font-jakarta)', '--reveal-delay': '220ms' } as CSSProperties}
          >
            What each business needed, what I built for it, and what changed.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-[#5B6475] pb-24" style={{ fontFamily: 'var(--font-jakarta)' }}>
            New work is on its way. In the meantime,{' '}
            <Link href="/contact" className="text-[#2563FF] hover:underline">get a free website audit</Link>.
          </p>
        ) : (
          <div className="pb-8">
            <PortfolioGrid items={items} />
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
