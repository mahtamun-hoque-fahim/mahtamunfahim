# PLANNER.md — Mahtamun. Personal Website

> Living technical document. Updated whenever `update repo` is triggered.
> Last updated: October 11, 2026

---

## Overview

| Field          | Value                                                                |
|----------------|----------------------------------------------------------------------|
| Project        | Mahtamun. — Personal Website                                         |
| Purpose        | Full-stack personal portfolio with blog and an admin CMS that edits nearly every page |
| Target user    | Design/dev clients, recruiters, personal network                     |
| Key value      | Fully managed site (portfolio, testimonials, blog, About page) with self-hosted admin |
| Status         | Operational                                                          |
| Repo           | `https://github.com/mahtamun-hoque-fahim/mahtamunfahim`           |
| Live (Vercel)  | `https://mahtamunhoquefahim.vercel.app`                              |
| Live (CF)      | Cloudflare Workers via OpenNext (worker name `mahtamunfahim`). The older `mahtamunhoquefahim.pages.dev` address dates from when this was Cloudflare Pages; verify it before relying on it. |

---

## Architecture

**Stack**

- Next.js 16 App Router (Turbopack in dev, webpack for `next build --webpack`, Node.js runtime)
- TypeScript, React 19
- Tailwind CSS 3.4 (not v4) + CSS custom properties; components use hardcoded hex values
- Neon Postgres (serverless HTTP driver)
- Drizzle ORM (single data layer)
- Better Auth (email/password, password reset, sessions in DB, admin email allowlist)
- Resend (transactional email)
- Cloudinary (admin image uploads: avatar, About page)
- lucide-react (icons)
- Motion is CSS-first; `framer-motion` is installed but not imported anywhere
- **Deploy targets:** Vercel (primary) + Cloudflare Workers via OpenNext (secondary)

**Folder structure**

