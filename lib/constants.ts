// Matches next.config.ts experimental.serverActions.bodySizeLimit ('4mb').
// Kept under Vercel's ~4.5MB serverless function request-body ceiling,
// which serverActions.bodySizeLimit cannot raise past.
export const MAX_AVATAR_BYTES = 4 * 1024 * 1024

// Marquee strip (the homepage "who I help" strip): speed
// in pixels per second, set from Admin > Settings.
export const MARQUEE_SPEED_MIN = 10
export const MARQUEE_SPEED_MAX = 200
export const MARQUEE_SPEED_DEFAULT = 60

// About page layout (Admin > About). 'beside': both blocks with the image on the
// left and text on the right; 'text': no images, blocks stacked; 'tall': one
// tall image pinned on the left while the two text blocks scroll on the right.
export const ABOUT_LAYOUTS = ['beside', 'text', 'tall'] as const
export type AboutLayout = (typeof ABOUT_LAYOUTS)[number]
export const ABOUT_LAYOUT_DEFAULT: AboutLayout = 'beside'

// Every "free audit" button: lands on the contact form with the subject set to
// AUDIT_SUBJECT (components/ContactForm.tsx reads ?subject=audit).
export const AUDIT_HREF = '/contact?subject=audit#contact-form'
export const AUDIT_SUBJECT = 'Audit request'
