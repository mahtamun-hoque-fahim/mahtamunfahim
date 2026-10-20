import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

// ──────────────────────────────────────────────────────────
// Better Auth tables (standard schema, singular table names)
// ──────────────────────────────────────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ──────────────────────────────────────────────────────────
// Application tables (mirror existing production schema)
// ──────────────────────────────────────────────────────────

export const blogPosts = pgTable(
  'blog_posts',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    excerpt: text('excerpt').notNull().default(''),
    content: text('content').notNull().default(''),
    coverImage: text('cover_image'),
    published: boolean('published').notNull().default(false),
    tags: text('tags').array().notNull().default(sql`'{}'::text[]`),
    readingTime: integer('reading_time').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: index('blog_posts_slug_idx').on(t.slug),
    publishedIdx: index('blog_posts_published_idx').on(t.published, t.createdAt),
  })
)

export const contactMessages = pgTable(
  'contact_messages',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject').notNull().default(''),
    message: text('message').notNull(),
    country: text('country'),
    read: boolean('read').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    readIdx: index('contact_messages_read_idx').on(t.read, t.createdAt),
  })
)

// ──────────────────────────────────────────────────────────
// Footer links
// ──────────────────────────────────────────────────────────

export const footerLinks = pgTable(
  'footer_links',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    label: text('label').notNull(),
    url: text('url').notNull(),
    groupLabel: text('group_label').notNull().default('Nav'),
    external: boolean('external').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sortIdx: index('footer_links_sort_idx').on(t.sortOrder),
  })
)

// Client testimonials (homepage bento grid). Hidden on the site while none
// is published, so nothing placeholder ever shows.
export const testimonials = pgTable(
  'testimonials',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    name: text('name').notNull(),
    role: text('role').notNull().default(''),
    business: text('business').notNull().default(''),
    quote: text('quote').notNull(),
    websiteUrl: text('website_url'),
    // Screenshot of the client's website, shown edge to edge in the tile
    thumbnailUrl: text('thumbnail_url'),
    size: text('size').notNull().default('normal'), // 'normal' | 'wide' | 'tall'
    published: boolean('published').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sortIdx: index('testimonials_sort_idx').on(t.sortOrder),
  })
)

// Portfolio (business case studies): a bento grid on /portfolio, one page per
// item at /portfolio/[slug]. Hidden from the public site while unpublished.
export const portfolioItems = pgTable(
  'portfolio_items',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    client: text('client').notNull().default(''),
    summary: text('summary').notNull().default(''), // one or two lines, on the grid tile
    body: text('body').notNull().default(''), // markdown, the details on the item's page
    websiteUrl: text('website_url'),
    // Cover photo: the grid thumbnail and the top of the item's page
    coverUrl: text('cover_url'),
    images: text('images').array().notNull().default(sql`'{}'::text[]`), // gallery on the item's page
    size: text('size').notNull().default('normal'), // 'normal' | 'wide' | 'tall'
    published: boolean('published').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    sortIdx: index('portfolio_items_sort_idx').on(t.sortOrder),
  })
)



// ──────────────────────────────────────────────────────────
// Site settings (single row, id always 1 — dashboard-driven metadata)
// ──────────────────────────────────────────────────────────

