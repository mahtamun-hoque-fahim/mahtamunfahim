import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getPortfolioItemBySlug } from '@/lib/db/queries'
import { renderMarkdown } from '@/lib/markdown'

export const revalidate = 60

async function getItem(slug: string) {
  const item = await getPortfolioItemBySlug(slug)
  return item?.published ? item : null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const item = await getItem(slug)
  if (!item) return { title: 'Not found' }
  return {
    title: item.title,
    description: item.summary || undefined,
    alternates: { canonical: `https://mahtamunhoquefahim.vercel.app/portfolio/${slug}` },
    openGraph: {
      title: item.title,
      description: item.summary || undefined,
      images: item.coverUrl ? [{ url: item.coverUrl }] : undefined,
    },
    twitter: {
      card: item.coverUrl ? 'summary_large_image' : 'summary',
      title: item.title,
      description: item.summary || undefined,
      images: item.coverUrl ? [item.coverUrl] : undefined,
    },
  }
}

export default async function PortfolioItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const item = await getItem(slug)
  if (!item) notFound()

  return (
    <>
      <Navbar />
      <main className="pt-32" style={{ fontFamily: 'var(--font-jakarta)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/portfolio" className="inline-block text-[#5B6475] text-sm mb-10 hover:text-[#2563FF] transition-colors">
            ← All work
          </Link>
          {item.client && <p className="text-[#5B6475] mb-3">{item.client}</p>}
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B0F19] mb-6 leading-tight" style={{ fontFamily: 'var(--font-clash)' }}>
            {item.title}
          </h1>
          {item.summary && <p className="text-xl text-[#374151] leading-relaxed max-w-3xl">{item.summary}</p>}
          {item.websiteUrl && (
            <a href={item.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-[#2563FF] hover:underline">
              {item.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗
            </a>
          )}
        </div>

        {/* Cover photo, wider than the text column */}
        {item.coverUrl && (
          <div className="max-w-6xl mx-auto px-6 mt-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.coverUrl} alt="" loading="eager" {...(item.showCover
              ? { style: { objectPosition: item.coverFocus }, className: 'w-full aspect-[16/9] object-cover rounded-3xl bg-[#F7F8FA]' }
              : { className: 'w-full h-auto rounded-3xl bg-[#F7F8FA]' })} /* hidden on the card: shown whole here */ />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-6 mt-16">
          {item.body && <article className="prose-dark" dangerouslySetInnerHTML={{ __html: renderMarkdown(item.body) }} />}
        </div>

        {item.images.length > 0 && (
          <div className="max-w-6xl mx-auto px-6 mt-16 space-y-6">
            {item.images.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" loading="lazy" className="w-full rounded-3xl bg-[#F7F8FA]" />
            ))}
          </div>
        )}

        <div className="max-w-4xl mx-auto px-6 mt-24">
          <div className="rounded-3xl bg-[#0B0F19] p-10 md:p-14">
            <h2 className="text-3xl md:text-4xl text-white mb-4" style={{ fontFamily: 'var(--font-clash)' }}>
              Want a website that works like this for you?
            </h2>
            <p className="text-[#A3ACBD] mb-8 max-w-xl">Start with a free 30-minute website audit. You get the problems that cost you customers, in plain words.</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#2563FF] text-white text-sm font-semibold rounded-full hover:bg-[#1D4ED8] transition-[background-color,transform] duration-200 active:scale-[0.97]"
            >
              Get a free audit <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
