

export const revalidate = 60

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import type { CSSProperties } from 'react'
import { getBlogPosts, type BlogPost } from '@/lib/db/queries'
import BlurWords from '@/components/BlurWords'
import MarqueeStrip from '@/components/MarqueeStrip'
import HeroPortrait from '@/components/HeroPortrait'
import Reveal from '@/components/Reveal'
import FocusCards from '@/components/FocusCards'
import SnapScroll from '@/components/SnapScroll'
import RoadGlow from '@/components/RoadGlow'
import { getTestimonials, getCachedSiteSettings, getPortfolioItems } from '@/lib/db/queries'
import PortfolioGrid from '@/components/PortfolioGrid'
import TestimonialGrid from '@/components/TestimonialGrid'
import { cn } from '@/lib/utils'

// Homepage copy follows a discovered funnel: 1. find the problem, 2. acknowledge
// it, 3. proof (work, how I work), 4. solution (services, process, offers),
// then objections (FAQ) and the audit. Same building blocks as the RETHEME.md
// order on branch `fixed-funnel`, rearranged.
// Hardcoded until phase 5 moves it into the dashboard.

// "Who I help" strip (sits under the hero because the portrait stands on it)
const businessTypes = [
  'E-commerce shops', 'F-commerce sellers', 'Clinics', 'Restaurants',
  'Service businesses', 'Local shops', 'Founders', 'Startups',
]

// Each title finishes the pinned heading "You can't expect sales if…".
const problems = [
  { title: 'your website looks old', text: 'Visitors judge your business in seconds. An outdated design makes a good business look careless.' },
  { title: 'it loads slowly', text: 'People leave a slow page before they see what you offer, especially on a phone.' },
  { title: 'Google can\'t find it', text: 'If you do not show up when people search, the customers go to whoever does.' },
  { title: 'visitors don\'t know what to do next', text: 'People land, look around and leave, because nothing tells them what to do next.' },
  { title: 'it can be hacked', text: 'An unpatched site can be taken over, and your customers notice before you do.' },
]

const beforeAfter = {
  before: ['Looks dated on a phone', 'Slow to open', 'No clear next step', 'Hard for you to update'],
  after: ['Clean and trustworthy on every screen', 'Opens fast', 'One clear way to contact you', 'Yours to edit, with help when you need it'],
}

const steps = [
  { title: 'Free audit', text: 'A 30-minute look at your website or idea. You get the problems that cost you customers, in plain words.' },
  { title: 'A clear plan and a fixed price', text: 'What will be built, how long it takes and what it costs, in writing, before any work starts.' },
  { title: 'Build', text: 'You see progress along the way and give feedback while changes are still easy.' },
  { title: 'Launch and support', text: 'Your site goes live, you learn how to use it, and I stay around when you need help.' },
]

// Guided map road (viewBox 100 wide, 100 tall per step): it passes through
// each step's pin at the centre (50, 50 + 100i) and swings out to alternate
// sides in between, so it winds instead of running straight.
const roadPath = steps.reduce(
  (d, _, i) =>
    i === steps.length - 1
      ? `${d} L50 ${steps.length * 100}`
      : `${d} C${i % 2 ? 80 : 20} ${i * 100 + 80} ${i % 2 ? 80 : 20} ${i * 100 + 120} 50 ${i * 100 + 150}`,
  'M50 0 L50 50'
)

const trustPoints = [
  { title: 'You own everything', text: 'The domain, the code and every account are in your name, not mine.' },
  { title: 'Clear pricing up front', text: 'A fixed price before work starts. No surprise invoices.' },
  { title: 'You deal with me directly', text: 'No account managers or middlemen. Questions get answered by me.' },
  { title: 'Support after launch', text: 'A website is not finished on launch day. I stay available for fixes and changes.' },
]

const offers = [
  { title: 'One-time project', text: 'A new website or a full redesign, built to bring you enquiries.', fit: 'For a business that needs a site that works.' },
  { title: 'Website care plan', text: 'Updates, security, backups and small changes, handled for you every month.', fit: 'For owners who would rather run their business.' },
  { title: 'Design only', text: 'A brand identity or a website design your own developer can build.', fit: 'For teams that already have a developer.' },
]