```
app/
├── page.tsx                     home (hero + portrait, "who I help" strip, funnel sections, featured work, testimonials, blog when switched on, CTA)
├── testimonials/                bento grid of published testimonials, each tile opens a popup with the story
├── portfolio/                   bento grid of published work; [slug]/ one page per item (cover, details, images)
├── about/page.tsx               header, extra block, story (+ two images), CTA
├── blog/
│   ├── page.tsx                 blog listing
│   └── [slug]/page.tsx          single post (async params)
├── contact/
│   ├── page.tsx
│   └── actions.ts               server action: submitContactMessage
├── admin/
│   ├── layout.tsx               sidebar shell for signed-in users (carries data-admin, a hook for admin-only CSS)
│   ├── AdminSidebar.tsx         client component, lucide icons + active route highlight
│   ├── page.tsx                 dashboard (stat cards, recent posts, recent messages)
│   ├── actions.ts               ALL server actions (auth, blog + blog switch, settings, portfolio, testimonials, about + image uploads, footer links)
│   ├── login/, forgot-password/, reset-password/
│   ├── about/                   AboutForm.tsx (text fields + AboutImageField uploads)
│   ├── footer-links/            FooterLinksManager.tsx
│   ├── messages/                list + MarkReadButton
│   ├── posts/                   list, new/, [id]/, PostEditor.tsx, DeletePostButton.tsx
│   ├── portfolio/               PortfolioManager.tsx (CRUD, publish, tile size, order, page link, cover and gallery uploads)
│   ├── testimonials/            TestimonialsManager.tsx (CRUD, publish, tile size, order, website screenshot upload)
│   ├── settings/                SettingsForm.tsx (site meta, avatar, strip speed)
├── api/auth/[...all]/route.ts   toNextJsHandler(auth)
├── layout.tsx                   fonts, metadata, ambient glow, Person JSON-LD
├── template.tsx                 route enter fade (opacity on main/footer only, skipped on /admin)
├── globals.css                  tokens (light theme, site and admin), reveal and motion utilities
├── not-found.tsx, icon.svg + apple-icon.png (the "m." mark), robots.ts, sitemap.ts
components/
├── Navbar.tsx, Footer.tsx, Logo.tsx, AuthorCard.tsx, CopyCodeInit.tsx
├── ContactForm.tsx              client; calls submitContactMessage action
├── Reveal.tsx                   client; scroll-triggered blur-fade reveal (one IntersectionObserver, plays once)
├── BlurWords.tsx                per-word blur-in; mode 'load' (pure CSS) or 'scroll' (via Reveal)
├── MarqueeStrip.tsx             client; the one marquee strip (homepage "who I help"), speed from site settings
└── HeroPortrait.tsx             homepage hero portrait (transparent WebP, stands on the marquee strip)
docs/
lib/
├── auth.ts                      Better Auth server config + nextCookies + signup hook
├── auth-client.ts               createAuthClient for React
├── auth-utils.ts                getSession, isAuthenticated (allowlist), getCurrentUser
├── admin-allowlist.ts           parse ADMIN_EMAILS env, isAdminEmail()
├── db/
│   ├── index.ts                 drizzle(neon(DATABASE_URL))
│   ├── schema.ts                all 16 tables (see Database schema)
│   └── queries.ts               typed Drizzle query functions; cached reads via unstable_cache + tags; defaults returned when a read fails
├── cloudinary.ts                signed uploads: avatar, About-page image slots
├── constants.ts                 MAX_AVATAR_BYTES, marquee speed limits
├── blog-image.ts, email.ts (Resend templates, lazy init), markdown.ts (zero-dep MD renderer), utils.ts (cn, formatDate, slugify, estimateReadingTime)
public/
├── llms.txt, googlebbc855cc658d6673.html (Search Console verification)
└── images/fahim-hero-blue-shirt.webp       hero portrait
drizzle/                         generated migrations 0000 to latest + meta/
drizzle.config.ts
next.config.ts                   guarded initOpenNextCloudflareForDev() (dev only)
tailwind.config.ts
wrangler.jsonc                   Workers config (main: .open-next/worker.js, assets binding)
open-next.config.ts              OpenNext build config
scripts/
├── tsconfig.json                isolates scripts from next build typecheck
├── patch-noble-ciphers.js       postinstall fix for @noble/ciphers dedupe
├── create-admin.ts              one-time admin bootstrap (signup is closed)
└── export-backup.ts             data backup — run before any DB migration
.env.example
```

---

## Database schema

**Better Auth tables (singular names — Better Auth convention):**

- `user`: id, name, email, emailVerified, image, timestamps
- `session`: id, userId (FK), token, expiresAt, ipAddress, userAgent, timestamps
- `account`: id, accountId, providerId, userId (FK), password (hashed), tokens, timestamps
- `verification`: id, identifier, value, expiresAt, timestamps

**Application tables:**

