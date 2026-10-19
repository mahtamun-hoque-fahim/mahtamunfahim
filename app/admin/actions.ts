'use server'

import {
  ABOUT_LAYOUTS,
  MARQUEE_SPEED_DEFAULT,
  MARQUEE_SPEED_MAX,
  MARQUEE_SPEED_MIN,
} from '@/lib/constants'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { auth } from '@/lib/auth'
import { isAuthenticated } from '@/lib/auth-utils'
import {
  uploadAboutImageToCloudinary,
  uploadAvatarToCloudinary,
  uploadTestimonialImageToCloudinary,
  type AboutImageSlot,
} from '@/lib/cloudinary'
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  reorderTestimonials,
  type NewTestimonial,
  createBlogPost,
  deleteBlogPost,
  markMessageRead,
  updateBlogPost,
  updateSiteSettings,
  updateAboutContent,
  createFooterLink,
  updateFooterLink,
  deleteFooterLink,
  reorderFooterLinks,
  type NewBlogPost,
  type NewSiteSettings,
  type AboutContent,
  type NewFooterLink,
} from '@/lib/db/queries'
import {
} from '@/lib/db/queries'

// Footer renders on every top-level page (it's included per-page, not from
// the root layout), so an edit needs each of those paths revalidated.
function revalidateFooterPaths() {
  for (const p of ['/', '/about', '/blog', '/contact']) {
    revalidatePath(p)
  }
}

export async function uploadAvatarAction(formData: FormData) {
  // File uploads get an explicit auth check (unlike the other actions in
  // this file, which rely on their calling page already being gated) —
  // an unauthenticated upload endpoint is a meaningfully different risk
  // (storage/bandwidth abuse) from an unauthenticated text-field write.
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Not authenticated.')
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    throw new Error('No file provided.')
  }

  const avatarUrl = await uploadAvatarToCloudinary(file)
  const updated = await updateSiteSettings({ avatarUrl })

  revalidateTag('site-settings', 'max')
  revalidatePath('/')
  revalidatePath('/admin/settings')

  return updated
}

export async function removeAvatarAction() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Not authenticated.')
  }

  const updated = await updateSiteSettings({ avatarUrl: null })

  revalidateTag('site-settings', 'max')
  revalidatePath('/')
  revalidatePath('/admin/settings')

  return updated
}

export async function saveSiteSettingsAction(updates: Partial<NewSiteSettings>) {
  // Strip speed is the only numeric setting: keep it inside the range the
  // dashboard offers, whatever a client sends.
  if (updates.marqueeSpeed !== undefined) {
    const speed = Math.round(Number(updates.marqueeSpeed))
    updates.marqueeSpeed = Number.isFinite(speed)
      ? Math.min(Math.max(speed, MARQUEE_SPEED_MIN), MARQUEE_SPEED_MAX)
      : MARQUEE_SPEED_DEFAULT
  }
  const updated = await updateSiteSettings(updates)
  // The public site reads settings through the cached getCachedSiteSettings()
  // (unstable_cache, 1h revalidate) — revalidateTag clears that cache entry
  // immediately; revalidatePath('/') refreshes the homepage render on top.
  revalidateTag('site-settings', 'max')
  revalidatePath('/')
  revalidatePath('/admin/settings')
  return updated
}

export type AboutContentInput = Pick<
  AboutContent,
  | 'headlineTop'
  | 'headlineAccent'
  | 'intro'
  | 'storyHeading'
  | 'storyParagraphs'
  | 'extraHeading'
  | 'extraParagraphs'
  | 'layout'
  | 'ctaHeading'
  | 'ctaText'
  | 'ctaPrimaryLabel'
  | 'ctaSecondaryLabel'
  | 'homeHeading'
  | 'homeParagraphOne'
  | 'homeParagraphTwo'
  | 'homeLinkLabel'
  | 'homeCardRole'
  | 'homeCardDescription'
  | 'homeCardStack'
  | 'homeCardAvailability'
  | 'homeCardObsessions'
>

