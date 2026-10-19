import { and, asc, desc, eq, isNotNull, sql } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { db } from './index'
import {
  blogPosts,
  contactMessages,
  footerLinks,
  testimonials,
  type Testimonial,
  type NewTestimonial,
  siteSettings,
  aboutContent,
  type AboutContent,
  type NewAboutContent,
  type BlogPost,
  type NewBlogPost,
  type NewContactMessage,
  type FooterLink,
  type NewFooterLink,
  type SiteSettings,
  type NewSiteSettings,
} from './schema'

// ──────────────────────────────────────────────────────────
// Blog posts
// ──────────────────────────────────────────────────────────

export async function getBlogPosts(opts?: {
  publishedOnly?: boolean
  limit?: number
  offset?: number
}): Promise<BlogPost[]> {
  const { publishedOnly, limit, offset } = opts ?? {}

  let q = db.select().from(blogPosts).$dynamic()
  if (publishedOnly) q = q.where(eq(blogPosts.published, true))
  q = q.orderBy(desc(blogPosts.createdAt))
  if (typeof limit === 'number') q = q.limit(limit)
  if (typeof offset === 'number') q = q.offset(offset)

  try {
    return await q
  } catch (error) {
    console.error('getBlogPosts error:', error)
    return []
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const rows = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1)
    return rows[0] ?? null
  } catch (error) {
    console.error('getBlogPostBySlug error:', error)
    return null
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1)
    return rows[0] ?? null
  } catch (error) {
    console.error('getBlogPostById error:', error)
    return null
  }
}

export async function createBlogPost(input: NewBlogPost): Promise<BlogPost | null> {
  const rows = await db.insert(blogPosts).values(input).returning()
  return rows[0] ?? null
}

export async function updateBlogPost(
  id: string,
  updates: Partial<NewBlogPost>
): Promise<BlogPost | null> {
  const rows = await db
    .update(blogPosts)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(blogPosts.id, id))
    .returning()
  return rows[0] ?? null
}

export async function deleteBlogPost(id: string): Promise<void> {
  await db.delete(blogPosts).where(eq(blogPosts.id, id))
}

// ──────────────────────────────────────────────────────────
// Contact messages
// ──────────────────────────────────────────────────────────

export async function getContactMessages(opts?: {
  unreadOnly?: boolean
  limit?: number
}) {
  const { unreadOnly, limit } = opts ?? {}

  let q = db.select().from(contactMessages).$dynamic()
  if (unreadOnly) q = q.where(eq(contactMessages.read, false))
  q = q.orderBy(desc(contactMessages.createdAt))
  if (typeof limit === 'number') q = q.limit(limit)

  try {
    return await q
  } catch (error) {
    console.error('getContactMessages error:', error)
    return []
  }
}

export async function createContactMessage(input: NewContactMessage) {
  const rows = await db.insert(contactMessages).values(input).returning()
  return rows[0] ?? null
}

export async function markMessageRead(id: string) {
  const rows = await db
    .update(contactMessages)
    .set({ read: true })
    .where(eq(contactMessages.id, id))
    .returning()
  return rows[0] ?? null
}

export async function deleteContactMessage(id: string) {
  await db.delete(contactMessages).where(eq(contactMessages.id, id))
}

// ──────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────
// Footer links (nav + social links shown in the site footer)
// ──────────────────────────────────────────────────────────

export async function getFooterLinks(): Promise<FooterLink[]> {
  try {
    return await db.select().from(footerLinks).orderBy(asc(footerLinks.sortOrder))
  } catch (error) {
    console.error('getFooterLinks error:', error)
    return []
  }
}

export async function createFooterLink(data: NewFooterLink): Promise<FooterLink | null> {
  try {
    const rows = await db.insert(footerLinks).values(data).returning()
    return rows[0] ?? null
  } catch (error) {
    console.error('createFooterLink error:', error)
    throw error
  }
}

export async function updateFooterLink(id: string, data: Partial<NewFooterLink>): Promise<FooterLink | null> {
  try {
    const rows = await db
      .update(footerLinks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(footerLinks.id, id))
      .returning()
    return rows[0] ?? null
  } catch (error) {
    console.error('updateFooterLink error:', error)
    throw error
  }
}

export async function deleteFooterLink(id: string): Promise<void> {
  try {
    await db.delete(footerLinks).where(eq(footerLinks.id, id))
  } catch (error) {
    console.error('deleteFooterLink error:', error)
    throw error
  }
}

export async function reorderFooterLinks(orders: Array<{ id: string; order: number }>): Promise<void> {
  for (const { id, order } of orders) {
    await db.update(footerLinks).set({ sortOrder: order, updatedAt: new Date() }).where(eq(footerLinks.id, id))
  }
}

// ──────────────────────────────────────────────────────────
// Site settings (single row, id always 1 — dashboard-driven metadata)
// ──────────────────────────────────────────────────────────

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 1,
  title: 'Mahtamun Hoque Fahim — Aspiring AI Engineer',
  description:
    'Aspiring AI engineer from Bangladesh. Building secure web apps, tools, and digital products in the era of agentic AI.',
  jobTitle: 'Aspiring AI Engineer',
  avatarUrl: null,
  keywords: [
    'developer',
    'AI engineer',
    'full-stack developer',
    'Bangladesh',
    'Next.js',
    'TypeScript',
    'mahtamun',
    'mahtamun hoque fahim',
  ],
  ogTitle: 'Mahtamun Hoque Fahim — Aspiring AI Engineer',
  ogDescription:
    'Aspiring AI engineer from Bangladesh. Building secure web apps, tools, and digital products in the era of agentic AI.',
  marqueeSpeed: 60,
  updatedAt: new Date(),
}