- `blog_posts`: uuid, title, slug (unique), excerpt, content, cover_image, published, tags[], reading_time, timestamps
- `contact_messages`: uuid, name, email, subject, message, country, read, created_at
- `projects`: REMOVED from the code on `discovered-funnel` (migration 0018 drops it; run only after that code is live).
- `testimonials`: uuid, name, role, business, quote, details (the story in the popup, migration 0022), avatar_url (the client's round photo, Cloudinary `testimonial-<id>-avatar`, migration 0023), website_url, thumbnail_url (Cloudinary, a screenshot of the client's website), thumbnail_focus (its `object-position`, default `50% 50%`, migration 0024), show_thumbnail (default true; false = no image on the tile, whole in the popup, migration 0025), size (`normal` | `wide` | `tall`, the bento tile), published, sort_order, timestamps (index on sort_order). Migration 0017, run BEFORE merging.
- `portfolio_items`: uuid, slug (unique, the page link), title, client, summary (the tile and the page lead), body (markdown details), website_url, cover_url (Cloudinary, the grid thumbnail and the page cover), cover_focus (its `object-position`, default `50% 50%`, migration 0024), show_cover (default true; false = no image on the tile, whole on the page, migration 0025), images text[] (gallery on the page, up to 20), size (`normal` | `wide` | `tall`), published (default false), featured (default false: also on the homepage while published, migration 0021), sort_order, timestamps (index on sort_order). Migration 0020.
- `skills`: REMOVED from the code on `discovered-funnel` (migration 0015 drops it; run only after that code is live). Was the homepage "What I do" items.
- `footer_links`: id, label, url, group_label, external, sort_order, timestamps (index on sort_order)
- `site_settings`: integer id (always `1`, single row), title, description, job_title, **avatar_url** (nullable), keywords text[], og_title, og_description, **marquee_speed** (px/s for both marquee strips, default 60), updated_at — feeds `generateMetadata()` in `app/layout.tsx`, the root layout's Person JSON-LD, and the blog post JSON-LD author block. Read through `getCachedSiteSettings()` (`unstable_cache`, 1h revalidate, tag `site-settings`); written via admin `/admin/settings`.
- `about_content`: integer id (always `1`, single row), headline_top, headline_accent, intro, story_heading, story_paragraphs text[], **extra_heading, extra_paragraphs text[], extra_image_url, story_image_url, layout (`'beside'` | `'text'` | `'tall'`, default `'beside'`), tall_image_url** (the extra block above the story, the page layout switch, and the three Cloudinary images), cta_heading, cta_text, cta_primary_label, cta_secondary_label, updated_at — feeds `/about` (the 9 homepage teaser columns are dropped by migration 0019). Read through `getCachedAboutContent()` (tag `about-content`); written via admin `/admin/about`.
- Credentials: REMOVED from the code on `discovered-funnel` (the `/credentials` page, Admin > Credentials and the five `credential_*` tables; migration 0016 drops the tables, run only after that code is live).

All Drizzle reads return camelCase fields; column mapping (snake_case in DB) handled by `casing: 'snake_case'` in the Drizzle client config.

**Failure mode to know about:** the cached read functions in `queries.ts` catch database errors and return built-in defaults (settings, About text) or empty lists (testimonials, blog posts). That keeps pages up, but it means a missing column or a dropped column does not show an error; the live site just shows defaults or nothing. This is why the migration order rules below matter.

**Migration history:**

