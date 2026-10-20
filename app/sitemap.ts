import { MetadataRoute } from 'next'
import { getBlogPosts, getCachedSiteSettings, getPortfolioItems, getTestimonials } from '@/lib/db/queries'

const BASE_URL = 'https://mahtamunhoquefahim.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, portfolio, testimonials] = await Promise.all([
    getCachedSiteSettings(),
    getPortfolioItems({ publishedOnly: true }),
    getTestimonials({ publishedOnly: true }),
  ])
  // the blog only while its switch (Admin > Posts) is on
  const posts = settings.blogEnabled ? ((await getBlogPosts({ publishedOnly: true })) as any[]) : []

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const portfolioRoutes: MetadataRoute.Sitemap = portfolio.map((p) => ({
    url: `${BASE_URL}/portfolio/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/portfolio`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...(testimonials.length > 0 ? [{ url: `${BASE_URL}/testimonials`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 }] : []),
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    ...(settings.blogEnabled ? [{ url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 }] : []),
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    ...portfolioRoutes,
    ...blogRoutes,
  ]
}
