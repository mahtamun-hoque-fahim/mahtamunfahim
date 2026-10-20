import Link from 'next/link'
import Reveal from '@/components/Reveal'
import { cn } from '@/lib/utils'
import type { PortfolioItem } from '@/lib/db/queries'

/* Portfolio bento grid (/portfolio and the homepage's featured work), same rules
   as the testimonials: wide spans two columns, tall two rows, and every cover has
   one height so a row's covers end on the same line. */
export default function PortfolioGrid({ items, titleAs: Title = 'h2' }: { items: PortfolioItem[]; titleAs?: 'h2' | 'h3' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ fontFamily: 'var(--font-jakarta)' }}>
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
                <img src={p.coverUrl} alt="" loading="lazy" style={{ objectPosition: p.coverFocus }} className="w-full h-full object-cover transition-transform duration-500 ease-ui-out group-hover:scale-[1.03]" />
              </div>
            )}
            <div className="p-8 flex flex-col gap-3 flex-1">
              {p.client && <p className="text-sm text-[#5B6475]">{p.client}</p>}
              <Title className="text-2xl text-[#0B0F19] leading-snug" style={{ fontFamily: 'var(--font-clash)' }}>{p.title}</Title>
              {p.summary && <p className="text-base text-[#374151] leading-relaxed">{p.summary}</p>}
              <span className="mt-auto pt-2 text-sm text-[#2563FF] group-hover:underline">See the project →</span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  )
}