| Order | Change                                | Applied via            |
|-------|---------------------------------------|------------------------|
| 0000  | Initial schema (auth tables, blog_posts, contact_messages, projects) | `drizzle-kit generate` |
| —     | `projects.status_badges` (text[]) and `projects.collaborators` (jsonb), added before migrations tracked them | `db:push` / ALTER |
| 0001  | Credentials tables (5)                | `drizzle-kit generate` |
| 0002  | `site_settings` table                 | `drizzle-kit generate` (hand-trimmed — see AGENTS.md Security/Gotchas for why) |
| 0003  | `site_settings.avatar_url` (text, nullable) | `drizzle-kit generate` (clean diff — 0002_snapshot repaired the chain) |
| 0004  | `skills` table                        | `drizzle-kit generate` |
| 0005  | `footer_links` table                  | `drizzle-kit generate` |
| 0006  | `skills.image_position` (text, NOT NULL, default `'left'`) | `drizzle-kit generate` |
| 0007  | `site_settings.skills_layout` (text, NOT NULL, default `'rows'`) | `drizzle-kit generate` |
| 0015  | DROP `skills` table, DROP `site_settings.skills_layout` | `drizzle-kit generate` (destructive: run only after the code without Skills is live) |
| 0016  | DROP the five `credential_*` tables | `drizzle-kit generate` (destructive: run only after the code without Credentials is live) |
| 0017  | `testimonials` table                  | `drizzle-kit generate` (additive: run BEFORE merging) |
| 0023  | `testimonials.avatar_url` | `drizzle-kit generate` (additive; applied 2026-10-20) |
| 0024  | `testimonials.thumbnail_focus`, `portfolio_items.cover_focus` | `drizzle-kit generate` (additive; applied 2026-10-21) |
| 0025  | `testimonials.show_thumbnail`, `portfolio_items.show_cover` | `drizzle-kit generate` (additive; applied 2026-10-21) |
| 0022  | `testimonials.details` (default '') | `drizzle-kit generate` (additive; applied 2026-10-20) |
| 0021  | `portfolio_items.featured` (default false) | `drizzle-kit generate` (additive; applied 2026-10-20) |
| 0020  | `portfolio_items` table, `site_settings.blog_enabled` (default false) | `drizzle-kit generate` (additive: run BEFORE the code deploys; applied 2026-10-20) |
| 0018  | DROP `projects`                       | `drizzle-kit generate` (destructive: run only after the code without Projects is live) |
| 0019  | DROP the 9 `about_content` homepage teaser columns | `drizzle-kit generate` (destructive: run only after the code without the teaser is live) |
| 0008  | `projects.status_badges` dropped      | `drizzle-kit generate` |
| 0009  | `about_content` table                 | `drizzle-kit generate` (clean diff, only the new table) |
| 0010  | `about_content` homepage teaser columns (9) | `drizzle-kit generate` (clean diff) |
| 0011  | `projects.type` dropped               | `drizzle-kit generate`; run by hand in Neon (applied to production on Oct 9, 2026) |
| 0012  | `site_settings.marquee_speed` (integer, NOT NULL, default 60) | `drizzle-kit generate` (additive; run in Neon BEFORE deploying the code that reads it) |
| 0014  | `about_content.layout` (text, NOT NULL, default `'beside'`) and `tall_image_url` (text) | `drizzle-kit generate` (additive; run in Neon BEFORE deploying the code that reads it) |
| 0013  | `about_content` extra block + images (`extra_heading`, `extra_paragraphs`, `extra_image_url`, `story_image_url`) | `drizzle-kit generate` (additive; run in Neon BEFORE deploying the code that reads it) |

> **IMPORTANT:** Always run `npx tsx scripts/export-backup.ts` before any DB migration
> or ORM change. Add before you deploy (new columns/tables first, then the code); drop after you
> deploy (the code stops reading a column first, then drop it). Vercel previews and production share one database.

---

## Admin auth — locked down

Public signup is **disabled**. Only emails in `ADMIN_EMAILS` (comma-separated env var) can ever be created or sign in.

**Enforcement layers (defense in depth):**

1. `lib/auth.ts → databaseHooks.user.create.before` rejects any signup whose email isn't allowlisted — runs even if someone hits the Better Auth API directly.
2. `lib/auth-utils.ts → isAuthenticated()` and `getCurrentUser()` also check the session's email against the allowlist — protects against stale DB rows or removed admins.
3. `/admin/login` UI has no signup toggle — sign-in only. Forgot password link is preserved.

**Bootstrap a new admin:**

```bash
# ADMIN_EMAILS must contain the email first in .env
npm run admin:create -- you@example.com 'password' "Name"
```

This writes directly through Better Auth (bypassing the UI), but still passes through the allowlist hook.

**Revoke an admin:** remove their email from `ADMIN_EMAILS` → redeploy. Existing sessions will fail the allowlist check on next request.

---

## Admin features

**Dashboard (`/admin`)**

- 4 stat cards: Posts (live/draft), Testimonials (published count), Messages (unread), This week
- Recent posts panel (5 most recent, Live/Draft badges)
- Recent messages panel (5 most recent, unread highlight)
- Header CTAs: + New post, + New testimonial
- Quick actions row with unread inbox count

**Sidebar (`/admin/AdminSidebar.tsx`)**