// The three offer cards: blue, black, white (in that order). White text on
// #2563FF is about 4.9:1; on the black card body text is #A3ACBD, as in the
// dark bands. Each button contrasts with its own card.
const offerThemes = [
  { card: 'bg-[#2563FF] border-[#2563FF]', title: 'text-white', text: 'text-white', button: 'bg-white text-[#2563FF] hover:bg-[#EFF4FF]' },
  { card: 'bg-[#0B0F19] border-[#0B0F19]', title: 'text-white', text: 'text-[#A3ACBD]', button: 'bg-[#2563FF] text-white hover:bg-[#1D4ED8]' },
  { card: 'bg-white border-[#E5E7EB]', title: 'text-[#0B0F19]', text: 'text-[#374151]', button: 'bg-[#0B0F19] text-white hover:bg-[#1F2937]' },
]

const faqs = [
  { q: 'How much does a website cost?', a: 'It depends on what your site needs to do. After the free audit you get a fixed price in writing before any work starts, so there are no surprises.' },
  { q: 'How long does it take?', a: 'It depends on the size of the project. You get a timeline together with the plan, before you agree to anything.' },
  { q: 'I already have a website. Do I need a new one?', a: 'Not always. The audit starts from your current site, and sometimes it needs a fix, not a rebuild. I will tell you which.' },
  { q: 'Who updates the site after launch?', a: 'You can, if you want to: the site can be set up so you edit text and images yourself. Or I keep it up to date for you on a care plan.' },
  { q: 'What about hosting?', a: 'I set up reliable hosting in your name and explain what it costs before you pay anything.' },
  { q: 'Who owns the website?', a: 'You do. The domain, the code and every account belong to you.' },
]