export const siteSettings = pgTable('site_settings', {
  id: integer('id').primaryKey().default(1),
  title: text('title')
    .notNull()
    .default('Mahtamun Hoque Fahim — Full-Stack Developer & AI Engineer'),
  description: text('description')
    .notNull()
    .default(
      'Full-stack developer and AI engineer from Bangladesh. Building web apps, tools, and digital products.'
    ),
  jobTitle: text('job_title').notNull().default('Full-Stack Developer & AI Engineer'),
  avatarUrl: text('avatar_url'),
  keywords: text('keywords')
    .array()
    .notNull()
    .default(
      sql`ARRAY['developer','AI engineer','full-stack developer','Bangladesh','Next.js','TypeScript','mahtamun','mahtamun hoque fahim']::text[]`
    ),
  ogTitle: text('og_title')
    .notNull()
    .default('Mahtamun Hoque Fahim — Full-Stack Developer & AI Engineer'),
  ogDescription: text('og_description')
    .notNull()
    .default(
      'Full-stack developer and AI engineer from Bangladesh. Building web apps, tools, and digital products.'
    ),
  marqueeSpeed: integer('marquee_speed').notNull().default(60), // px per second, both marquee strips
  // Off: /blog 404s and the blog leaves the navbar, footer, homepage and sitemap. Posts stay editable.
  blogEnabled: boolean('blog_enabled').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ──────────────────────────────────────────────────────────
// About page content (single row, id always 1 — dashboard-driven copy)
// ──────────────────────────────────────────────────────────

export const aboutContent = pgTable('about_content', {
  id: integer('id').primaryKey().default(1),
  headlineTop: text('headline_top').notNull().default('Designer who codes.'),
  headlineAccent: text('headline_accent').notNull().default('Developer who designs.'),
  intro: text('intro')
    .notNull()
    .default(
      "I'm Mahtamun Hoque Fahim. I grew up in Bangladesh with an internet connection and an obsession with how things look and work. That combination became a career."
    ),
  storyHeading: text('story_heading').notNull().default('The honest story'),
  storyParagraphs: text('story_paragraphs')
    .array()
    .notNull()
    .default(
      sql`ARRAY['I didn''t study design in a formal school. I learned by obsessively reverse-engineering things I loved: breaking down why a logo felt trustworthy, why a website felt fast, why some interfaces made you feel calm.','I started building websites because I couldn''t communicate what I wanted to developers. I started designing seriously because I couldn''t stand ugly interfaces. Both accidents became strengths.','Being from Bangladesh sharpened me. I couldn''t rely on proximity to opportunity, so I had to be undeniably good. That''s still the standard I hold myself to.','I care about work that ships, that works, that people actually use. Beautiful for its own sake doesn''t interest me. Beautiful and functional? That''s the whole game.']::text[]`
    ),
  // Extra block shown ABOVE the story (image left, text right). Hidden on the
  // public page while both the heading and the text are empty.
  extraHeading: text('extra_heading').notNull().default(''),
  extraParagraphs: text('extra_paragraphs').array().notNull().default(sql`'{}'::text[]`),
  extraImageUrl: text('extra_image_url'), // Cloudinary, uploaded from /admin/about
  storyImageUrl: text('story_image_url'), // image beside the story, same
  // Page layout switch: 'beside' | 'text' | 'tall' (see lib/constants.ts ABOUT_LAYOUTS).
  layout: text('layout').notNull().default('beside'),
  tallImageUrl: text('tall_image_url'), // the tall pinned image used by layout 'tall'
  ctaHeading: text('cta_heading').notNull().default('Want to work together?'),
  ctaText: text('cta_text')
    .notNull()
    .default("I'm selective about what I take on, which means I care about what you're building."),
  ctaPrimaryLabel: text('cta_primary_label').notNull().default('Get in touch'),
  ctaSecondaryLabel: text('cta_secondary_label').notNull().default('See portfolio'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Inferred types ────────────────────────────────────────
export type BlogPost = typeof blogPosts.$inferSelect
export type NewBlogPost = typeof blogPosts.$inferInsert
export type ContactMessage = typeof contactMessages.$inferSelect
export type NewContactMessage = typeof contactMessages.$inferInsert
export type FooterLink = typeof footerLinks.$inferSelect
export type NewFooterLink = typeof footerLinks.$inferInsert

export type SiteSettings = typeof siteSettings.$inferSelect
export type NewSiteSettings = typeof siteSettings.$inferInsert
export type AboutContent = typeof aboutContent.$inferSelect
export type NewAboutContent = typeof aboutContent.$inferInsert
export type Testimonial = typeof testimonials.$inferSelect
export type NewTestimonial = typeof testimonials.$inferInsert
export type PortfolioItem = typeof portfolioItems.$inferSelect
export type NewPortfolioItem = typeof portfolioItems.$inferInsert