/**
 * Reads the single site_settings row (id=1), creating it with defaults on
 * first read if it doesn't exist yet. Uncached — use getCachedSiteSettings()
 * for anything rendered on the public site.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1)
    if (rows[0]) return rows[0]
    const created = await db.insert(siteSettings).values({ id: 1 }).returning()
    return created[0] ?? DEFAULT_SITE_SETTINGS
  } catch (error) {
    console.error('getSiteSettings error:', error)
    return DEFAULT_SITE_SETTINGS
  }
}

/**
 * Cached read for public-facing metadata (root layout). Revalidates every
 * hour, and on-demand via revalidateTag('site-settings') from the admin
 * save action below.
 */
export const getCachedSiteSettings = unstable_cache(
  async () => getSiteSettings(),
  ['site-settings'],
  { revalidate: 3600, tags: ['site-settings'] }
)

export async function updateSiteSettings(
  updates: Partial<NewSiteSettings>
): Promise<SiteSettings> {
  const rows = await db
    .update(siteSettings)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(siteSettings.id, 1))
    .returning()
  if (rows[0]) return rows[0]
  const created = await db
    .insert(siteSettings)
    .values({ id: 1, ...updates })
    .returning()
  return created[0]
}

// ── About page content (single row, id=1) ────────────────

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  id: 1,
  headlineTop: 'Designer who codes.',
  headlineAccent: 'Developer who designs.',
  intro:
    "I'm Mahtamun Hoque Fahim. I grew up in Bangladesh with an internet connection and an obsession with how things look and work. That combination became a career.",
  storyHeading: 'The honest story',
  storyParagraphs: [
    "I didn't study design in a formal school. I learned by obsessively reverse-engineering things I loved: breaking down why a logo felt trustworthy, why a website felt fast, why some interfaces made you feel calm.",
    "I started building websites because I couldn't communicate what I wanted to developers. I started designing seriously because I couldn't stand ugly interfaces. Both accidents became strengths.",
    "Being from Bangladesh sharpened me. I couldn't rely on proximity to opportunity, so I had to be undeniably good. That's still the standard I hold myself to.",
    "I care about work that ships, that works, that people actually use. Beautiful for its own sake doesn't interest me. Beautiful and functional? That's the whole game.",
  ],
  extraHeading: '',
  extraParagraphs: [],
  extraImageUrl: null,
  storyImageUrl: null,
  layout: 'beside',
  tallImageUrl: null,
  ctaHeading: 'Want to work together?',
  ctaText: "I'm selective about what I take on, which means I care about what you're building.",
  ctaPrimaryLabel: 'Get in touch',
  ctaSecondaryLabel: 'See portfolio',
  updatedAt: new Date(0),
}

/**
 * Reads the single about_content row (id=1), creating it with defaults on
 * first read. Falls back to the hardcoded defaults if the table is missing
 * (migration not applied yet) or the DB is unreachable, so /about never breaks.
 */
export async function getAboutContent(): Promise<AboutContent> {
  try {
    const rows = await db.select().from(aboutContent).where(eq(aboutContent.id, 1)).limit(1)
    if (rows[0]) return rows[0]
    const created = await db.insert(aboutContent).values({ id: 1 }).returning()
    return created[0] ?? DEFAULT_ABOUT_CONTENT
  } catch (error) {
    console.error('getAboutContent error:', error)
    return DEFAULT_ABOUT_CONTENT
  }
}

/** Cached read for the public /about page; cleared by revalidateTag('about-content'). */
export const getCachedAboutContent = unstable_cache(
  async () => getAboutContent(),
  ['about-content'],
  { revalidate: 3600, tags: ['about-content'] }
)

export async function updateAboutContent(
  updates: Partial<NewAboutContent>
): Promise<AboutContent> {
  const rows = await db
    .update(aboutContent)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(aboutContent.id, 1))
    .returning()
  if (rows[0]) return rows[0]
  const created = await db
    .insert(aboutContent)
    .values({ id: 1, ...updates })
    .returning()
  return created[0]
}

// Re-export the inferred types for convenience
export type {
  BlogPost,
  ContactMessage,
  NewBlogPost,
  NewContactMessage,
  FooterLink,
  NewFooterLink,
  SiteSettings,
  NewSiteSettings,
  AboutContent,
  NewAboutContent,
  Testimonial,
  NewTestimonial,
} from './schema'

// ──────────────────────────────────────────────────────────
// Testimonials (homepage bento grid, Admin > Testimonials)
// ──────────────────────────────────────────────────────────

export async function getTestimonials({ publishedOnly = false } = {}): Promise<Testimonial[]> {
  try {
    const q = db.select().from(testimonials)
    return await (publishedOnly ? q.where(eq(testimonials.published, true)) : q).orderBy(asc(testimonials.sortOrder))
  } catch (error) {
    console.error('getTestimonials error:', error)
    return []
  }
}

export async function createTestimonial(data: NewTestimonial): Promise<Testimonial | null> {
  try {
    const rows = await db.insert(testimonials).values(data).returning()
    return rows[0] ?? null
  } catch (error) {
    console.error('createTestimonial error:', error)
    return null
  }
}

export async function updateTestimonial(id: string, data: Partial<NewTestimonial>): Promise<Testimonial | null> {
  try {
    const rows = await db
      .update(testimonials)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(testimonials.id, id))
      .returning()
    return rows[0] ?? null
  } catch (error) {
    console.error('updateTestimonial error:', error)
    return null
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  await db.delete(testimonials).where(eq(testimonials.id, id))
}

export async function reorderTestimonials(orders: Array<{ id: string; order: number }>): Promise<void> {
  for (const { id, order } of orders) {
    await db.update(testimonials).set({ sortOrder: order, updatedAt: new Date() }).where(eq(testimonials.id, id))
  }
}
