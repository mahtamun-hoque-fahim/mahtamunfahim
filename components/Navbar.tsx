import NavbarClient from '@/components/NavbarClient'
import { getCachedSiteSettings, getPortfolioItems } from '@/lib/db/queries'

// Server part of the navbar: Portfolio shows while something is published,
// Blog while the blog switch (Admin > Posts) is on.
export default async function Navbar() {
  const [settings, portfolio] = await Promise.all([getCachedSiteSettings(), getPortfolioItems({ publishedOnly: true })])
  return <NavbarClient showPortfolio={portfolio.length > 0} showBlog={settings.blogEnabled} />
}