export async function saveAboutContentAction(input: AboutContentInput) {
  // Server actions are public POST endpoints, so gate explicitly instead of
  // trusting the calling page, and copy only known fields (never spread the
  // client object into the update, or a crafted request could set `id` etc.).
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Not authenticated.')
  }

  const clean = (value: unknown, max: number, label: string) => {
    const text = typeof value === 'string' ? value.trim() : ''
    if (!text) throw new Error(`${label} can't be empty.`)
    if (text.length > max) throw new Error(`${label} is too long (max ${max} characters).`)
    return text
  }

  const cleanList = (value: unknown, label: string) => {
    const items = Array.isArray(value)
      ? value.map((v) => (typeof v === 'string' ? v.trim() : '')).filter(Boolean)
      : []
    if (items.length === 0) throw new Error(`${label} needs at least one item.`)
    if (items.length > 8) throw new Error(`${label} has too many items (max 8).`)
    if (items.some((v) => v.length > 40)) {
      throw new Error(`An item in ${label} is too long (max 40 characters).`)
    }
    return items
  }

  const paragraphs = Array.isArray(input.storyParagraphs)
    ? input.storyParagraphs.map((p) => (typeof p === 'string' ? p.trim() : '')).filter(Boolean)
    : []
  if (paragraphs.length === 0) throw new Error('Add at least one story paragraph.')
  if (paragraphs.length > 12) throw new Error('Too many story paragraphs (max 12).')
  if (paragraphs.some((p) => p.length > 1500)) {
    throw new Error('A story paragraph is too long (max 1500 characters).')
  }

  // Extra block above the story: optional (both empty = hidden on the page).
  const extraHeading = typeof input.extraHeading === 'string' ? input.extraHeading.trim() : ''
  if (extraHeading.length > 120) throw new Error('Extra block heading is too long (max 120 characters).')
  const extraParagraphs = Array.isArray(input.extraParagraphs)
    ? input.extraParagraphs.map((p) => (typeof p === 'string' ? p.trim() : '')).filter(Boolean)
    : []
  if (extraParagraphs.length > 12) throw new Error('Too many extra block paragraphs (max 12).')
  if (extraParagraphs.some((p) => p.length > 1500)) {
    throw new Error('An extra block paragraph is too long (max 1500 characters).')
  }

  const layout = input.layout
  if (!(ABOUT_LAYOUTS as readonly string[]).includes(layout as string)) {
    throw new Error('Unknown About page layout.')
  }

  const updated = await updateAboutContent({
    headlineTop: clean(input.headlineTop, 120, 'Headline'),
    headlineAccent: clean(input.headlineAccent, 120, 'Accent headline'),
    intro: clean(input.intro, 800, 'Intro'),
    storyHeading: clean(input.storyHeading, 120, 'Story heading'),
    storyParagraphs: paragraphs,
    extraHeading,
    extraParagraphs,
    layout,
    ctaHeading: clean(input.ctaHeading, 120, 'CTA heading'),
    ctaText: clean(input.ctaText, 300, 'CTA text'),
    ctaPrimaryLabel: clean(input.ctaPrimaryLabel, 40, 'Primary button label'),
    ctaSecondaryLabel: clean(input.ctaSecondaryLabel, 40, 'Secondary button label'),
    homeHeading: clean(input.homeHeading, 120, 'Homepage heading'),
    homeParagraphOne: clean(input.homeParagraphOne, 600, 'Homepage first paragraph'),
    homeParagraphTwo: clean(input.homeParagraphTwo, 600, 'Homepage second paragraph'),
    homeLinkLabel: clean(input.homeLinkLabel, 40, 'Homepage link label'),
    homeCardRole: clean(input.homeCardRole, 40, 'Card role'),
    homeCardDescription: cleanList(input.homeCardDescription, 'Card description'),
    homeCardStack: cleanList(input.homeCardStack, 'Card stack'),
    homeCardAvailability: cleanList(input.homeCardAvailability, 'Card availability'),
    homeCardObsessions: cleanList(input.homeCardObsessions, 'Card obsessions'),
  })

  revalidateTag('about-content', 'max')
  revalidatePath('/')
  revalidatePath('/about')
  revalidatePath('/admin/about')
  return updated
}

function parseAboutSlot(value: unknown): AboutImageSlot {
  if (value === 'extra' || value === 'story' || value === 'tall') return value
  throw new Error('Unknown image slot.')
}

function aboutImagePatch(slot: AboutImageSlot, url: string | null) {
  if (slot === 'extra') return { extraImageUrl: url }
  if (slot === 'story') return { storyImageUrl: url }
  return { tallImageUrl: url }
}

export async function uploadAboutImageAction(formData: FormData) {
  // Explicit auth check, like the avatar upload: an unauthenticated upload
  // endpoint is a storage/bandwidth-abuse risk.
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Not authenticated.')
  }

  const slot = parseAboutSlot(formData.get('slot'))
  const file = formData.get('file')
  if (!(file instanceof File)) {
    throw new Error('No file provided.')
  }

  const url = await uploadAboutImageToCloudinary(file, slot)
  const updated = await updateAboutContent(aboutImagePatch(slot, url))

  revalidateTag('about-content', 'max')
  revalidatePath('/about')
  revalidatePath('/admin/about')
  return updated
}

export async function removeAboutImageAction(slotInput: string) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Not authenticated.')
  }

  const slot = parseAboutSlot(slotInput)
  const updated = await updateAboutContent(aboutImagePatch(slot, null))

  revalidateTag('about-content', 'max')
  revalidatePath('/about')
  revalidatePath('/admin/about')
  return updated
}

export async function logoutAction() {
  try {
    await auth.api.signOut({ headers: await headers() })
  } catch (error) {
    console.error('logoutAction error:', error)
  }
  redirect('/admin/login')
}

// ──────────────────────────────────────────────────────────
// Footer links (nav + social links shown in the site footer)
// ──────────────────────────────────────────────────────────

