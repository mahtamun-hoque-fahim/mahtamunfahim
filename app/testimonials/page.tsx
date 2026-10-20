import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { CSSProperties } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlurWords from '@/components/BlurWords'
import TestimonialGrid from '@/components/TestimonialGrid'
import { getTestimonials } from '@/lib/db/queries'

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'What business owners say after working with Mahtamun Hoque Fahim, and the story behind each project.',
  alternates: { canonical: 'https://mahtamunhoquefahim.vercel.app/testimonials' },
}

export const revalidate = 60

export default async function TestimonialsPage() {
  const items = await getTestimonials({ publishedOnly: true })
  // no invented quotes, ever: with nothing published the page does not exist
  if (items.length === 0) notFound()

  return (
    <>
      <Navbar />
      <main className="pt-32 max-w-6xl mx-auto px-6">
        <div className="pb-16">
          <BlurWords as="h1" text="What clients say." mode="load" className="text-[clamp(2.5rem,6vw,5rem)] font-bold text-[#0B0F19] leading-[1] mb-6" style={{ fontFamily: 'var(--font-clash)' }} />
          <p
            className="blur-load text-[#5B6475] text-lg max-w-xl leading-relaxed"
            style={{ fontFamily: 'var(--font-jakarta)', '--reveal-delay': '220ms' } as CSSProperties}
          >
            Business owners in their own words. Open any of them for the story behind it.
          </p>
        </div>
        <div className="pb-8">
          <TestimonialGrid items={items} />
        </div>
      </main>
      <Footer />
    </>
  )
}
