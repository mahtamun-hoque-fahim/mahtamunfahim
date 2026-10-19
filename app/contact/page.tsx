

import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import BlurWords from '@/components/BlurWords'
import type { CSSProperties } from 'react'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Mahtamun Hoque Fahim for design and development projects.',
  alternates: {
    canonical: 'https://mahtamunhoquefahim.vercel.app/contact',
  },
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 min-h-screen">
        <div className="max-w-6xl mx-auto px-6">

          {/* Header */}
          <div className="pb-16 border-b border-[#E5E7EB] mb-16">
            <h1 className="text-[clamp(2.5rem,7vw,6rem)] font-bold text-[#0B0F19] leading-[0.95] mb-6" style={{ fontFamily: 'var(--font-clash)' }}>
              <BlurWords text="Let's build" mode="load" className="block" />
              <BlurWords text="something." mode="load" delay={140} className="block text-[#2563FF]" />
            </h1>
            <p
              className="blur-load text-[#5B6475] text-lg max-w-xl leading-relaxed"
              style={{ fontFamily: 'var(--font-jakarta)', fontWeight: 300, '--reveal-delay': '220ms' } as CSSProperties}
            >
              I&apos;m open to freelance projects, collaborations, and full-time opportunities.
              Tell me what you&apos;re working on.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pb-24">

            {/* Left — info */}
            <div>
              <div className="space-y-8 mb-12">
                {[
                  {
                    label: 'Email',
                    value: 'mahtamunhoquefahim@pm.me',
                    href: 'mailto:mahtamunhoquefahim@pm.me',
                  },
                  {
                    label: 'LinkedIn',
                    value: 'mahtamun-hoque-fahim',
                    href: 'https://linkedin.com/in/mahtamun-hoque-fahim',
                  },
                  {
                    label: 'Github',
                    value: 'mahtamun-hoque-fahim',
                    href: 'https://github.com/mahtamun-hoque-fahim',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <p
                      className="text-[#5B6475] text-xs tracking-widest uppercase"
                      style={{ fontFamily: 'var(--font-jetbrains)' }}
                    >
                      {item.label}
                    </p>
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="text-[#0B0F19] text-sm hover:text-[#2563FF] transition-colors"
                      style={{ fontFamily: 'var(--font-jakarta)' }}
                    >
                      {item.value} ↗
                    </a>
                  </div>
                ))}
              </div>

              <div className="border border-[#E5E7EB] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[#2563FF] animate-pulse" />
                  <span
                    className="text-[#2563FF] text-xs tracking-widest uppercase"
                    style={{ fontFamily: 'var(--font-jetbrains)' }}
                  >
                    Currently available
                  </span>
                </div>
                <p
                  className="text-[#5B6475] text-sm leading-relaxed"
                  style={{ fontFamily: 'var(--font-jakarta)' }}
                >
                  Open to freelance design & development projects, long-term collaborations,
                  and interesting full-time roles.<br/>Response time: usually within 24h.
                </p>
              </div>
            </div>

            {/* Right — form */}
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