export async function createFooterLinkAction(payload: NewFooterLink) {
  const created = await createFooterLink(payload)
  revalidatePath('/admin/footer-links')
  revalidateFooterPaths()
  return created
}

export async function updateFooterLinkAction(id: string, payload: Partial<NewFooterLink>) {
  const updated = await updateFooterLink(id, payload)
  revalidatePath('/admin/footer-links')
  revalidateFooterPaths()
  return updated
}

export async function deleteFooterLinkAction(id: string) {
  await deleteFooterLink(id)
  revalidatePath('/admin/footer-links')
  revalidateFooterPaths()
}

export async function reorderFooterLinksAction(orders: Array<{ id: string; order: number }>) {
  await reorderFooterLinks(orders)
  revalidatePath('/admin/footer-links')
  revalidateFooterPaths()
}

export async function deletePostAction(id: string) {
  await deleteBlogPost(id)
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
}

export async function markMessageReadAction(id: string) {
  await markMessageRead(id)
  revalidatePath('/admin/messages')
}

export async function saveBlogPostAction(payload: Partial<NewBlogPost>, postId?: string) {
  if (postId) {
    const updated = await updateBlogPost(postId, payload)
    revalidatePath('/admin/posts')
    revalidatePath('/blog')
    if (updated?.slug) revalidatePath(`/blog/${updated.slug}`)
    return updated
  }
  const created = await createBlogPost(payload as NewBlogPost)
  revalidatePath('/admin/posts')
  revalidatePath('/blog')
  return created
}

// ──────────────────────────────────────────────────────────
// Testimonials (homepage bento grid). Every action checks auth itself and
// validates its input: these write public copy and upload files.
// ──────────────────────────────────────────────────────────

const TESTIMONIAL_SIZES = ['normal', 'wide', 'tall'] as const

async function requireAuth() {
  if (!(await isAuthenticated())) throw new Error('Not authenticated.')
}

function cleanTestimonial(input: Partial<NewTestimonial>): Partial<NewTestimonial> {
  const text = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
  const out: Partial<NewTestimonial> = {}
  if (input.name !== undefined) out.name = text(input.name, 80)
  if (input.role !== undefined) out.role = text(input.role, 80)
  if (input.business !== undefined) out.business = text(input.business, 80)
  if (input.quote !== undefined) out.quote = text(input.quote, 600)
  if (input.websiteUrl !== undefined) {
    let url = text(input.websiteUrl, 300)
    // "tradefigure.com" is how people type it; production hides thrown messages, so fix it instead of rejecting
    if (url && !/^[a-z][a-z0-9+.-]*:/i.test(url)) url = `https://${url}`
    if (url && !/^https?:\/\//i.test(url)) throw new Error('Website must start with http:// or https://')
    out.websiteUrl = url || null
  }
  if (input.size !== undefined) {
    if (!TESTIMONIAL_SIZES.includes(input.size as (typeof TESTIMONIAL_SIZES)[number])) throw new Error('Unknown tile size.')
    out.size = input.size
  }
  if (input.published !== undefined) out.published = Boolean(input.published)
  if (input.sortOrder !== undefined) out.sortOrder = Math.max(0, Math.floor(Number(input.sortOrder) || 0))
  return out
}

function revalidateTestimonials() {
  revalidatePath('/admin/testimonials')
  revalidatePath('/')
}

export async function createTestimonialAction(payload: NewTestimonial) {
  await requireAuth()
  const data = cleanTestimonial(payload)
  if (!data.name || !data.quote) throw new Error('Name and quote are required.')
  const created = await createTestimonial(data as NewTestimonial)
  revalidateTestimonials()
  return created
}

export async function updateTestimonialAction(id: string, payload: Partial<NewTestimonial>) {
  await requireAuth()
  const data = cleanTestimonial(payload)
  if (data.name === '' || data.quote === '') throw new Error('Name and quote are required.')
  const updated = await updateTestimonial(id, data)
  revalidateTestimonials()
  return updated
}

export async function deleteTestimonialAction(id: string) {
  await requireAuth()
  await deleteTestimonial(id)
  revalidateTestimonials()
}

export async function reorderTestimonialsAction(orders: Array<{ id: string; order: number }>) {
  await requireAuth()
  await reorderTestimonials(orders)
  revalidateTestimonials()
}

export async function uploadTestimonialImageAction(id: string, formData: FormData) {
  await requireAuth()
  const file = formData.get('file')
  if (!(file instanceof File)) throw new Error('No file provided.')
  const url = await uploadTestimonialImageToCloudinary(file, id)
  const updated = await updateTestimonial(id, { thumbnailUrl: url })
  revalidateTestimonials()
  return updated
}

export async function removeTestimonialImageAction(id: string) {
  await requireAuth()
  const updated = await updateTestimonial(id, { thumbnailUrl: null })
  revalidateTestimonials()
  return updated
}