- Fixed 240px left rail with lucide icons
- Active route highlight via `usePathname`
- Nav: Dashboard, Posts, Portfolio, Testimonials, About, Footer Links, Messages, Settings; footer (Back to site / Logout)
- Login/forgot/reset routes render full-bleed (no sidebar)
- The admin layout carries `data-admin` (a hook for admin-only CSS; nothing uses it now). The admin uses the same light palette as the public site since the 2026-10 retheme

**About content (`/admin/about`)**

- Single-row form over the `about_content` table: About page header (two headline lines, intro), story (heading plus paragraphs, one textarea with blank lines between paragraphs), call to action (heading, text, two button labels). Button links stay fixed in code
- `page.tsx` does the auth check and fetch; client `AboutForm.tsx` owns form state and calls `saveAboutContentAction`, which re-checks auth itself, validates and length-caps every field, and writes only known columns
- Save revalidates the `about-content` cache tag, `/` and `/about`; the public pages otherwise refresh on a 1h `unstable_cache` window
- `getAboutContent()` falls back to hardcoded defaults if the table is missing or the DB is unreachable, so `/` and `/about` render before migrations `0009` and `0010` are applied
- **Layout switch (Oct 2026):** a "Layout" section with three choices (images beside text, text only, tall pinned image), saved with "Save changes"; only the image fields relevant to the chosen layout are shown, with the recommended ratio and resolution beside each, and uploaded images are kept when switching.
- **Extra block + images (added Oct 2026):** an "Extra block" section (heading, paragraphs, "Image (left)") shown above the story on `/about`, and an "Image (left)" field in the Story section. The block stays hidden on the public page while its heading and text are both empty. Image fields (`AboutImageField` in `AboutForm.tsx`) upload through `uploadAboutImageAction` / `removeAboutImageAction` (auth-checked, slots `extra` and `story`, images only, 4 MB, Cloudinary public ids `about-extra` / `about-story`) and are saved immediately, separately from "Save changes". `saveAboutContentAction` also validates the extra block (heading max 120, up to 12 paragraphs of max 1500).

**Site settings (`/admin/settings`)**

- Single-row form over the `site_settings` table: avatar (Cloudinary upload), title, description, job title, keywords (CSV), OG title, OG description
- Avatar upload: `uploadAvatarAction` (`app/admin/actions.ts`) signs and posts directly to Cloudinary via `lib/cloudinary.ts` (Web Crypto SHA-1, no Node SDK — works on both the Vercel and Cloudflare Workers deploy targets). Fixed `public_id` so re-uploads overwrite the same asset instead of accumulating orphaned images. Has its own `isAuthenticated()` check inside the action itself, unlike the rest of this file's actions — an unauthenticated upload endpoint is a meaningfully different risk than an unauthenticated text write.
- Server component (`page.tsx`) does the auth check + fetch; client `SettingsForm.tsx` owns form state and calls `saveSiteSettingsAction`
- Save revalidates the `site-settings` cache tag and `/` immediately — public metadata otherwise refreshes on its own 1h `unstable_cache` window
- Drives `generateMetadata()` in `app/layout.tsx`, the root layout's JSON-LD Person block, and the blog post JSON-LD author block (via `job_title`)
- **Strip speed** (Oct 2026): a slider (10 to 200 px/s, default 60) stored in `site_settings.marquee_speed`. It drives the homepage marquee strip; the server action clamps it and revalidates `/` and `/projects`.

**Portfolio (`/admin/portfolio`)**
- Add, edit, publish/hide, feature/unfeature (featured + published items show on the homepage), reorder (up/down) and delete portfolio items: title, client, page link (made from the title when empty), summary, details (markdown), website, tile size in the /portfolio bento grid
- Cover photo and gallery images, uploaded after the first save (`uploadPortfolioImageAction`, Cloudinary `mahtamunfahim/portfolio`; cover `portfolio-<id>-cover`, gallery `portfolio-<id>-<time>`; 4 MB each, up to 20 gallery images). Removing an image takes it off the page; the file stays in Cloudinary
- The actions return `{ error }` instead of throwing, so production shows the real message (thrown server-action messages are masked)
- The navbar shows Portfolio only while at least one item is published