const eyebrowClass = 'text-[#2563FF] text-base font-semibold mb-4'
const ctaPrimary =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap px-7 py-3 bg-[#2563FF] text-white text-sm font-semibold rounded-full hover:bg-[#1D4ED8] transition-[background-color,transform] duration-200 active:scale-[0.97]'

export default async function HomePage() {
  const [allPosts, testimonials, siteSettings, featuredWork] = await Promise.all([
    getBlogPosts({ publishedOnly: true, limit: 3 }),
    getTestimonials({ publishedOnly: true }),
    getCachedSiteSettings(),
    getPortfolioItems({ featuredOnly: true }),
  ])

  const recentPosts = allPosts as Pick<BlogPost, 'id' | 'title' | 'slug' | 'excerpt' | 'tags' | 'readingTime' | 'createdAt'>[]
  return (
    <>
      <Navbar />
      <SnapScroll />
      <main>
        {/* ── HERO ── */}
        <section className="min-h-screen flex flex-col px-6 pt-32 relative overflow-hidden snap-start">
          {/* The container fills the hero's height and centres the text in it;
              it also anchors the portrait, whose bottom sits on the strip below. */}
          <div className="max-w-6xl mx-auto w-full pb-16 flex-1 relative flex flex-col justify-center">
            <HeroPortrait />

            <div>
              {/* Main heading */}
              <h1
                className="text-[clamp(2.75rem,5.5vw,5rem)] font-bold leading-[0.95] tracking-tight mb-8 max-w-[11ch] sm:max-w-[13ch] text-[#0B0F19] blur-load"
                style={{ fontFamily: 'var(--font-clash)' }}
              >
                Getting Visitors,<br /> But not <em className="text-[#2563FF]">sales</em>?
              </h1>

              {/* Sub + CTAs */}
              <div className="max-w-md blur-load" style={{ '--reveal-delay': '340ms' } as CSSProperties}>
                <p
                  className="text-[#374151] text-lg leading-relaxed mb-8"
                  style={{ fontFamily: 'var(--font-jakarta)' }}
                >
                  I help small businesses and founders find what stops their website from bringing customers, and then fix it.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
                  <Link href="/contact" className={ctaPrimary}>Get a free website audit</Link>
                </div>
                <p className="text-[#6B7280] text-sm" style={{ fontFamily: 'var(--font-jakarta)' }}>
                  30 minutes. No obligation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Who I help ── (the portrait stands on this strip's top border) */}
        <MarqueeStrip items={businessTypes} speed={siteSettings.marqueeSpeed} />

        {/* ── 1. FIND THE PROBLEM: the visitor recognises their own website ── */}
        {/* Heading pinned on the left (sticky, from md up) while the problems
            scroll past on the right, each revealing as it enters the view.
            Sticky needs no overflow on any ancestor (see DESIGN_GUIDE). */}
        <section className="max-w-6xl mx-auto px-6 pt-28 pb-16 grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-10 md:gap-16">
          {/* Pinned block is one screen tall with the title centred on the
              middle of the screen, the same line the cards snap to. */}
          <div className="md:sticky md:top-0 md:self-start md:h-screen md:flex md:flex-col md:justify-center">
            <BlurWords as="h2" text="You can't expect sales if…" className="text-3xl sm:text-4xl md:text-5xl text-[#0B0F19] leading-tight" style={{ fontFamily: 'var(--font-clash)' }} />
          </div>
          {/* One card in focus at a time: the one crossing the middle of the
              screen; the gaps keep the next card out of that band, and half a
              screen of padding means the title is already pinned whenever a
              card is centred, so the two always sit on the same level. */}
          <FocusCards className="flex flex-col gap-[18vh] md:py-[50vh]">
            {problems.map((p) => (
              <div key={p.title} className="snap-center rounded-2xl border border-[#E5E7EB] p-8 md:p-10">
                <h3 className="text-2xl md:text-3xl text-[#0B0F19] mb-3" style={{ fontFamily: 'var(--font-clash)' }}>{p.title}</h3>
                <p className="text-[#374151] leading-relaxed" style={{ fontFamily: 'var(--font-jakarta)' }}>{p.text}</p>
              </div>
            ))}
          </FocusCards>
        </section>

        {/* ── 2. ACKNOWLEDGE: it is common, it is not your fault, and it costs you ── */}
        {/* Dark band 1 of 2: the turning point from "that is me" to "I need to fix this".
            A full-screen panel that slides up like a sheet as it enters the view (.slide-up). */}
        <Reveal as="section" data-nav-dark blurSelf={false} className="slide-up bg-[#0B0F19] mt-12 snap-start min-h-screen flex items-center rounded-t-[2.5rem]">
          <div className="w-full max-w-6xl mx-auto px-6 pt-24 pb-10">
          <BlurWords as="h2" text="Looks nice, but does it bring customers?" className="text-3xl sm:text-4xl md:text-5xl text-white mb-6 max-w-3xl mx-auto text-center leading-tight" style={{ fontFamily: 'var(--font-clash)' }} />
          <Reveal as="p" delay={120} className="text-[#A3ACBD] text-lg leading-relaxed max-w-2xl mx-auto text-center mb-10" style={{ fontFamily: 'var(--font-jakarta)' }}>
            You are busy running your business, not your website. That is normal. But every week the site stays like this, people who were ready to buy find someone else.
          </Reveal>
          {/* Before / after: two tall cards. Out of view the After card lies on
              top of the Before card; in view they spread apart, then each After
              line pops a tick, one after another (.ba-cards, globals.css). */}
          <Reveal blurSelf={false} className="ba-cards max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8" style={{ fontFamily: 'var(--font-jakarta)' }}>
            <div className="ba-before rounded-3xl border border-[#1F2937] bg-[#111827] text-[#A3ACBD] p-8 md:p-12 md:min-h-[20rem]">
              <p className={cn(eyebrowClass, 'text-[#9CA3AF] mb-8')} style={{ fontFamily: 'var(--font-jetbrains)' }}>Before</p>
              <ul className="space-y-5 text-lg">
                {beforeAfter.before.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="ba-after rounded-3xl bg-[#2563FF] text-white p-8 md:p-12 md:min-h-[20rem] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
              <p className={cn(eyebrowClass, 'text-white mb-8')} style={{ fontFamily: 'var(--font-jetbrains)' }}>After</p>
              <ul className="space-y-5 text-lg">
                {beforeAfter.after.map((item, i) => (
                  <li key={item} className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="ba-tick shrink-0 w-7 h-7 rounded-full bg-[#16A34A] text-white flex items-center justify-center"
                      style={{ '--i': i } as CSSProperties}
                    >
                      <Check className="w-4 h-4" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          </div>
        </Reveal>


        {/* ── 3. PROOF: what clients say, then how I work ── */}
        {/* Featured work: portfolio items marked featured in Admin > Portfolio, same
            bento grid as /portfolio. Hidden while none is featured and published. */}
        {featuredWork.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-16 snap-start scroll-mt-24">
            <div className="flex items-end justify-between gap-6 mb-12">
              <BlurWords as="h2" text="Work for businesses like yours." className="text-3xl sm:text-4xl md:text-5xl text-[#0B0F19]" style={{ fontFamily: 'var(--font-clash)' }} />
              <Link href="/portfolio" className="shrink-0 text-sm text-[#5B6475] hover:text-[#2563FF] transition-colors" style={{ fontFamily: 'var(--font-jakarta)' }}>
                All work →
              </Link>
            </div>
            <PortfolioGrid items={featuredWork} titleAs="h3" />
          </section>
        )}

        {/* What clients say: a bento grid of testimonials from Admin > Testimonials.
            Each tile opens a popup with the details (components/TestimonialGrid.tsx).
            Hidden while none is published. */}
        {testimonials.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-16 snap-start scroll-mt-24">
            <div className="flex items-end justify-between gap-6 mb-12">
              <BlurWords as="h2" text="What clients say." className="text-3xl sm:text-4xl md:text-5xl text-[#0B0F19]" style={{ fontFamily: 'var(--font-clash)' }} />
              <Link href="/testimonials" className="shrink-0 text-sm text-[#5B6475] hover:text-[#2563FF] transition-colors" style={{ fontFamily: 'var(--font-jakarta)' }}>
                All testimonials →
              </Link>
            </div>
            <TestimonialGrid items={testimonials} />
          </section>
        )}

        {/* How I work: trust points + About teaser (Admin > About, homepage teaser fields) ── */}
        {/* Same pattern as "Which of these sounds like your website?", mirrored:
            the trust cards scroll and focus on the left, the text is pinned in
            the middle of the screen on the right (from md up). Dark band 3. */}
        <section data-nav-dark className="bg-[#0B0F19]">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-[7fr_5fr] gap-10 md:gap-16">
          <div className="md:order-2 md:sticky md:top-0 md:self-start md:h-screen md:flex md:flex-col md:justify-center">
            <BlurWords as="h2" text="Get a free audit." className="text-3xl sm:text-4xl md:text-5xl text-white mb-6 leading-tight" style={{ fontFamily: 'var(--font-clash)' }} />
            <Reveal as="p" delay={120} className="text-[#A3ACBD] text-base leading-relaxed mb-6" style={{ fontFamily: 'var(--font-jakarta)' }}>
              In 30 minutes I look at your website the way your customers do, and tell you what is costing you enquiries and what to fix first.
            </Reveal>
            <Reveal as="p" delay={210} className="text-[#A3ACBD] text-base leading-relaxed mb-10" style={{ fontFamily: 'var(--font-jakarta)' }}>
              It is free, there is nothing to prepare, and you keep the advice whether you work with me or not.
            </Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
              <Link href="/contact" className={ctaPrimary}>
                Request a free audit <span aria-hidden="true">→</span>
              </Link>
              <span className="text-[#A3ACBD] text-sm">30 minutes. No obligation.</span>
            </div>
          </div>
          <FocusCards className="md:order-1 flex flex-col gap-[18vh] md:py-[50vh]">
            {trustPoints.map((t) => (
              <div key={t.title} className="snap-center rounded-2xl bg-[#111827] p-8 md:p-10" style={{ fontFamily: 'var(--font-jakarta)' }}>
                <h3 className="text-2xl md:text-3xl text-white mb-3" style={{ fontFamily: 'var(--font-clash)' }}>{t.title}</h3>
                <p className="text-[#A3ACBD] leading-relaxed">{t.text}</p>
              </div>
            ))}
          </FocusCards>
        </div>
        </section>

        {/* ── 4. SOLUTION: how it works and the ways to start ── */}
        {/* How it works */}
        {/* A guided map: a dashed path down the middle (on the left on phones),
            one sticky note per step, pinned to the path by its number and
            alternating sides. Each note is a snap stop and blurs in on scroll.
            The heading is its own stop, so the tall section never counts as
            one (SnapScroll would then let the wheel scroll it freely). */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="snap-start scroll-mt-24 text-center">
            <BlurWords as="h2" text="Four steps to launch." className="text-3xl sm:text-4xl md:text-5xl text-[#0B0F19] max-w-3xl mx-auto leading-tight" style={{ fontFamily: 'var(--font-clash)' }} />
          </div>
          <ol className="relative mt-16" style={{ fontFamily: 'var(--font-jakarta)' }}>
            {/* the path: a straight dashed line on phones, a winding road from md up */}
            <span aria-hidden="true" className="md:hidden absolute top-0 bottom-0 left-5 border-l-2 border-dashed border-[#D1D5DB]" />
            <RoadGlow d={roadPath} height={steps.length * 100} />
            {steps.map((s, i) => (
              <li key={s.title} className="relative flex items-center min-h-[70vh] py-10 pl-16 md:pl-0">
                {/* the pin on the path */}
                <span className="absolute left-5 md:left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-[#2563FF] text-white text-sm flex items-center justify-center ring-8 ring-white">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Reveal
                  className={cn(
                    'snap-center relative w-full md:w-[calc(50%-4rem)] bg-[#EFF4FF] rounded-sm p-8 md:p-10 shadow-[0_12px_30px_-12px_rgba(11,15,25,0.25)] transition-[transform] duration-300 ease-ui-out hover:rotate-0',
                    i % 2 ? 'md:ml-auto rotate-[1.5deg]' : 'rotate-[-1.5deg]'
                  )}
                >
                  {/* tape */}
                  <span aria-hidden="true" className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#2563FF]/15 rotate-[-2deg]" />
                  <h3 className="text-2xl sm:text-3xl md:text-[1.75rem] lg:text-4xl text-[#0B0F19] mb-4 leading-tight" style={{ fontFamily: 'var(--font-clash)' }}>{s.title}</h3>
                  <p className="text-[#374151] text-base leading-relaxed">{s.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* Ways to work together: no prices until Fahim sets them */}
        <section className="max-w-6xl mx-auto px-6 py-16 snap-start scroll-mt-24">
          <BlurWords as="h2" text="Pick what fits where your business is today." className="text-3xl sm:text-4xl md:text-5xl text-[#0B0F19] mb-14 max-w-3xl leading-tight" style={{ fontFamily: 'var(--font-clash)' }} />
          {/* .offer-stack: piled up out of view, dealt into the row once scrolled to */}
          <Reveal blurSelf={false} className="grid grid-cols-1 md:grid-cols-3 gap-6 offer-stack" style={{ fontFamily: 'var(--font-jakarta)' }}>
            {offers.map((o, i) => {
              const t = offerThemes[i % offerThemes.length]
              return (
                <div key={o.title} className={cn('rounded-2xl border p-8 flex flex-col', t.card)}>
                  <h3 className={cn('text-2xl mb-3', t.title)} style={{ fontFamily: 'var(--font-clash)' }}>{o.title}</h3>
                  <p className={cn('text-base leading-relaxed mb-6', t.text)}>{o.text}</p>
                  <p className={cn('text-sm mt-auto mb-6', t.title)}>{o.fit}</p>
                  <Link href="/contact" className={cn('inline-flex self-start items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-[background-color,color,transform] duration-200 active:scale-[0.97]', t.button)}>
                    Start with a free audit <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </Reveal>
        </section>

        {/* ── 5. OBJECTIONS (FAQ) ── native <details>, no JS */}
        <section className="max-w-3xl mx-auto px-6 py-16 snap-start scroll-mt-24">
          <BlurWords as="h2" text="Before you ask." className="text-3xl sm:text-4xl md:text-5xl text-[#0B0F19] mb-10 leading-tight" style={{ fontFamily: 'var(--font-clash)' }} />
          <Reveal className="divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]" style={{ fontFamily: 'var(--font-jakarta)' }}>
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[#0B0F19] text-base font-medium">
                  {f.q}
                  <span aria-hidden="true" className="text-[#2563FF] text-xl transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="text-[#374151] text-base leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </Reveal>
        </section>

        {/* ── Blog teaser (for search visitors), hidden while the blog switch is off ── */}
        {siteSettings.blogEnabled && (
        <section className="max-w-6xl mx-auto px-6 py-16 snap-start scroll-mt-24">
          <div className="flex items-center justify-between mb-12">
            <BlurWords as="h2" text="From the blog." className="text-3xl sm:text-4xl md:text-5xl text-[#0B0F19]" style={{ fontFamily: 'var(--font-clash)' }} />
            <Link
              href="/blog"
              className="text-[#5B6475] text-sm hover:text-[#2563FF] transition-colors"
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              All posts →
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div className="border border-[#E5E7EB] rounded-xl p-16 text-center">
              <p
                className="text-[#5B6475] text-sm"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                Writing about design, engineering & security on the web - start reading.
              </p>
              <Link
                href="/blog"
                className="inline-block mt-4 text-[#2563FF] text-sm hover:underline"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                Visit the blog →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#E5E7EB]">
              {recentPosts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="bg-[#FFFFFF] p-8 flex flex-col group hover:bg-[#F7F8FA] transition-colors duration-300 min-h-[260px]"
                >
                  <Reveal className="flex flex-1 flex-col justify-between" delay={(i % 3) * 180}>
                  <div>
                    {post.tags?.length > 0 && (
                      <span
                        className="text-[#2563FF] text-sm font-medium mb-3 block"
                        style={{ fontFamily: 'var(--font-jetbrains)' }}
                      >
                        {post.tags[0]}
                      </span>
                    )}
                    <h3
                      className="text-lg font-semibold text-[#0B0F19] mb-3 leading-snug group-hover:text-[#2563FF] transition-colors duration-300"
                      style={{ fontFamily: 'var(--font-clash)' }}
                    >
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p
                        className="text-[#374151] text-base leading-relaxed line-clamp-3"
                        style={{ fontFamily: 'var(--font-jakarta)' }}
                      >
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#E5E7EB]">
                    <span
                      className="text-[#6B7280] text-sm"
                      style={{ fontFamily: 'var(--font-jakarta)' }}
                    >
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span
                      className="text-[#6B7280] text-sm"
                      style={{ fontFamily: 'var(--font-jetbrains)' }}
                    >
                      {post.readingTime} min
                    </span>
                  </div>
                  </Reveal>
                </Link>
              ))}
              {/* Fill remaining slots to keep grid full when < 3 posts */}
              {recentPosts.length < 3 && Array.from({ length: 3 - recentPosts.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="bg-[#FFFFFF] p-8 min-h-[260px] flex items-center justify-center"
                >
                  <span
                    className="text-[#9CA3AF] text-sm"
                    style={{ fontFamily: 'var(--font-jetbrains)' }}
                  >
                    more coming
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
        )}

        {/* ── 6. THE NEXT STEP: the audit ── */}
        {/* Dark band 2 of 2: the conversion point, the last strong stop before the footer */}
        <section data-snap-end data-nav-dark className="bg-[#0B0F19] mt-12 snap-start">
          <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
            <BlurWords as="h2" text="Find out what your website is costing you." className="text-3xl sm:text-4xl md:text-6xl text-white mb-6 leading-tight max-w-3xl" style={{ fontFamily: 'var(--font-clash)' }} />
            <Reveal as="p" delay={120} className="text-[#A3ACBD] text-lg max-w-2xl mb-10" style={{ fontFamily: 'var(--font-jakarta)' }}>
              Book a free 30-minute website audit. You get the biggest problems holding your site back and what to fix first, whether you hire me or not.
            </Reveal>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
              <Link href="/contact" className={ctaPrimary}>
                Get a free website audit <span aria-hidden="true">→</span>
              </Link>
              <span className="text-[#A3ACBD] text-sm">30 minutes. No obligation.</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
