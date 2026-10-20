import type { Metadata } from 'next'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import BlurWords from '@/components/BlurWords'
import Reveal from '@/components/Reveal'
import { getPortfolioItems } from '@/lib/db/queries'
import { cn } from '@/lib/utils'

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
          /* Bento grid, same rules as the testimonials: wide spans two columns,
             tall two rows, and every cover has one height so a row's covers end
             on the same line. */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8" style={{ fontFamily: 'var(--font-jakarta)' }}>
            {items.map((p) => (
              <Reveal
                key={p.id}
                className={cn(
                  'rounded-3xl overflow-hidden bg-[#F7F8FA]',
                  p.size === 'wide' && 'md:col-span-2',
                  p.size === 'tall' && 'md:row-span-2'
                )}
              >
                <Link href={`/portfolio/${p.slug}`} className="group flex flex-col h-full">
                  {p.coverUrl && (
                    <div className="overflow-hidden h-48 md:h-56 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.coverUrl} alt="" loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-500 ease-ui-out group-hover:scale-[1.03]" />
                    </div>
                  )}
                  <div className="p-8 flex flex-col gap-3 flex-1">
                    {p.client && <p className="text-sm text-[#5B6475]">{p.client}</p>}
                    <h2 className="text-2xl text-[#0B0F19] leading-snug" style={{ fontFamily: 'var(--font-clash)' }}>{p.title}</h2>
                    {p.summary && <p className="text-base text-[#374151] leading-relaxed">{p.summary}</p>}
                    <span className="mt-auto pt-2 text-sm text-[#2563FF] group-hover:underline">See the project →</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