**Blog switch (top of `/admin/posts`)**
- `site_settings.blog_enabled`, off by default. Off: `/blog` and every post 404, and the blog leaves the navbar, the footer (any footer link to `/blog`), the homepage section and the sitemap. Posts can still be written and published; they show once it is on. `setBlogEnabledAction` revalidates `site-settings` and every page

**Testimonials (`/admin/testimonials`)**

- Add, edit, publish/hide, reorder (up/down) and delete testimonials: name, role, business, quote (600 chars), the client's website, tile size in the homepage bento grid (normal, wide = two tiles across, tall = two tiles down)
- The edit form opens inside the row you clicked, above its image preview (a new testimonial opens at the top of the list)
- Thumbnail: a screenshot of the client's website, uploaded after the first save (`uploadTestimonialImageAction`, Cloudinary `mahtamunfahim/testimonials/testimonial-<id>`, 4 MB, 16:10 recommended)
- Every action checks `isAuthenticated()` itself and validates input (lengths, `http(s)` URL, allowed sizes)
- The homepage section is hidden while no testimonial is published

**Other managers**

- **Projects**: removed (the `/projects` page, Admin > Projects, the JSON bulk import and the `projects` table) on `discovered-funnel`.

- **Skills**: removed (Admin > Skills, the `skills` table and the rows/columns switch are gone on `discovered-funnel`).
- **Footer links (`/admin/footer-links`)**: label, URL, group, external flag, order
- **Credentials**: removed (page, admin and tables) on `discovered-funnel`.
- **Posts (`/admin/posts`)**: Markdown blog posts with cover image, tags, draft/live

---

## Auth flow

1. `app/api/auth/[...all]/route.ts` — Better Auth handler (GET + POST).
2. Client forms call `authClient.signIn.email()`, `authClient.requestPasswordReset()`, `authClient.resetPassword()`. (No `signUp` from UI — gated by allowlist hook in Better Auth.)
3. Server reads session via `auth.api.getSession({ headers: await headers() })` in `lib/auth-utils.ts → getSession()`.
4. `app/admin/layout.tsx` exports `dynamic = 'force-dynamic'` and gates the admin sidebar on `isAuthenticated()` (allowlist-aware). Individual admin pages also redirect to `/admin/login` if unauthenticated.
5. Logout = server action calling `auth.api.signOut`, then `redirect('/admin/login')`.

Password reset:
- `requestPasswordReset(email)` → Better Auth generates a token, stores it in `verification`, sends an email via `sendResetPassword` callback → Resend.
- Reset link → `/admin/reset-password?token=...` → `authClient.resetPassword({ newPassword, token })`.

---

## Environment variables

| Variable                | Required | Notes                                          |
|-------------------------|----------|------------------------------------------------|
| `DATABASE_URL`          | yes      | Neon pooled URL, used in app                   |
| `DATABASE_URL_UNPOOLED` | yes (CI) | Direct Neon URL for `drizzle-kit` migrations   |
| `BETTER_AUTH_SECRET`    | yes      | `openssl rand -base64 32`                      |
| `BETTER_AUTH_URL`       | yes      | App base URL (differs per deploy target)       |
| `NEXT_PUBLIC_APP_URL`   | yes      | Same as `BETTER_AUTH_URL`, exposed to client   |
| `RESEND_API_KEY`        | yes*     | Resend API key — *now lazy; missing won't break build but emails fail silently |
| `RESEND_FROM_EMAIL`     | yes*     | Verified Resend domain sender                  |
| **`ADMIN_EMAILS`**      | **yes**  | Comma-separated allowlist for admin sign-in. **If unset → nobody can log in.** |
| `CLOUDINARY_CLOUD_NAME` | for uploads | Cloudinary account name. All three Cloudinary vars are needed for every admin image upload (avatar, About page); without them uploads fail with a clear error. |
| `CLOUDINARY_API_KEY`    | for uploads | Cloudinary API key                          |
| `CLOUDINARY_API_SECRET` | for uploads | Cloudinary API secret (server only)         |

