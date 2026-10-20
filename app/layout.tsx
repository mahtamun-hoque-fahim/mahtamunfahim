

import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter, Hind_Siliguri } from 'next/font/google'
import { getCachedSiteSettings } from '@/lib/db/queries'
import './globals.css'

// Fonts: Plus Jakarta Sans for headlines, Inter for body and labels. The old
// names stay as aliases in globals.css :root (--font-clash = Plus Jakarta
// Sans, --font-jakarta and --font-jetbrains = Inter), so components that
// set them inline did not have to change. See DESIGN_GUIDE.md section 3.
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Bengali: Hind Siliguri, second in every font stack in globals.css, so only
// Bengali characters use it. Not preloaded: the browser fetches it only on
// pages that contain Bengali text (unicode-range).
const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
  display: 'swap',
  preload: false,
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings()
  return {
    metadataBase: new URL('https://mahtamunhoquefahim.vercel.app'),
    title: {
      default: settings.title,
      template: '%s | Mahtamun',
    },
    description: settings.description,
    keywords: settings.keywords,
    authors: [{ name: 'Mahtamun Hoque Fahim' }],
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://mahtamunhoquefahim.vercel.app',
      siteName: 'Mahtamun Hoque Fahim',
      title: settings.ogTitle,
      description: settings.ogDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.ogTitle,
      description: settings.ogDescription,
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getCachedSiteSettings()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${inter.variable} ${hindSiliguri.variable}`}
    >
      {/* suppressHydrationWarning: extensions (e.g. ColorZilla) add attributes to <body> */}
      <body suppressHydrationWarning style={{ fontFamily: 'var(--font-jakarta)' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Mahtamun Hoque Fahim',
              url: 'https://mahtamunhoquefahim.vercel.app',
              jobTitle: settings.jobTitle,
              description: settings.description,
              ...(settings.avatarUrl ? { image: settings.avatarUrl } : {}),
              nationality: 'Bangladeshi',
              sameAs: [
                'https://github.com/mahtamun-hoque-fahim',
                'https://linkedin.com/in/mahtamun-hoque-fahim',
              ],
              knowsAbout: ['Next.js', 'React', 'TypeScript', 'AI Engineering', 'Full-Stack Development', 'Software Engineering', 'UI/UX Design'],
            }),
          }}
        />
        {children}
        </div>
      </body>
    </html>
  )
}
