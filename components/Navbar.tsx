import NavbarClient from '@/components/NavbarClient'
import { getCachedSiteSettings, getPortfolioItems, getTestimonials } from '@/lib/db/queries'

// Server part of the navbar: Portfolio and Testimonials show while something is
// published, Blog while the blog switch (Admin > Posts) is on.
export default async function Navbar() {
  const [settings, portfolio, testimonials] = await Promise.all([
    getCachedSiteSettings(),
    getPortfolioItems({ publishedOnly: true }),
    getTestimonials({ publishedOnly: true }),
  ])
  return (
    <NavbarClient show={{ '/portfolio': portfolio.length > 0, '/testimonials': testimonials.length > 0, '/blog': settings.blogEnabled }} />
  )
}