> **Cloudflare note:** `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` must be set to the
> Cloudflare deployment's own domain, not the Vercel domain. `NEXT_PUBLIC_APP_URL` is also needed at build time there.

---

## Build hardening (May–Jun 2026)

Two issues that silently broke every deploy for ~2 weeks before being found:

1. **`scripts/export-backup.ts`** used `sql('SELECT ...')` — invalid in `@neondatabase/serverless` v1, must be `sql.query(...)`. `next build` runs tsc across the whole repo so this single file blocked production deploys. **Fix:** corrected the call + added `tsconfig.json` exclude for `scripts/` + separate `scripts/tsconfig.json` so utility scripts still type-check via `tsx` but don't affect `next build`.

2. **`next.config.ts`** called `initOpenNextCloudflareForDev()` at module load unconditionally. The function (despite its name) kicks off unawaited async I/O — on Vercel this throws `EPIPE` and kills the build before compile. **Fix:** guard with `NODE_ENV !== 'production' && NEXT_PHASE !== 'phase-production-build'`.

3. **`lib/email.ts`** instantiated `new Resend(process.env.RESEND_API_KEY)` at module load. Missing key threw synchronously and killed "collect page data" via the auth → email transitive import chain. **Fix:** lazy `getResend()`, no-op with console.warn if key missing.

---

## Cloudflare Workers (secondary deploy)

Configured via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). Despite earlier notes, this uses the **Workers** config format (OpenNext builds a Worker), not Cloudflare Pages.

**Workers Builds / deploy settings:**

| Setting              | Value                    |
|----------------------|--------------------------|
| Build command        | `npm run cf:build`        |
| Deploy command       | `npx wrangler deploy`     |
| Compatibility flags  | `nodejs_compat`, `global_fetch_strictly_public` |
| Compatibility date   | `2026-05-15`              |

**Files involved:**

- `wrangler.jsonc` — Workers format: worker `mahtamunfahim`, `main: .open-next/worker.js`, `assets` binding to `.open-next/assets`
- `open-next.config.ts` — default in-memory cache; documented R2/KV swap path for ISR
- `next.config.ts` — `initOpenNextCloudflareForDev()` runs only in dev (see Build hardening above)
- `scripts/patch-noble-ciphers.js` — postinstall fix for `@noble/ciphers` v1/v2 dedupe

**Deploy scripts:**

```
cf:build    opennextjs-cloudflare build
cf:preview  cf:build + opennextjs-cloudflare preview
cf:deploy   cf:build + opennextjs-cloudflare deploy
cf:upload   cf:build + opennextjs-cloudflare upload
cf:typegen  wrangler types -> cloudflare-env.d.ts
```

Not re-verified since the June build: that the Worker still fits the size limits after the motion, About and image-upload work, and that all env vars (including the three Cloudinary ones and `ADMIN_EMAILS`) are set there.

---

## Timeline

