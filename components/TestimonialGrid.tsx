'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import Reveal from '@/components/Reveal'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/lib/db/queries'

const host = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '')
const byline = (t: Testimonial) => [t.role, t.business].filter(Boolean).join(', ')

/* Testimonials bento grid (homepage and /testimonials): wide spans two columns,
   tall two rows, every screenshot one height. Each tile opens a popup (a native
   modal <dialog>: Esc and the close button close it, so does a click outside). */
export default function TestimonialGrid({ items }: { items: Testimonial[] }) {
  const [open, setOpen] = useState<Testimonial | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal()
  }, [open])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ fontFamily: 'var(--font-jakarta)' }}>
        {items.map((t) => (
          <Reveal
            key={t.id}
            className={cn('group relative rounded-3xl overflow-hidden bg-[#F7F8FA]', t.size === 'wide' && 'md:col-span-2', t.size === 'tall' && 'md:row-span-2')}
          >
            <figure className="flex flex-col h-full">
              {t.thumbnailUrl && (
                <div className="overflow-hidden h-48 md:h-56 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.thumbnailUrl} alt={t.business ? `The ${t.business} website` : ''} loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-500 ease-ui-out group-hover:scale-[1.03]" />
                </div>
              )}
              <div className="p-8 flex flex-col gap-6 flex-1">
                <blockquote className="text-lg leading-relaxed text-[#0B0F19]">“{t.quote}”</blockquote>
                <figcaption className="text-sm text-[#5B6475] mt-auto">
                  <span className="font-semibold text-[#0B0F19]">{t.name}</span>
                  {byline(t) && <>, {byline(t)}</>}
                  <span aria-hidden="true" className="block mt-1 text-[#2563FF] group-hover:underline">Read the story →</span>
                </figcaption>
              </div>
            </figure>
            {/* the whole tile is the button; figure and blockquote cannot sit inside a <button> */}
            <button type="button" onClick={() => setOpen(t)} aria-haspopup="dialog" className="absolute inset-0 rounded-3xl">
              <span className="sr-only">Read {t.name}&apos;s story</span>
            </button>
          </Reveal>
        ))}
      </div>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        aria-label={open ? `What ${open.name} says` : undefined}
        className="m-auto w-[min(42rem,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] rounded-3xl p-0 bg-white backdrop:bg-[#0B0F19]/60"
        style={{ fontFamily: 'var(--font-jakarta)' }}
      >
        {open && (
          <div className="relative">
            <button type="button" aria-label="Close" onClick={() => dialog.current?.close()}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 text-[#5B6475] hover:text-[#0B0F19] transition-colors">
              <X className="w-5 h-5" />
            </button>
            {open.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={open.thumbnailUrl} alt={open.business ? `The ${open.business} website` : ''} className="w-full h-64 md:h-80 object-cover object-top" />
            )}
            <div className="p-8 md:p-10">
              <blockquote className="text-2xl leading-snug text-[#0B0F19]" style={{ fontFamily: 'var(--font-clash)' }}>“{open.quote}”</blockquote>
              <p className="mt-4 text-sm text-[#5B6475]">
                <span className="font-semibold text-[#0B0F19]">{open.name}</span>
                {byline(open) && <>, {byline(open)}</>}
              </p>
              {open.details && (
                <div className="mt-8 space-y-4 text-base leading-relaxed text-[#374151]">
                  {open.details.split(/\n\s*\n/).filter((p) => p.trim()).map((p, i) => <p key={i}>{p.trim()}</p>)}
                </div>
              )}
              {open.websiteUrl && (
                <a href={open.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-8 text-[#2563FF] hover:underline">
                  Visit {host(open.websiteUrl)} ↗
                </a>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