| Phase                         | Status | Notes                                      |
|-------------------------------|--------|--------------------------------------------|
| Foundation (Next 14, Supabase)| ✅     | Original setup                             |
| Projects + Blog               | ✅     | Full CRUD via admin                        |
| Auth migration (Better Auth)  | ✅     | Email/password + forgot password + Resend  |
| Next 16 + Neon + Drizzle      | ✅     | Full stack consolidated, Supabase removed  |
| Cloudflare (OpenNext)         | ✅     | Started as Cloudflare Pages; `wrangler.jsonc` is now the Workers format |
| Blog data restored            | ✅     | 10 posts migrated from Supabase to Neon    |
| Admin lockdown (allowlist)    | ✅     | Signup disabled, ADMIN_EMAILS gate         |
| Vercel build unbreaking       | ✅     | EPIPE + scripts tsc + Resend lazy init     |
| Admin sidebar + dashboard     | ✅     | Lucide nav, stat cards, recent panels      |
| Project CRUD + JSON import    | ✅     | Form CRUD + bulk upsert by name            |
| Status badges + beta modal    | removed | live/beta/deprecated/funding pills and the BetaModal were built, then removed (migration 0008) |
| Collaborators                 | ✅     | jsonb column, name + optional URL          |
| Dashboard-driven metadata     | [x]    | `site_settings` table + `/admin/settings`, wired into `generateMetadata()` and JSON-LD |
| Dashboard-driven About content | [x]   | `about_content` table + `/admin/about`, read by `app/about/page.tsx` through a cached query |
| Avatar upload (Cloudinary)    | [x]    | Signed upload via Web Crypto (no Node SDK), fixed public_id, wired into AuthorCard + Person JSON-LD |
| Blog AuthorCard + JSON-LD     | [x]    | `AuthorCard.tsx` on post pages, Article schema with nested author added |
| Skills, footer links, credentials dashboards | [x] | Tables `skills`, `footer_links`, `credential_*` and their `/admin` managers |
| Motion pass (PR #19, merged Oct 10, 2026) | [x] | CSS-only blur-fade reveals (`Reveal`, `BlurWords`), per-card reveals, hero entrance, route fade with arrival gate, button press, focus rings, navbar menu, contact form states, reduced-motion guard. No framer-motion. Also removed the project `type` field (migration 0011). |
| Hero portrait, palette, glow (PRs #20, #21) | [x] | Portrait standing in the hero, hero CTA buttons hidden (`SHOW_HERO_CTAS`), neutral palette `#111111` / `#222222` / `#333333` / `#444444`, one fixed ambient glow behind the portrait |
| Stats removed, one marquee strip, strip speed (PR #22) | [x] | `MarqueeStrip` for the homepage strip and `/projects` technologies, speed from Settings (migration 0012) |
| About blocks and film grain (PR #25) | [x] | Extra text block + two uploadable images on `/about` (migration 0013); `public/grain.png` grain at 4% |

---

## Next steps

- Decide when to bring back the hero "Let's talk" / "About me" buttons (`SHOW_HERO_CTAS` in `app/page.tsx`, currently `false`).
- Update `lib/email.ts` to the current palette (transactional emails still use the old dark palette).
- Remove dead weight: `framer-motion` (installed, never imported), (`ProjectsSection.tsx` and the credentials scripts are already gone).
- Set up ESLint for real (`npm run lint` is `next lint`, which Next 16 removed, and there is no ESLint config), or drop the script.
- Mobile: the hero portrait is hidden below 640px; decide on a phone placement.
- Left out of the motion pass: card hover polish, `loading.tsx` skeletons (each page renders its own Navbar, so a skeleton needs one too), an enter animation for any popup.
- Re-verify the Cloudflare deploy: bundle size after the recent work, and that all env vars (three Cloudinary ones, `ADMIN_EMAILS`) are set there.
- Delete merged branches (`stats-and-strips`, `about-blocks`, `grain`, `small-fixes`) and turn on "Automatically delete head branches" in the repository settings, so stacked PRs cannot be merged into a stale base again.
- Regenerate `drizzle/meta/0001_snapshot.json` properly so the migration chain no longer has a gap between `0000` and `0002` (see AGENTS.md Security/Gotchas)
- Add Vercel Speed Insights (`npm install @vercel/speed-insights`)
- Add 2FA / passkey via Better Auth plugins
- Optional: tag chips input instead of comma-separated string in the form
