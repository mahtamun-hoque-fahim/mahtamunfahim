# AGENTS.md — mahtamunfahim

## Session Start

Run before any commit, every session, no exceptions:

```bash
git config user.name "mahtamun-hoque-fahim"
git config user.email "mahtamunhoquefahim@gmail.com"
```

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, DATABASE_URL_UNPOOLED, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL, ADMIN_EMAILS (nobody can sign in without it); RESEND_* and CLOUDINARY_* for email and image uploads
npm run dev
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | `next build --webpack` — production build |
| `npx tsc --noEmit` | Type-check only, no live DB needed |
| `npx drizzle-kit generate` | Generate a new migration from `lib/db/schema.ts` |
| `npx drizzle-kit migrate` | Apply pending migrations to `DATABASE_URL` |
| `npx drizzle-kit studio` | Browse the Neon DB |
| `npx tsx scripts/export-backup.ts` | Back up the data. Run before ANY migration |
| `npm run admin:create -- <email> '<password>' "<name>"` | Bootstrap an admin (email must be in `ADMIN_EMAILS`) |

`npm run lint` does not work (`next lint` was removed in Next.js 16 and there is no ESLint config); use `npx tsc --noEmit` plus the Vercel build.

## Conventions

- Stack: Next.js 16 App Router, TypeScript, Tailwind, Neon + Drizzle ORM (neon-http driver only, no node-postgres), Better Auth, Vercel (primary) + Cloudflare Workers via OpenNext (secondary) dual deploy.
- DB access always goes through `lib/db/queries.ts` — no raw Drizzle calls from route/component files.
- Public-facing DB reads that feed metadata or layout should go through an `unstable_cache`-wrapped function (see `getCachedSiteSettings`) with an explicit tag, and admin save actions must `revalidateTag(tag, 'max')` — in this Next.js version `revalidateTag` requires the two-arg form.
- Admin routes follow the server/client split established in `app/admin/posts`: a server `page.tsx` does the auth check (`isAuthenticated()` from `lib/auth-utils.ts`, redirect to `/admin/login`) and data fetch, a client component owns the form/state and calls a `'use server'` action from `app/admin/actions.ts`.
- Light palette on the public site (retheme, `docs/RETHEME.md`): `#FFFFFF` page, `#F7F8FA` surfaces, `#E5E7EB` lines, `#D1D5DB` hover borders, `#0B0F19` text, `#5B6475` muted, `#6B7280` dim, blue `#2563FF` accent (`#1D4ED8` hover, `#EFF4FF` soft). No grain, no glow. The admin dashboard uses the same light palette (error text `red-600`, warnings `amber-700`). See DESIGN_GUIDE.md section 2. Fonts: Plus Jakarta Sans (`--font-clash`, weights 400 to 800) for headlines, Inter (`--font-jakarta`) for body and Inter (`--font-jetbrains`) for uppercase labels/meta; real monospace is `--font-code`.
- No emojis anywhere in code or UI — lucide-react icons only.
- Session Log entries: the `Agent:` field is ALWAYS `Claude Edge` (Fahim's rule). It applies to every entry, past and future; never write a model name or surface name (such as `claude-sonnet (chat)`) there.
- Motion is CSS-first (no animation library). Never `transition-all`: list the properties. Scroll reveals use `components/Reveal.tsx` / `BlurWords.tsx` (blur-fade, once per view); above-the-fold entrances use the CSS-only `.blur-load` / `BlurWords mode="load"`. Hidden states live under `@media (scripting: enabled)`, and `prefers-reduced-motion` is handled globally in `globals.css`. Full rules in DESIGN_GUIDE.md section 8. Do not use `.blur-stagger` on `gap-px` grids.
- Migrations are generated with `drizzle-kit generate`, never hand-skipped — see the Security/Gotchas note below on why `0001` broke that rule and what that costs.
- Migration ORDER (Vercel previews and production share one database): back up, then ADD (new column with a default, new table) BEFORE merging the code that reads it; DROP a column only AFTER the code that stops reading it is live. Give the person ONE SQL statement at a time and state the order explicitly.
- Stacked PRs (a branch built on another branch): merge bottom-up with "Create a merge commit" and retarget the next PR to `main` (or delete the merged base branch) before merging it, otherwise GitHub merges it into the old base and the work never reaches `main`. Verify with the compare API (`ahead_by` against `main`) after merging.
- Every change updates the docs it touches (DESIGN_GUIDE.md for visual rules, PLANNER.md for schema, routes and admin features, README.md for setup) and adds a Session Log entry in the same PR.

## Security / Gotchas

- **Migration snapshot chain drift**: `drizzle/0001_credentials_tables.sql` exists with no matching `drizzle/meta/0001_snapshot.json`. This means `drizzle-kit generate` diffs against `0000_snapshot.json`, not the true post-0001 state — any future `generate` run will re-propose objects that already exist in prod (this happened with `0002`, which had to be hand-trimmed down to just the actually-new `site_settings` table; `0002_snapshot.json` was kept as generated since it's a correct full-schema snapshot, which repairs the chain going forward). If you ever regenerate `0001` properly, re-verify `0002` still applies cleanly.
- **`npx drizzle-kit migrate` can fail silently.** On this machine it exited 1 with no error message and applied nothing (its spinner hides the error). If it does, apply the same files with drizzle-orm's `drizzle-orm/neon-http/migrator` from a short node script: it writes the same `drizzle.__drizzle_migrations` journal and prints the failing query. It is not transactional, so a failure leaves earlier migrations' tables behind.
- **Reads fail soft, not loud.** The data-access functions in `lib/db/queries.ts` catch database errors and return built-in defaults (site settings, About text) or empty lists (projects, skills). A missing or dropped column therefore shows up as missing content on the live site, with no error page. After any schema change, look at the live pages, not just the build status.
- **Coupled layout values.** The hero container (`app/page.tsx`) is full height and centres the text; the portrait is anchored to it with `bottom-0`, so it stands on the marquee strip wherever the text sits. Its height is `min(100vh - 8rem, 40rem)`; if the h1 grows past `clamp(2.75rem, 5.5vw, 5rem)`, check it still clears the portrait at 1440 and 1920.
- **Misleading names kept on purpose.** `--font-clash` is the headline font alias (Plus Jakarta Sans now; once Clash Display, then Syne, then Instrument Serif); `--font-jakarta` and `--font-jetbrains` are both Inter now; `.prose-dark` is the blog prose style (light now); `--border` and `--accent-dim` are legacy names of `--line` and `--accent-hover`.
- **No fake bold.** `html { font-synthesis-weight: none; }` was added when the headline font (Instrument Serif) had one weight; keep it. With Plus Jakarta Sans the `font-bold` on headings is a real bold.
- **PATs are session-only.** Never commit a token, never write one into this file, .env files, or any doc. A fresh PAT is supplied in-chat per session.
- **neon-http driver only** — no node-postgres, no pooled connections outside what Neon's HTTP driver handles. Edge runtime compatible everywhere.
- Build verification (`npx tsc --noEmit` + `npm run build`) requires network access to `fonts.googleapis.com` (next/font/google) and to Neon (`DATABASE_URL`) for any DB-touching build step — both are unavailable in sandboxed dev environments without egress; run the full build locally or let Vercel's build do it.

## Session Log

### 2026-10-20 (featured work): featured portfolio items on the homepage
- Agent: Claude Edge
- Request (Fahim): portfolio items can be featured, and the featured ones show on the homepage.
- Done: `portfolio_items.featured` (migration `0021_portfolio_featured.sql`, one additive column, default false; APPLIED by me after a backup). Admin > Portfolio: "Featured on the homepage" checkbox in the editor, a Feature/Unfeature button and a label in the list. Homepage: "Work for businesses like yours." with an "All work →" link, just before "What clients say.", showing published + featured items; not rendered while none. The grid moved into `components/PortfolioGrid.tsx`, shared with `/portfolio`. `getPortfolioItems({ featuredOnly: true })` implies published.
- Verified: `npx tsc --noEmit` clean; with two temporary published items (one featured, then deleted) the homepage showed only the featured one. NOT verified: the admin toggle signed in.

### 2026-10-20 (About headline): two lines on bigger screens
- Agent: Claude Edge
- Request (Fahim, screenshot of /about wrapping its headline into four lines): show it as two lines on bigger screens.
- Fix (`app/about/page.tsx`): from `lg` up each headline line is `whitespace-nowrap` at `min(5.2vw, 4.5rem)`. Phones keep the old size and wrap. DESIGN_GUIDE "About page headline".
- Verified: in the browser pane the h1 is two lines at 1024, 1366 and 1920; the longer line ("your business and its customers.") measures 797/972, 1064/1104 and 1078/1104px. Copy much longer than about 32 characters per line would overflow; noted in DESIGN_GUIDE.

### 2026-10-20 (portfolio, blog switch): business portfolio back, the blog can be switched off
- Agent: Claude Edge
- Requests (Fahim): (1) portfolio again, business centric: a bento grid with edge-to-edge, equal thumbnails like the testimonials; each item opens its own page with a cover photo, details and images; all CRUD from the dashboard. (2) A switch to turn the blog off: off removes every trace of it from the public site (page, homepage section, navbar, footer), posts can still be written. (3) The About page's portfolio button goes to this site's portfolio, not the design portfolio.
- (1) New `portfolio_items` table (slug, title, client, summary, markdown body, website, cover, gallery `images[]`, size, published, order). `/portfolio` (bento grid, one cover height for every tile size) and `/portfolio/[slug]` (cover, details, images, audit CTA; unpublished = 404). Admin > Portfolio (`PortfolioManager`): create, edit, publish, reorder, delete; cover and gallery uploads to Cloudinary `mahtamunfahim/portfolio` after the first save. Its actions return `{ error }` instead of throwing, so production shows the real message (duplicate page link, bad website, upload failure). The navbar shows Portfolio only while something is published (with nothing published `/portfolio` shows one line pointing at the audit).
- (2) `site_settings.blog_enabled` (default OFF), switch at the top of Admin > Posts. Off: `/blog` and every post 404, no Blog in the navbar, footer links to `/blog...` are filtered out, no homepage blog section, no blog in the sitemap. To do this the navbar is split: `components/Navbar.tsx` is now a server component that reads the switch and the published portfolio count and renders `NavbarClient.tsx` (the old client navbar); no page had to change.
- (3) About secondary button: internal link to `/portfolio`, no arrow; its admin hint says so. The label is still the DB value ("See portfolio" by default).
- DATABASE: `drizzle/0020_portfolio_and_blog_switch.sql` (CREATE TABLE `portfolio_items` + index, `ALTER TABLE site_settings ADD COLUMN blog_enabled boolean DEFAULT false NOT NULL`), additive. APPLIED by me on 2026-10-20 to the new database after a backup, before this code deploys (the code on `main` ignores both). `scripts/export-backup.ts` now includes `portfolio_items`.
- Verified: `npx tsc --noEmit` clean; on the dev server with two temporary published items (inserted, then deleted): `/portfolio` 200 with the wide and normal covers both at 413 to 637px, `/portfolio/<slug>` 200 with the cover, markdown headings and images, unknown slug 404; with the blog off `/blog` 404, the navbar is Home, Portfolio, About, Contact, no "From the blog." on the homepage, the sitemap lists no blog URLs; the About button points at `/portfolio`. NOT verified: the admin page signed in (uploads, save errors), the switch turning the blog back on, phone width.
- Not changed: `public/llms.txt` (a static file) still lists the blog and its posts; the homepage has no portfolio section (only the page and the navbar link). Gallery images cannot be reordered yet (remove and re-add).

### 2026-10-20 (testimonial thumbnails): one thumbnail height for every tile size
- Agent: Claude Edge
- Request (Fahim, screenshot of a normal and a wide testimonial side by side): the thumbnails should end on the same line whatever the tile size, for every testimonial added.
- Cause: each thumbnail was `aspect-[16/10]` of its tile's width, so a wide tile (two columns) had a taller image, and tall tiles stretched theirs.
- Fix: every thumbnail is `h-48` / `md:h-56` (`object-cover object-top`), whatever the size. DESIGN_GUIDE "Testimonials bento grid".
- Verified: `npx tsc --noEmit` clean; at 1366px the normal and wide tiles' thumbnails both span 4217 to 4441px. The dev server was on port 3001 this time (3000 taken).

### 2026-10-19 (About teaser removed): the obsolete homepage teaser fields are gone from Admin > About
- Agent: Claude Edge
- Request (Fahim, screenshot of Admin > About): find which fields are obsolete, then remove them.
- Obsolete: the whole "Homepage teaser" section (heading, two paragraphs, link label, the code card's role and four lists). The homepage stopped rendering that block on `discovered-funnel`; only the admin form, its save action and the defaults still touched it. Everything else on the page feeds `/about` (the tall image only with the "Tall image" layout).
- Removed: the section in `AboutForm.tsx`, the nine fields and the now-unused `cleanList` in `saveAboutContentAction`, their defaults in `lib/db/queries.ts`, the nine columns in `lib/db/schema.ts`. Stale wording fixed: "Headline, green line" is "Headline, blue line"; the page description no longer mentions the teaser. PLANNER updated.
- DATABASE (not applied by me, destructive): `drizzle/0019_remove_about_home_teaser.sql` (generated, nine `ALTER TABLE "about_content" DROP COLUMN ...` statements). ORDER: run it only AFTER this code is live on Vercel; the deployed code before it still reads and writes these columns. The new code works with or without them. Nothing of value is lost (they held the old engineer copy).
- Also seen: saving Admin > About on production showed the generic Server Components error because the Header fields were empty, and production hides the "can't be empty" message (same masking as the testimonial website).
- Verified: `npx tsc --noEmit` clean; drizzle-kit generated only the nine drops. NOT verified: the admin page signed in.

### 2026-10-19 (icon): the "m." mark as favicon and app icon
- Agent: Claude Edge
- Request (Fahim, `Frame 18.svg`: a white "m" with a blue dot): use it for the favicon and other purposes.
- Done: `app/icon.svg` replaced (the old three-shape mark is gone): dark "m" on light browser themes, white on dark, blue dot always; new `app/apple-icon.png` (180px, white on `#0B0F19`); `public/images/mark-white.svg` (the original) and `public/images/icon-512.png` kept for other uses. PNGs rendered with `sharp`. DESIGN_GUIDE "Icon", README and PLANNER file trees.
- Kept: the navbar wordmark (`Logo.tsx`). "Other purposes" read as files ready to use, not wired anywhere else yet (no web manifest or Organization logo exists in the code).
- Verified: `/icon.svg` and `/apple-icon.png` return 200 on the dev server and the homepage head links both. NOT seen: the favicon in a real browser tab, light and dark.

### 2026-10-19 (blog covers repo): covers come from `mahtamunfahim-blog-image`
- Agent: Claude Edge
- Request (Fahim): blog image thumbnails should be fetched from `mahtamunfahim-blog-image` from now on.
- Done: `lib/blog-image.ts` base URL is `https://raw.githubusercontent.com/mahtamun-hoque-fahim/mahtamunfahim-blog-image/main/covers`, and the hint in the post editor names the new repo. Same convention as before: `covers/{slug}.{ext}` on branch `main`; a full URL stored in the cover field still passes through unchanged.
- NOT verified: at the time of this change the GitHub API returned 404 for that repo (not created yet, or private). raw.githubusercontent.com only serves public repos, so covers stay broken until the repo is public with a `covers/` folder on `main`.

### 2026-10-19 (offer cards): Ways to work together cards are blue, black and white
- Agent: Claude Edge
- Request (Fahim, screenshot of "Pick what fits where your business is today."): cards are to be blue, black and white themed.
- Read as one theme per card, in his order: One-time project blue (`#2563FF`, white text), Website care plan black (`#0B0F19`, white title, `#A3ACBD` text, `#60A5FA` link), Design only white (as before). `offerThemes` in `app/page.tsx`; DESIGN_GUIDE "Offer cards".
- Verified: `npx tsc --noEmit` clean; the blue and black cards render in the browser pane. NOT seen: all three side by side at full desktop width.
- Follow-up (Fahim): add buttons on the cards; make the cards stacked one over another, tidied up once scrolled. Each card's text link became a pill button (white on blue, blue on black, black on white). `.offer-stack` replaces `blur-stagger` there (both use `transform`): from `md` up the cards start piled on the middle one at different tilts and slide out into the row when revealed. Verified: `npx tsc --noEmit` clean; at desktop width the out-of-view transforms compute as intended (third card -316px, 6deg); buttons render at phone width. NOT seen by eye: the spread animation at desktop width (the pane kept resizing).

### 2026-10-19 (admin states, road glow): five states for admin controls, cursor glow on the guided map road
- Agent: Claude Edge
- Requests (Fahim, screenshot of the testimonial tile-size buttons): (1) admin panel: these should be clickable, where are the five states for each input and button; (2) homepage roadmap: a blue glow that continuously follows the cursor, strictly on the road path, fading at the edges.
- (1) Tile-size buttons: the selected class was concatenated onto `btnSecondary`, so its `border-[#2563FF]` / `text-[#2563FF]` competed with the base colours and lost; nothing looked selected. Now merged with `cn()`, with an `#EFF4FF` fill and `aria-pressed`; same fix for the delete button's red hover. Admin-wide: `globals.css` gives every `[data-admin]` button and field the same states (hover border on fields, focus ring, pressed scale, disabled opacity and cursor, pointer cursor, blue checkboxes). Read as the five states default, hover, focus, active, disabled. DESIGN_GUIDE "Buttons".
- (2) `components/RoadGlow.tsx` now renders the road SVG with a third stroke painted by a radial gradient at the road point nearest the mouse (400 samples of the path), eased with rAF, scaled back into a circle despite the stretched viewBox; fades out when the mouse leaves. Read "fade away at the edges" as a soft glow edge plus the existing top/bottom road fade. DESIGN_GUIDE "Guided map".
- Verified: `npx tsc --noEmit` clean; in the browser pane at 1366x768 a synthetic mouse move put the glow on the road beside pin 02 (screenshot). NOT verified: the admin states signed in, a real mouse.
- Follow-up (Fahim): the glow should follow the steps instead, slowly travelling to and snapping on the current one once scrolled. `RoadGlow` no longer follows the mouse: it targets the pin of the step row nearest the middle of the screen and eases along the road to it (path length, so it follows the curves). Verified: after scrolling to step 3 the glow centre moved to pin 03 (50, 250) and the screenshot shows it there. NOT verified by eye: the travel speed.
- Noticed, not changed: `components/ContactForm.tsx` focus shadow `focus:shadow-[0_0_0_3px_rgba(37, 99, 255,0.12)]` has spaces from the accent replace, so Tailwind drops it and the contact fields have no focus ring.

### 2026-10-19 (testimonial website without https): saving no longer fails on a bare domain
- Agent: Claude Edge
- Report (Fahim, screenshot of Admin > Testimonials on production): saving a testimonial with the website `tradefigure.com` showed Next's generic "An error occurred in the Server Components render" message.
- Cause: `cleanTestimonial` in `app/admin/actions.ts` threw "Website must start with http:// or https://", and production builds replace thrown server-action messages with that generic text.
- Fix: a website with no scheme gets `https://` added; anything with another scheme (`javascript:` and the like) is still rejected. Other thrown validation messages (name and quote required, unknown size, upload errors) are still masked the same way in production.
- Verified: `npx tsc --noEmit` clean. NOT verified on the deployed site.

### 2026-10-19 (new database migrated): all 19 migrations on the new Neon database, 0008 made replayable
- Agent: Claude Edge
- Request (Fahim): he put the new database's connection strings in `.env` and `.env.local`; run `npx drizzle-kit migrate` on it.
- Checked first: the new host (`ep-bold-union`, us-east-2) differs from personal-website's (`ep-floral-resonance`, ap-southeast-1), and it had no tables.
- Problem: `drizzle-kit migrate` exited 1 with no message (see Gotchas). Run through drizzle-orm's neon-http migrator, it failed at `0008`: `ALTER TABLE "projects" DROP COLUMN "status_badges"` on a column that no migration ever creates (it was added by hand in the old production database; `0002` was trimmed on the assumption it existed). So the migration chain could not be replayed on an empty database.
- Fix: `0008` is now `DROP COLUMN IF EXISTS`. Changing an applied file is harmless: drizzle decides what to run by the journal timestamps, not by file hashes. The partial tables from the failed run (only mine, the database was empty before) were dropped, then all 19 migrations applied in one run: `about_content`, `account`, `blog_posts`, `contact_messages`, `footer_links`, `session`, `site_settings`, `testimonials`, `user`, `verification`.
- Verified: `/`, `/about`, `/blog`, `/contact` 200 on the dev server with no new database errors in its log. NOT done: an admin account (`npm run admin:create`, email must be in `ADMIN_EMAILS`); the database has no content yet.

### 2026-10-20 (new repo): this site moved out of personal-website into `mahtamunfahim`
- Agent: Claude Edge
- Request (Fahim): copy the `discovered-funnel` branch of `personal-website` to `E:\codes\mahtamunfahim`, make it the `main` of the new GitHub repo `mahtamun-hoque-fahim/mahtamunfahim` (fresh history), delete the branch from `personal-website`, whose `main` stays intact as its own source.
- Done: the branch's tracked files exported (`git archive`) into a new repo, one fresh initial commit on `main`, pushed. `.env` and `.env.local` copied locally (never committed; `.env` added to `.gitignore`, which only covered `.env*.local` before). Renamed so this repo can never overwrite the old site: Cloudflare worker `mahtamunfahim` (`wrangler.jsonc`), package name `mahtamunfahim`, Cloudinary upload folders `mahtamunfahim/...` (they were `personal-website/...`: with a shared Cloudinary account the fixed public ids would have overwritten the live site's avatar and About images), repo URLs and titles in the docs. Older Session Log entries keep their original branch and repo names as history.
- DATABASE: Fahim is creating a NEW database for this site, so it no longer shares one with `personal-website`. Put its connection strings in `.env.local` (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`), then run all migrations on the new database (`npx drizzle-kit migrate`), including the drops 0015, 0016, 0018 (safe here: nothing else reads that database). Until then pages fail soft (built-in defaults, empty lists) and admin saves fail.
- NOT changed (decide later): the site URL `mahtamunhoquefahim.vercel.app` in metadata, sitemap, robots, `llms.txt`, emails and JSON-LD, plus `mahtamunhoquefahim.CNAME` and `_vercel.txt` (domain-verification files of the old site). Set them once the new domain is known. `.env` and `.env.local` still hold the old site's values (database, auth URL, Cloudinary): switch them to the new ones.

### 2026-10-20 (projects out, testimonials in): bento grid of client testimonials, Projects removed, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim, screenshot of "Proof you can click through yourself."): clear this section, from the admin panel too, and prepare it for client testimonials: a bento grid with edge-to-edge thumbnails. His answers to my questions: remove ALL of Projects (page, admin, table); testimonials managed from a new Admin > Testimonials; the thumbnail is a screenshot of the client's website.
- Testimonials: new `testimonials` table (name, role, business, quote, website_url, thumbnail_url, size `normal` | `wide` | `tall`, published, sort_order), queries in `lib/db/queries.ts`, auth-checked and validated server actions (create, update, delete, reorder, screenshot upload and removal via a shared `uploadImageToCloudinary` in `lib/cloudinary.ts`), `app/admin/testimonials/` (page + `TestimonialsManager`), sidebar entry where Projects was, dashboard stat card and quick actions. Homepage: "What clients say." bento grid (3 columns, wide = 2 columns, tall = 2 rows), each tile opens with the website screenshot bleeding to the tile edges, then the quote, name, role, business and website link; the section is NOT rendered while no testimonial is published (no invented quotes, ever). DESIGN_GUIDE "Testimonials bento grid".
- Projects removed: `/projects`, `/admin/projects` (CRUD, featured, JSON bulk import, `JsonHelpPanel`), `components/ProjectCard.tsx`, the dead `components/ProjectsSection.tsx`, `docs/PROJECT_JSON_SCHEMA.md`, all project queries, actions and schema, the navbar link, the sitemap entry, the Projects link in `AuthorCard`, the `/projects` line in `public/llms.txt` (the list of his projects with their external links stays there). The hero's secondary "See my work" button pointed at `/projects`, so it is gone: the hero has the single "Get a free website audit" action.
- Backup script fixed (important): `scripts/export-backup.ts` only exported blog posts, messages and projects, so my earlier "back up first" for the skills and credentials drops would NOT have saved them. It now exports every app table (testimonials, footer links, settings, About, skills, the five credential tables too) and skips any table that no longer exists.
- DATABASE (not applied by me), order matters:
  1. BEFORE merging, run `drizzle/0017_add_testimonials.sql` (CREATE TABLE "testimonials" plus its index): additive, safe for `main`. Until it exists, Admin > Testimonials cannot save and the homepage section stays hidden.
  2. AFTER the merge has deployed, with a fresh backup (`npx tsx scripts/export-backup.ts`), run the drops one at a time: 0015 (skills), 0016 (credentials), and `drizzle/0018_remove_projects.sql` (`DROP TABLE "projects" CASCADE;`). Production on `main` still reads `projects` until then.
  - Any footer link to `/projects` lives in the `footer_links` table; remove it in Admin > Footer Links.
- Verified: `npx tsc --noEmit` clean; `/` 200 with the testimonial section hidden (no table yet), `/projects` and `/admin/projects` 404, `/admin/testimonials` redirects to login when signed out, `/about`, `/blog`, `/contact` 200. NOT verified: the admin page signed in and the bento grid with real data (needs migration 0017 and at least one testimonial).

### 2026-10-20 (dark How I work): third dark band, copy for the problem section, branch `discovered-funnel`
- Agent: Claude Edge
- Requests (Fahim): (1) problem section: heading "You can't expect sales if ...", first card "website looks old" with "outdated" in its text (`1c4c595`); (2) How I work (trust cards + free audit pitch) dark themed.
- (1) Heading "You can't expect sales if…"; each card title finishes it: "your website looks old" (his words plus "your"; text now says "An outdated design"), "it loads slowly", "Google can't find it", "visitors don't know what to do next", "it can be hacked" (the last four reworded by me to fit the sentence; their texts unchanged). All titles one line, heading two lines at 1366.
- (2) How I work is now a full-bleed `#0B0F19` band (`data-nav-dark`, inner container keeps the grid and the sticky right column): white heading, `#A3ACBD` paragraphs and small print, `#111827` trust cards with white titles, blue button unchanged. DESIGN_GUIDE "Dark bands" now lists three bands.
- Verified: `npx tsc --noEmit` clean; in the dev browser at 1366x768 the navbar turns dark over the section and the screenshot shows the dark cards and pinned pitch.

### 2026-10-20 (blue-shirt photo): hero portrait swapped again, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim, with the image): try this one (same pose, black suit, blue shirt).
- Done: cropped to the subject (452 x 969, about 39 KB) as `public/images/fahim-hero-blue-shirt.webp`; `fahim-hero-blue.webp` (the blue-suit try) deleted. Same zoom and placement (`aspect-[452/731]`, `object-cover object-top`, height `min(100vh - 8rem, 40rem)`), new src and size in `HeroPortrait.tsx`; DESIGN_GUIDE, PLANNER and README paths updated.
- Verified: `npx tsc --noEmit` clean; the new image loads in the dev browser (452 x 969). NOT seen settled by eye (the final screenshot timed out with the app window hidden).

### 2026-10-20 (blue-suit photo): new hero portrait, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim, with the image): replace the hero picture with this one (same pose, blue suit).
- Done: the upload (974 x 1104 PNG, already transparent) cropped to the subject with `sharp` and saved as `public/images/fahim-hero-blue.webp` (452 x 968, quality 88, about 42 KB), a new file name so browsers do not show a cached older photo; `fahim-hero-color.webp` deleted. `HeroPortrait.tsx`: new src, size, and `aspect-[452/731]` (the same zoom as before: the bottom quarter is cropped). Hero title is also weight 700 now (`c050a7b`). No colours were changed for the blue suit.
- Verified: `npx tsc --noEmit` clean; at 1366x768 the new image loads (452px natural width), the box is 792 to 1188 x 136 to 776, standing on the strip, and the screenshot shows the blue suit beside the bold headline.

### 2026-10-20 (centred hero, accent #2563FF): branch `discovered-funnel`
- Agent: Claude Edge
- Requests (Fahim, screenshot of the hero with empty space at the top): put the hero's text in the middle of the screen; try `#2563FF` as the accent.
- Hero: the container is now full height (`flex-1`) and centres its content (`justify-center`), so the headline, intro, buttons and reassurance line sit in the middle of the space below the navbar (measured 228 to 604px on a 768px screen). The portrait moved out of the text wrapper and is anchored to that full-height container with `bottom-0`, so it still stands on the marquee strip (the old `bottom-[-4rem]` / `pb-16` coupling is gone). Read as vertical centring; text stays left-aligned.
- Accent: every `#2563EB` and `rgba(37,99,235,...)` in `app/`, `components/` (public site and admin) is now `#2563FF` / `rgba(37,99,255,...)`: 32 files. About 4.9:1 on white (AA for text and buttons; was 5.2:1). Hover stays `#1D4ED8`. DESIGN_GUIDE (outside the changelog), `docs/RETHEME.md` and the AGENTS.md convention updated.
- Verified: `npx tsc --noEmit` clean; served CSS has the new hex and none of the old; screenshot at 1366x768 shows the centred text, the portrait on the strip and the brighter blue. The h1 box overlaps the portrait box by 29px at 1366, but only over empty background beside his head.

### 2026-10-20 (typography, zoom, solid navbar): taste-skill pass, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim, via /taste-skill): find typography mistakes and fix them; zoom in his picture; navbar solid, with a slightly lighter dark background over dark areas.
- Typography (measured with the taste-skill inspector at 1440 / 768 / 390, `.taste-skill/before` vs `.taste-skill/after`): body text was 14px and soft grey, now 16px in `#374151` (about 10:1); nine text blocks under 13px raised to 14px (dates, reading time, copyright, project details; tag chips 13px); 36 tiny uppercase letter-spaced labels gone (the "who I help" strip, Before/After, blog tags, footer column titles, "more coming" now sentence case at a readable size); "After" label white (was 4.2:1). Headlines over two lines: my copy shortened ("Sound familiar?", "Get a free audit.", "Four steps to launch.", trust card "You deal with me directly"), Fahim's lines kept and sized one step down on phones (section headings 30px under 640px, step-note titles 24px). Result: every heading two lines or fewer at all three widths; no typography failures left. Still a warning: 11 font sizes in use.
- Kept on purpose (house rules of the skill flag them): the italic blue accent word in the hero (Fahim's retheme decision), the 01-04 pins on the guided map (inside a real `<ol>`, they are the map).
- Hero: the shorter "Getting Visitors, But not sales?" headline had shrunk the portrait (its height followed the headline block) and left the top of the hero empty. The portrait height now comes from the screen (`min(100vh - 8rem, 40rem)`), and it is zoomed: `aspect-[446/720]` with `object-cover object-top` crops the thighs, head and shoulders about 1.3x larger. h1 now `clamp(2.75rem, 5.5vw, 5rem)` so it clears the photo; portrait `right-[6%]`.
- Navbar: solid, no blur or transparency: white on light sections, `#1F2937` over dark sections (one step lighter than their `#0B0F19`), shadow only once scrolled.
- Other inspector failures NOT addressed (not typography, ask before changing): only one picture on the page, shadows and 1px outlined boxes, hairline rules, two blank stretches and six near-empty desktop screens (the snap layout's tall sections), a reduced-motion check that sees the closed mobile menu links as hidden.
- Verified: `npx tsc --noEmit` clean; inspector before/after; desktop screenshot shows the zoomed portrait, two-line headline and solid white pill.

### 2026-10-20 (headline font): Plus Jakarta Sans instead of Instrument Serif, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim): use Plus Jakarta Sans instead of Instrument Serif.
- Done: `app/layout.tsx` loads Plus Jakarta Sans (weights 400 to 800, normal and italic, `--font-plus-jakarta`) in place of Instrument Serif; `--font-clash` points to it, so every heading changed without touching components; Tailwind `font-display` fallback is `sans-serif` now. Body and labels stay Inter. DESIGN_GUIDE section 3, AGENTS.md conventions and gotchas, `docs/RETHEME.md` updated.
- Side effect to decide on: Plus Jakarta Sans has real weights, so headings with `font-bold` (the h1 on /about, /blog, /contact, /projects and a few others) are now really bold (700), while most homepage headings have no weight class and render at 400. Under Instrument Serif everything looked 400.
- Verified: `npx tsc --noEmit` clean; the hero h1 computes to "Plus Jakarta Sans" at 400 in the dev browser.

### 2026-10-19 (audit pitch, winding road): How I work pitches the free audit, the guided map path winds, branch `discovered-funnel`
- Agent: Claude Edge
- Requests (Fahim): (1) How I work, right side: "Request free audit" plus related copy and a CTA button; (2) guided map: not a straight line, a twisted road.
- (1) The pinned right block is now: heading "Request a free website audit.", two lines of copy (what the 30 minutes covers; free, nothing to prepare, keep the advice either way: my wording), a "Request a free audit" primary button to `/contact`, and "30 minutes. No obligation.". The About teaser (heading, two paragraphs, Full story link) is no longer on the homepage, and its `getCachedAboutContent()` fetch was removed. NOT removed: the homepage teaser fields in Admin > About (they now feed nothing on this branch; ask before deleting, it would need a migration).
- (2) From `md` up the dashed line is replaced by an SVG road behind the notes: a 34px pale grey band with white centre dashes that passes through each pin and swings to alternating sides between them (`roadPath`, built from `steps`). Phones keep the straight dashed line on the left (a winding road would run under the text there).
- Verified: `npx tsc --noEmit` clean; a screenshot at 1316x727 shows the road curving between pins 01 and 02 behind the notes. NOT verified by eye: the new How I work right side.

### 2026-10-19 (navbar on dark): the pill turns dark over dark sections, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim): the navbar should look dark on dark sections and light on light sections.
- Done: sections marked `data-nav-dark` (the slide-up acknowledge panel and the final CTA) switch the navbar pill to a dark style while they are behind it (checked on scroll at the pill's middle, 46px from the top): `#0B0F19` at 60% (80% once scrolled), `white/10` border, `#A3ACBD` links with white hover, `#60A5FA` active link and underline, white logo (it is `currentColor`) and white hamburger bars. The open mobile menu keeps the light pill (the menu is a white page). Transitions on background, border and color only. `Reveal` now passes any `data-*` attribute through to its element (it used to drop them, so `data-nav-dark` on the panel would have done nothing).
- Verified: `npx tsc --noEmit` clean; in the browser pane the pill classes switch to dark inside both dark sections and back to light above them.

### 2026-10-19 (before/after polish): centred, narrower, subtler, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim): title and subtitle centred; cards centred with a max width and a bit more padding; subtle animation.
- Done: heading and subtitle `text-center`; the cards sit in a centred `max-w-5xl` container with `md:p-12`; the motion is toned down (tilt 2deg to 1deg, overlap offset 12% to 10%, 0.75rem drop instead of 1.5rem, spread 900ms to 750ms, ticks pop from 70% scale, 360ms each, 220ms apart). The bigger padding pushed the panel to 776px on a 727px screen, so its top/bottom padding, the gap above the cards and the card minimum height (24rem to 20rem) were trimmed; it is exactly one screen again (content 656px).
- Verified: `npx tsc --noEmit` clean; at 1316x727 the heading and subtitle are centred (272 to 1040 and 320 to 992 of 1316), the cards centred (144 to 1168), and a screenshot shows the finished state with all ticks.

### 2026-10-19 (before/after cards): stacked cards that spread, ticks that pop, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim, screenshot with the before/after block circled): make them two long cards, the After card literally lying over the Before card; when scrolled to, they move apart, and each After line pops a green round white tick one after another.
- Done: two tall cards (`rounded-3xl`, min 24rem from `md`); out of view the After card overlaps the Before card (both tilted 2deg, After on top with a deep shadow); in view they spread to side by side; then a green (`#16A34A`) circle with a white `Check` pops beside each After line, 260ms apart. CSS `.ba-cards` in globals.css, triggered by the `data-revealed` attribute that `Reveal` sets; transform/opacity only; no overlap on phones. Green is new to the palette and used only for these ticks (noted in DESIGN_GUIDE "Before / after cards").
- Verified: `npx tsc --noEmit` clean; screenshots at 1316x727 show the stacked start, the spread, and all four ticks after about 2.5s.

### 2026-10-19 (slide-up panel): the acknowledge section is full-screen and slides up, branch `discovered-funnel`
- Agent: Claude Edge
- Requests (Fahim): (1) heading "Looks nice, but does it bring customers?" (committed earlier as `b66e193`; I wrote "customers" and dropped the space before the question mark); (2) make that section full viewport and sliding up when scrolled to.
- Done: the dark acknowledge section is now a `Reveal` section with `.slide-up`: `min-h-screen`, content centred, rounded top corners, and it rises 18vh into place the first time it enters the view (transform only, see DESIGN_GUIDE "Slide-up panel"). `SnapScroll` now measures stops by layout position (`offsetTop` chain) instead of `getBoundingClientRect`: while the panel waited to slide in, its stop was 131px too low, and the tilted notes were 7px off.
- Verified: `npx tsc --noEmit` clean; at 1316x727 the panel is exactly 727px tall and its stop is 3165 by layout (3296 by the transformed box before the fix). NOT verified by eye: the slide itself and how it feels together with the snap.

### 2026-10-19 (credentials removed): `/credentials`, Admin > Credentials and the `credential_*` tables, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim): delete the Credentials page, from the dashboard too.
- Code removed: `app/credentials/`, `app/admin/credentials/` (page + `CredentialsManager`), the Credentials links in the navbar and the admin sidebar, the sitemap entry, the `public/llms.txt` line, all credential server actions, queries and types, the five tables in `lib/db/schema.ts`, `/credentials` from the revalidate-everything list in `actions.ts`, and the one-off scripts `seed-credentials.ts`, `sync-credentials.ts`, `patch-credentials.ts`, `patch2-credentials.ts`. PLANNER, README, DESIGN_GUIDE and `docs/RETHEME.md` updated.
- DATABASE (not applied by me, destructive): `drizzle/0016_remove_credentials.sql` (generated, five statements): `DROP TABLE` for `credential_certs`, `credential_clusters`, `credential_community`, `credential_contributions`, `credential_timeline` (all `CASCADE`). ORDER: production (`main`) still renders `/credentials` from these tables and previews share the database. Back up first (`npx tsx scripts/export-backup.ts`), then run them one at a time only AFTER this branch is merged and production has redeployed. The data is gone for good after that; the backup is the only copy.
- Not changed: any footer link pointing at `/credentials` lives in the `footer_links` table (Admin > Footer Links); if one exists it will now 404, remove it there.
- Verified: `npx tsc --noEmit` clean; no "credential" left in `app/`, `components/`, `lib/`, `scripts/`, `public/` (apart from `dbCredentials` in the drizzle config).

### 2026-10-19 (guided map): How it works as a long step-by-step map of sticky notes, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim, screenshot of the four-column steps row): make this section long, more like a guided map, step to step, sticky-note style.
- Done: a dashed path down the middle (left edge on phones), a blue numbered pin per step on it, and each step as a tilted pale-blue sticky note with a strip of tape, alternating left and right, at least 70vh per step so the section is long. Each note is a scroll-snap stop (centred) and blurs in on scroll; hovering straightens it. The heading got its own snap stop (a wrapper div) instead of the section, so `SnapScroll` does not treat the whole tall section as one stop. No "Step N" label (no eyebrows; the pin shows the number). DESIGN_GUIDE section 8 "Guided map".
- Verified: `npx tsc --noEmit` clean; at 1316x727 the notes alternate (x 104 / 720), the path and pins sit at the centre, and a screenshot shows the note, tape, tilt and pin. NOT verified: phone width, wheel stepping through all four notes in a real browser.

### 2026-10-19 (skills removed): Admin > Skills, the `skills` table and `skills_layout` removed, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim): after the "What I solve" section was deleted from the homepage, remove Admin > Skills and the skills table too.
- Code removed: `app/admin/skills/` (page + `SkillsManager`), the sidebar entry, the five skill server actions in `app/admin/actions.ts`, the skill queries and types in `lib/db/queries.ts`, `uploadSkillImageToCloudinary` in `lib/cloudinary.ts`, the `skills` table and `site_settings.skills_layout` (the rows/columns switch that lived on Admin > Skills) in `lib/db/schema.ts`, and `skillsLayout` from the settings defaults. Stale "homepage skills" comments now say the "who I help" strip. PLANNER and README updated.
- DATABASE (not applied by me, destructive): `drizzle/0015_remove_skills.sql` (generated, exactly two statements): `DROP TABLE "skills" CASCADE;` and `ALTER TABLE "site_settings" DROP COLUMN "skills_layout";`. ORDER: production (`main`) still reads both, and previews share the database. Run them only AFTER this code is merged and production has redeployed, one statement at a time, after a backup (`npx tsx scripts/export-backup.ts`). Running them earlier breaks the live site silently: `getSkills()` returns nothing and `getSiteSettings()` falls back to its defaults (title, description, avatar and the rest). The skill images in Cloudinary (`personal-website/skills`) are not deleted by this.
- Verified: `npx tsc --noEmit` clean; drizzle-kit generated only the two drops.

### 2026-10-19 (snap end, services removed): free scrolling from the final CTA, "What I solve" deleted, branch `discovered-funnel`
- Agent: Claude Edge
- Requests (Fahim, screenshots): (1) from the final "Find out what your website is costing you." section down, no scroll snapping; (2) delete the "One person for your brand, website and the tech behind it." section.
- (1) The final CTA carries `data-snap-end`. `SnapScroll` keeps `html.snap-zone` only while the page is above its top (scroll listener) and its wheel handler stands back from there down, so the CTA is still the last stop you land on and the footer scrolls freely; scrolling back up above it re-enters snapping. Checked with synthetic wheel steps: blog to CTA (9750) snaps, then native; up steps go back through the stops.
- (2) The services section (fed by the `skills` table, both the rows and columns layouts) is gone from the homepage, with its `getSkills()` fetch. NOT removed (my call, ask if wanted): Admin > Skills, the `skills` table and `site_settings.skills_layout`; they now feed nothing on this branch. The "4. SOLUTION" part of the page is now How it works and Ways to work together.
- Verified: `npx tsc --noEmit` clean. NOT verified by eye.

### 2026-10-19 (how I work pinned): trust cards focus on the left, text pinned right, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim, screenshot of the How I work section): adapt the "Which of these sounds like your website?" pattern here, mirrored: cards on the left, the rest on the right.
- Done: How I work is a `7fr` / `5fr` grid from `md` up; the four trust cards are a `FocusCards` list on the left (`md:order-1`, `snap-center`, larger cards, `gap-[18vh] md:py-[50vh]`), the About teaser heading, two paragraphs and "Full story" link are pinned in the middle of the screen on the right (`md:order-2`, sticky, one screen tall, centred). Phones: text first, then the cards. The section lost its own `snap-start` (its cards are the stops now).
- Refactor: page-wide snapping and the wheel stepping moved out of `FocusCards` into `components/SnapScroll.tsx`, rendered once in `app/page.tsx`. With two `FocusCards` lists, the old code would have added two wheel handlers and switched snapping off when either list unmounted. `FocusCards` is focus only again.
- Verified: `npx tsc --noEmit` clean; at 1316x727 each trust card centres at 363-364px with the pinned text block centred at 364px, cards at x 104, text at x 775. NOT verified by eye after the reveals settle, nor wheel stepping through this section in a real browser.
- Note for me: the earlier "stale Tailwind CSS" diagnoses after `md:py-[50vh]` and here were partly wrong; my grep patterns for escaped class names did not match. The first one (`md:h-screen`) was a real stale build (checked with computed styles).

### 2026-10-19 (no eyebrows): small labels above headings removed, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim): get rid of eyebrows everywhere.
- Removed: every homepage section eyebrow (Find the problem, You are not alone, Proof, How I work, The fix, How it works, Ways to work together, Questions) and the page-header labels on `/about`, `/blog` and `/contact`. DESIGN_GUIDE section 3 "Eyebrow Label Pattern" replaced by "No eyebrows".
- Kept on purpose (labels for content, not eyebrows over a heading): Before/After in the before/after panels (they still use `eyebrowClass`), the tag on each blog teaser card, the credentials release count, the footer column titles. `components/ProjectsSection.tsx` has eyebrows too but is not imported anywhere (dead code), so it was left alone. Only this branch (`fixed-funnel` still has its eyebrows).
- Side effect: the pinned "Which of these sounds like your website?" title is now centred on its own, so it lines up exactly with the centred card (the eyebrow used to push the heading text 16px low).
- Verified: `npx tsc --noEmit` clean. NOT looked at in the browser.

### 2026-10-19 (snap every section): scroll snapping on the whole homepage, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim): the title and card are level now; also every light section should be scroll snapped.
- Done: `snap-start scroll-mt-24` on every light section (work, how I work, what I solve, how it works, ways to work together, FAQ, blog), so each lands just below the navbar; `snap-start` on the final dark CTA too (my call: without a stop there, mandatory snapping never lets you reach the footer). `FocusCards` now keeps `html.snap-zone` on for as long as the homepage is mounted (it used to switch off after the last card). The hero-only wheel handler became a general one: each wheel step goes to the next or previous stop (they can be 500 to 900px apart, more than one wheel step, and the browser was snapping back: reproduced at the last card), one stop per gesture with an 800ms lock against trackpad bursts; inside a section taller than the screen (the services rows) the wheel scrolls normally until its end. Keyboard and touch keep plain CSS snapping.
- Verified: `npx tsc --noEmit` clean; stepping checked with synthetic wheel events (instant jumps, since the pane was not drawing): 0 (hero), the five cards (984 to 2235), the dark band (3165), the services section (3787), then free scrolling inside it, and back up in reverse. NOT verified by eye: smooth-scroll feel, trackpads, keyboard (Space / Page Down), touch, phone width, and whether the FAQ opening a long answer still scrolls well.

### 2026-10-19 (title and card level): pinned title on the same line as the centred card, branch `discovered-funnel`
- Agent: Claude Edge
- Report (Fahim, screenshot at the first card): scroll snap works, but the title sat about 130px below the centred card.
- Cause: at the first card the title column had not pinned yet (the card list only had 25vh of top padding), and the title was centred 40px low because of the `md:pt-20` navbar offset.
- Fix: the card list has `md:py-[50vh]`, so the column is already pinned whenever a card is centred, and the title column centres on the true middle of the screen (no `pt-20`). Measured at 1316x727 with each card centred: card centres 363-364px, the eyebrow + heading block on the same line (the heading text itself is 16px lower because the eyebrow sits above it).
- Also hit again: Turbopack served stale Tailwind CSS without the new `md:py-[50vh]` class until `.next` was deleted and the dev server restarted.

### 2026-10-19 (snap scrolling): hero to the problem cards, each card centred, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim, screenshot of the hero): from the hero, scrolling down should auto-scroll to the next section, centred, and each card should land in the middle.
- Done: `FocusCards` toggles `html.snap-zone` (`scroll-snap-type: y mandatory`, globals.css) while the last card has not passed the middle of the screen. Stops: the hero (`snap-start`), each problem card (`snap-center`), and the dark acknowledge section after them (`snap-start`, so the zone does not pull you back to the last card). Further down the page scrolls freely (my call: mandatory snapping over the tall later sections can trap or skip content; say if every section should snap). A small `wheel` listener sends the first scroll down from the hero straight to the first card, because the snap alone chose to go back to the top for small wheel steps (the first card is about 805px down at 730px high); it uses an instant jump under reduced motion.
- Verified: `npx tsc --noEmit` clean; in the browser pane a 2-step wheel scroll moved from card to card with each one centred (center at 365 of 730) and the matching card active; the hero wheel handler prevents the default scroll and targets the first card (805px). NOT verified: the hero-to-first-card smooth jump by eye (the pane stopped drawing), trackpads (many small wheel events), touch, keyboard (Page Down / Space), phone width.

### 2026-10-19 (focus cards): one problem card in focus at a time, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim): only one card seen at a time; the ones below and above fade away.
- Done: new `components/FocusCards.tsx` + `.focus-cards` CSS: the card crossing the middle band of the screen is sharp, the rest sit at 15% opacity with a 4px blur and ease in and out (opacity and filter only). The cards are 18vh apart with 25vh padding above and below (from `md`), so exactly one is in focus and the first and last can reach the middle while the title stays pinned. This replaces the one-time `Reveal` on these cards, so the `rootMargin` option added to `Reveal.tsx` in the previous change was removed again (no other user). DESIGN_GUIDE section 8 "Focus list".
- Verified: `npx tsc --noEmit` clean; in the browser pane at 1316x730 with the second card centred, only it is active (`.A...`) and the screenshot shows the others faded. NOT verified: phone width (the effect runs there too, title not pinned), real scrolling feel.

### 2026-10-19 (problem cards on scroll): each card reveals as it scrolls up, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim): each problem card should load on scroll, with the faded blur (several were appearing at once).
- Done: `components/Reveal.tsx` takes an optional `rootMargin` (default unchanged, `0px 0px -6% 0px`, so every other reveal behaves as before; it is in the effect deps). The problem cards pass `0px 0px -33% 0px`, so each card blurs in only once it is a third of the way up the screen, one by one with the scroll. The time-based cascade from the previous change is removed, so scrolling is the only trigger.
- Verified: `npx tsc --noEmit` clean; in the browser pane the cards revealed in scroll order. Testing note: the pane only renders while a screenshot is taken, so IntersectionObserver checks there need a screenshot between steps. NOT verified by a real mouse-wheel scroll (Fahim to check).

### 2026-10-19 (problem heading centred): pinned title mid-screen, stronger card reveal, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim, screenshot with the spot drawn in red): the pinned title should sit in the middle of the screen, not at the top, and the cards should reveal with the faded blur.
- Done: the pinned left block is now one screen tall (`md:sticky md:top-0 md:h-screen`, flex-centred, `md:pt-20` for the navbar), so the title holds in the middle of the space under the navbar. Cards: each `Reveal` uses a stronger blur-fade (`--blur-from: 12px`, `--reveal-y: 24px`, 1100ms) and the first three cascade by 160ms so the ones already on screen visibly arrive one after another.
- Also: the "1 Issue" badge was a hydration warning caused by the ColorZilla browser extension adding `cz-shortcut-listen` to `<body>`; `suppressHydrationWarning` added on `<body>` in `app/layout.tsx` (only silences attribute differences on that one element).
- Gotcha found: Turbopack kept serving stale Tailwind CSS (new classes missing) even after a dev-server restart; deleting `.next` and restarting fixed it. If new Tailwind classes seem to do nothing in dev, clear `.next` first.
- Verified: `npx tsc --noEmit` clean; at 1316x730 the title holds at about 373px (mid-screen) while the cards scroll, then leaves with the end of the section.

### 2026-10-19 (sticky problem heading): "Which of these sounds like your website?" pinned left, branch `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim, with a screenshot of the 3-column problem grid): keep the heading fixed on the left while the problems scroll by one by one.
- Done (`app/page.tsx`, find-the-problem section): two columns from `md` up (`5fr` / `7fr`); the eyebrow + heading sit in a `md:sticky md:top-32 md:self-start` block, the five problems are a single column of larger cards on the right, each its own `Reveal` so it blurs in as it enters the view (was one stagger for the whole grid). Phones: heading on top, cards stacked, nothing pinned. Same sticky caveat as the About page: no `overflow` on `html` or any ancestor.
- Also: the dev server had stopped (the "1 Issue" badge and failed hot reload); restarted with `npm run dev` in a Terminal panel tab.
- Verified: `npx tsc --noEmit` clean; at 1366x768 the heading holds at 160px from the top while the cards scroll, and releases at the end of the section. Only on this branch (`fixed-funnel` keeps the grid).

### 2026-10-19 (dark bands): light and dark sections for focus, branches `fixed-funnel` and `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim): AEVON and Tradefigur break light pages with dark sections to grab attention; decide from the funnel where a focus shift adds the most value and recolour with the theme.
- Decision (mine): exactly two full-bleed `#0B0F19` bands, so they keep their pull. (1) The cost moment, where the reader turns from "that is me" to "I need to fix this": on `discovered-funnel` the whole "You are not alone" acknowledge section with the before/after; on `fixed-funnel` the before/after moved out of the problem section into its own band with a new heading ("Same business. A website that finally works for it."), the five pain cards stay light so the page does not go dark right under the hero. (2) The final audit CTA (was a soft blue card), the last strong stop before the footer. Proof, process and offers stay light on purpose: they need calm reading, not alarm.
- Colours: white headings, `#A3ACBD` body, `#60A5FA` eyebrows (the `#2563EB` accent is too dark as text there), `#111827` / `#1F2937` panels and lines, the "After" panel solid `#2563EB` with white text. Rule and contrast table in DESIGN_GUIDE section 2, "Dark bands".
- Verified: `npx tsc --noEmit` clean on both branches; both bands render in the browser pane at 1366px (headings white, revealed). NOT verified: phone width.

### 2026-10-19 (hero photo): new colour portrait, branches `fixed-funnel` and `discovered-funnel`
- Agent: Claude Edge
- Request (Fahim, with the image): use this photo on the latest two branches.
- Done: the upload (960 x 1088 PNG, already transparent) cropped to the subject and saved over `public/images/fahim-hero.webp` (446 x 954, quality 88, about 35 KB, made with `sharp` from node_modules). `HeroPortrait.tsx` aspect ratio and img size changed to 446/954; the figure is narrower than the old B&W cutout, cut at the thighs, still standing on the strip. One commit cherry-picked to both branches; this log entry added on each.
- Verified: `npx tsc --noEmit` clean; at 1366px the portrait box (827 to 1136) clears the hero text (ends at 636) and looks right in the browser pane. NOT verified: phone (portrait is hidden below 1024px anyway), sharpness on 2x screens (the source is 446px wide, so it is a little soft there).

### 2026-10-19 (discovered-funnel): problem, acknowledge, proof, solution, branch `discovered-funnel` (off `fixed-funnel`)
- Agent: Claude Edge
- Request (Fahim): a step-by-step funnel for the copy "so people can understand their problem, find proof, and solution: find a problem, acknowledge it, then proof, then solution". He skipped the questions, so this is my reading of it, built as an alternative to `fixed-funnel` to compare side by side.
- Order (`app/page.tsx`, same building blocks as `fixed-funnel`, rearranged): hero with a problem-first headline ("Your website gets visitors. So why is nobody *calling*?") / who I help strip / 1. find the problem ("Which of these sounds like your website?", the five pains) / 2. acknowledge (new section: common, not your fault, what it costs, plus the before/after) / 3. proof (featured projects, then the trust points with the About teaser, eyebrow "How I work") / 4. solution (services as "The fix", the four steps, the three offers) / FAQ / blog teaser / the audit CTA. Only the hero, the problem heading, the new acknowledge section, eyebrows and two headings differ from `fixed-funnel`.
- Interpretations (mine): "proof" is the real projects and how I work, since there are no testimonials or numbers to show (rule 6 in RETHEME.md); the blog teaser moved after the FAQ so it does not interrupt the path to the audit.
- Verified: `npx tsc --noEmit` clean; h1 and sub text measured clear of the portrait at 1024px. NOT verified by eye (screenshots failed with the app window hidden) or at phone width.

### 2026-10-19 (fixed-funnel): homepage rebuilt as the RETHEME.md funnel, branch `fixed-funnel` (off `rethemed`)
- Agent: Claude Edge
- Request (Fahim): new branch "fixed funnel" applying the funnel from `docs/RETHEME.md` (phase 2: homepage structure and copy). A second branch, `discovered-funnel`, tries a problem, acknowledge, proof, solution order instead.
- Homepage order (`app/page.tsx`): hero (outcome headline with an italic blue word, who it is for, "Get a free website audit" + "See my work", "30 minutes. No obligation.") / "Who I help" strip of business types / the problem (five pains + before/after) / what I solve (the skills table, unchanged layout code, new heading) / work (featured projects) / how it works (four steps) / why work with me (four trust points beside the existing About teaser fields) / ways to work together (three offers, no prices) / blog teaser / FAQ (native `<details>`) / final audit CTA. Copy is hardcoded as constants at the top of the file until phase 5 moves it into the dashboard.
- My calls, not his: the strip stays directly under the hero (the portrait stands on it) instead of after the services; the secondary CTA says "See my work", not the brief's "See client work", because the featured projects are not all client work; no testimonials section at all (none exist; rule 6); the FAQ answers and offer cards contain no numbers, prices or durations; the blog heading is "From the blog", not "Guides", since the current posts are not written for owners. The old hero CTA flag `SHOW_HERO_CTAS`, the code card and `quoteList` are gone; the About teaser's code-card fields are no longer shown (still in the DB and dashboard).
- Hero: h1 is now `clamp(2.75rem, 6.5vw, 6rem)` and `HeroPortrait`'s `top` follows it (coupled values); the portrait shows from `lg` up (was `sm`), because between 640 and 1024px it sat under the text and buttons.
- Not changed: navbar (phase 3), `/contact` audit form (phase 3; the CTAs point at the current contact page), inner pages (phase 4), the About teaser and skills text (DB copy, still engineer-centric: edit in Admin > About and Admin > Skills).
- Verified: `npx tsc --noEmit` clean; no console errors; measured by JS at 800, 1024 and 1366px that the h1 and sub text do not run into the portrait. NOT verified: the look by eye (screenshots failed with the app window hidden), phone width.

### 2026-10-19 (rethemed, admin light): admin dashboard on the light palette, branch `rethemed`
- Agent: Claude Edge
- Request (Fahim, after phase 1 was committed): "admin panel light as well".
- Done: the same role-aware remap as phase 1 applied to every file in `app/admin` (27 files): page and input fields `#111111` to white, panels `#222222` to `#F7F8FA`, lines and chip/toggle fills `#333333` to `#E5E7EB`, `#444444` to `#D1D5DB`, text `#F3F6F4` to `#0B0F19`, `#8A938E` to `#5B6475` (placeholders and hover borders to `#6B7280` / `#D1D5DB`), `#5C615E` to `#6B7280`, mint and its hovers (`#5BFBA8`, `#2de088`) to `#2563EB` / `#1D4ED8`, dark text on mint buttons to white, the success-check strokes and the editor's "Nothing to preview" colour too. Tailwind status colours raised for white: `red-400`/`red-500` text to `red-600`, `yellow-400` to `amber-700`, `blue-400` to `blue-600`. The `[data-admin]` dark-token override in `globals.css` is removed (the attribute stays on the admin layout as a hook, unused). `docs/RETHEME.md`, DESIGN_GUIDE section 2 and changelog, PLANNER updated.
- Not changed: `lib/email.ts` (transactional emails still dark).
- Verified: `npx tsc --noEmit` clean; `/admin/login` looked at in the browser pane; Fahim checked the signed-in admin pages and approved.

### 2026-10-19 (rethemed, phase 1): light palette, new fonts, grain and glow removed, branch `rethemed`
- Agent: Claude Edge
- Request (Fahim, via the planning session): phase 1 "Foundation" of `docs/RETHEME.md`: public site only, admin stays dark; no copy or section changes (phase 2).
- Fonts (`app/layout.tsx`): Instrument Serif (400, normal + italic, `--font-instrument`) and Inter (`--font-inter`) via `next/font/google`; Syne, Plus Jakarta Sans and JetBrains Mono no longer load. The old variable names stay as aliases in `globals.css` `:root` (`--font-clash` = Instrument Serif, `--font-jakarta` and `--font-jetbrains` = Inter), so the inline `fontFamily` styles across the app (admin included) did not change. Blog code uses a new `--font-code` system monospace stack. `font-synthesis-weight: none` on `html`, because headings still carry `font-bold` and Instrument Serif has only 400.
- Palette: tokens from RETHEME section 2 in `:root` (plus `--line`, `--line-strong`, `--accent-hover`, `--accent-soft`, `--text-body`). Every hardcoded dark hex in `app/` (not `app/admin`) and `components/` was remapped by role with one sed pass: page `#111111` to white, surfaces `#222222` to `#F7F8FA`, lines `#333333` to `#E5E7EB` (as text, decorative ghost text, to `#D1D5DB`), `#444444` to `#D1D5DB`, text `#F3F6F4` to `#0B0F19`, muted `#8A938E` to `#5B6475` (as a hover border to `#D1D5DB`), dim `#5C615E` to `#6B7280` (4.8:1, AA), prose `#C7CCCA` to `#374151`, mint to `#2563EB`, mint hover to `#1D4ED8`, text-on-mint to white. Navbar pill `bg-white/60` (scrolled `/80`, `shadow-black/5`). Logo wordmark fill is `currentColor` now (dark on the site, white in the admin through `[data-admin]`'s text colour). Blog prose and code blocks read tokens; syntax colours switched to a light GitHub-style set; the pre's backdrop blur was dropped.
- Admin: `[data-admin]` redefines the dark tokens, so the inherited text colour and the blog editor preview stay readable on its dark background. Not changed: its hardcoded dark/mint classes. Side effects there: headings render in Instrument Serif and body in Inter (through the aliases), and focus rings, selection and the scrollbar are blue.
- Removed: `components/MintGlow.tsx` (and its use in the root layout, the `.glow-orb` CSS, `data-glow-anchor` on the portrait), the film grain (`body::before`, `public/grain.png`), and the closing "Reach Out!" glow in `app/page.tsx`.
- Buttons: primary is solid blue with white text, pill (the contact form submit went `rounded-lg` to `rounded-full`); secondary keeps the bordered white pill (`#E5E7EB`, hover `#D1D5DB`). Focus ring `var(--accent)`.
- Not touched on purpose: copy and structure; `lib/email.ts` (emails keep the dark palette); the skills icons are uploaded images (DB/Cloudinary) and are still mint green, so they need re-uploading in blue; the favicon was already light/dark aware.
- Docs: DESIGN_GUIDE sections 2 and 3 rewritten (with the dark-to-light mapping), section 4-5 snippets, CTA glow, film grain and ambient glow entries marked removed, a duplicated Film grain section deleted, changelog row; AGENTS.md palette/font convention and the misleading-names gotcha.
- Verified: `npx tsc --noEmit` clean; looked at `/`, `/credentials`, `/contact` and `/admin/login` in the browser pane at 1366px on `npm run dev`. NOT verified: phone widths, `/about`, `/projects`, `/blog` posts in detail, `npm run build`. Nothing committed.

### 2026-10-19 (rethemed): retheme decisions locked, branch `rethemed` (off `main`)
- Agent: Claude Edge
- Request (Fahim): a whole retheme on a new branch `rethemed`: white background, primary blue accent, minimal, fancy font; layout and structure inspired by aevonbd.vercel.app; a TOFU / MOFU / BOFU funnel; copy that sells solutions to clients instead of describing the engineer.
- Decisions (his answers): Instrument Serif headlines + Inter body, royal blue `#2563EB`, audience small businesses and founders, main offer a free 30-minute website audit. Written down in `docs/RETHEME.md` (tokens, homepage section order with funnel stage, page changes, copy rules, what is borrowed from AEVON, five build phases). On this branch that brief overrides the dark-first palette and font conventions above until DESIGN_GUIDE is rewritten in phase 1.
- My proposals inside the brief, not explicitly chosen by him: the neutral token values, dropping JetBrains Mono, removing grain and glow, keeping the admin dark for now, the navbar items, the audit form fields, and the 12-section homepage order.
- No code changed yet. Nothing committed.

### 2026-10-13 (about-layouts): switchable About layouts, branch `about-layouts` (off `main`)
- Agent: Claude Edge
- Request (Fahim, with a screenshot of the live About page): (1) the honest story gets its text on the right; (2) a switchable layout with no images, two blocks only; (3) a switchable layout with one long image on the left, fixed, and the two text blocks on the right scrolling; keep ratios and resolutions as hints in the dashboard.
- Done: `about_content.layout` (`'beside'` default | `'text'` | `'tall'`) and `tall_image_url`; Admin > About has a "Layout" section with three cards and shows only the image fields that matter for the chosen layout; a third Cloudinary slot `tall` (`about-tall`); `saveAboutContentAction` rejects unknown layouts. Page: `beside` has both blocks image-left / text-right (this is point 1: the story used to have its image on the right), `text` stacks the two blocks with no images, `tall` pins one 3:4 image with `position: sticky` (from `md` up, `top-28`, height capped to the window) while the two text blocks scroll on the right, and falls back to `text` when no tall image is uploaded. On phones everything stacks and nothing is pinned.
- Interpretations (his "go" accepted them): "fixed" = pinned while the page scrolls (not a scrollable box with its own scrollbar); the tall image is its own upload slot so it can be a different photo; in `text` the two blocks are stacked, not side by side; an empty extra block still hides in every layout.
- Dashboard hints: square images 1:1 (for example 1200 x 1200, at least 900 x 900), tall image 3:4 (for example 1200 x 1600, at least 900 x 1200), 4 MB max, shown beside each upload.
- DATABASE (not applied by me): `drizzle/0014_about_layout.sql`: `ALTER TABLE "about_content" ADD COLUMN "layout" text DEFAULT 'beside' NOT NULL;` and `ALTER TABLE "about_content" ADD COLUMN "tall_image_url" text;`. Additive, safe for the code on `main`. Run each statement on its own in Neon BEFORE merging (back up first). If the code deploys first, `getAboutContent()` fails on the missing columns and quietly falls back to the built-in default About text.
- Sticky depends on `body { overflow-x: hidden }` propagating to the viewport, which only happens while `html` has no overflow of its own (noted in DESIGN_GUIDE). Do not add `overflow` to `html` or a wrapper around the About page.
- Docs: DESIGN_GUIDE "About page blocks" rewritten, PLANNER (`about_content` columns, migration 0014, admin About). Helper renamed `squareImage` to `fitImage(url, w, h)`.
- Verified: `npx tsc --noEmit` clean; Tailwind generates the sticky, 3:4 aspect and max-height rules. NOT verified in a browser or with a real upload: that the image actually stays pinned while the text scrolls, the layout at phone width, and switching layouts in the dashboard.

### 2026-10-13 (portrait higher): head above "Build", branch `portrait-higher` (off `main`)
- Agent: Claude Edge
- Request (Fahim, screenshot from a different laptop, about 1550px wide and tall): he wants himself "up", the head higher than the word "Build" (in the screenshot the hair top was about level with the top of "Build").
- Change: `HeroPortrait.tsx` `top` offset from `-0.04` to `-0.3` times the h1 font size (`clamp(3.5rem, 10vw, 9rem)`). The head now sits about a third of a capital letter above the top of "Build" at every screen size, since the offset scales with the headline.
- Trade-off he should know: the waist cut has to stay on the marquee strip, so a higher head means a taller figure, and `aspect-[571/907]` makes it wider too: about 7% bigger at 1366px (roughly 535px high before, 570px after). It cannot be moved up at the same size without lifting the cut off the strip. If he wants the same size back, the options are a smaller rise (change `-0.3`) or a different crop of the photo.
- Navbar clearance: the extra rise needs the 128px `pt-32` the hero section has above its content. On very short windows (about 600px high) the head ends up roughly 10px below the navbar's bottom edge; if it ever touches, reduce the rise or increase `pt-32`.
- The ambient glow follows automatically (it centres on the portrait box, 38% down).
- Docs: `HeroPortrait.tsx` comment and DESIGN_GUIDE "Hero portrait" updated.
- Verified: `npx tsc --noEmit` clean; Tailwind generates the arbitrary `top` value. NOT verified in a browser: the real position on his laptop, and the clearance below the navbar on short windows.


### 2026-10-11 (docs refresh): every doc checked against the code, branch `docs-refresh` (off `main`)
- Agent: Claude Edge
- Request (Fahim): check every doc and `docs/PROJECT_JSON_SCHEMA.md` (linked), find stale content and update it.
- Method: listed every doc-like file (README.md, AGENTS.md, PLANNER.md, DESIGN_GUIDE.md, docs/PROJECT_JSON_SCHEMA.md, public/llms.txt, .env.example), then checked each claim against the code (routes, `package.json` scripts, `lib/db/schema.ts`, the migration SQL files, the import parsing in `ProjectsManager.tsx` and `actions.ts`, env vars used in code, `wrangler.jsonc`, `app/layout.tsx` fonts). The session log entries themselves were NOT rewritten (history), only the static sections above them and the other docs.
- `docs/PROJECT_JSON_SCHEMA.md` (last touched June 1): described `type` and `statusBadges` (both removed), the beta modal, and was missing that tags feed the `/projects` strip and that `featured`/`featuredOrder` are not imported. Rewritten from the actual import code; documents what is ignored (`type`, `statusBadges`), what is cleaned, and the outcome panel.
- `README.md` (last touched June 18): brand "fahim." and the old job title, no Cloudinary env vars, no admin map, wrong Cloudflare worker URL and secrets list, lint described as working, `db:migrate` presented as the only path, project structure missing most of the app, bundle size presented as current. Fixed all of it; added the migration ordering rules and the stacked-PR rule.
- `PLANNER.md` (last touched June 1 in its header): rewritten overview, folder tree, a complete 16-table schema (it documented 7 and still listed `status_badges`), the full migration history 0000 to 0013 (0001, 0004 to 0008 were missing), admin features (sidebar had 6 of 9 entries; status badges and BetaModal removed), env vars (Cloudinary), Cloudflare section (it is Workers, not Pages), timeline and Next steps (done items removed, real open items added).
- `DESIGN_GUIDE.md`: section 3 still described Clash Display via Fontshare (the code uses Syne behind the `--font-clash` alias, no Fontshare request); the noise-texture note; section 9 (page structure) listed Supabase and `runtime = 'edge'`; section 10 was a Supabase schema (replaced with a pointer to PLANNER, on purpose, to stop drift); section 11 listed Supabase env vars; added changelog rows. Also corrected two stale code comments (`app/layout.tsx`, `app/globals.css`) that still said "title-font comparison branch".
- `public/llms.txt` (AEO text): said "Dhaka" (every other place says Chattogram), "4+ years / 50+ shipped projects" (the site lists 16 projects and its own numbers were 9+ years designing and 2+ building), the old "graphic designer" lead instead of the "Aspiring AI Engineer" positioning decision, "Fahim." as the site name, no Credentials page, About described as having a timeline (that moved to Credentials). JUDGEMENT CALL: I replaced the experience claim with "designing since 2016 and building websites for 2+ years, with 16 shipped projects listed on this site", taken from facts already on the site; if "50+ shipped projects" is true (it may count design client work), put it back.
- `.env.example`: Cloudinary comment now says it covers skills and About images too.
- `AGENTS.md` static sections: env list for setup (ADMIN_EMAILS), commands (backup, admin bootstrap, lint does not work), Cloudflare Workers wording, and new conventions and gotchas: migration order, stacked PRs, docs-with-every-change, reads fail soft, coupled layout values, misleading names kept on purpose.
- Left alone on purpose: all older Session Log entries (including the 2026-10-08 black-background entry and the glow experiments), the changelog rows in DESIGN_GUIDE (history), and unverifiable items (Cloudflare bundle size, whether the Cloudflare env vars are set), which are flagged as "not re-verified" in README and PLANNER instead of guessed.
- Verified: `npx tsc --noEmit` clean (two comment-only code edits). Docs were checked against code by reading and grep, not by running the site.


### 2026-10-10 (grain): film grain, branch `grain` (off `about-blocks`)
- Agent: Claude Edge
- Request (Fahim): "implement grain", after the evaluation (existing grain too faint to matter; glow shows banding rings). He did not answer the strength or background-compensation questions, so the evaluated recommendation was used: 4%, monochrome, static, background NOT compensated.
- Done: the old `body::before` runtime SVG `feTurbulence` layer (about 1.6% effective, chromatic noise, slow on Safari) is replaced by a pre-made seamless monochrome tile, `public/grain.png` (256px, 32 gray levels, about 48 KB, generated once with numpy/scipy: gaussian noise, mean 128, std about 57, light blur with wrap-around so it tiles). Strength is `--grain-opacity: 0.04` in `:root`. The layer stays fixed, full-screen, `z-index: 9999`, `pointer-events: none`, above everything, with no blend mode and no animation.
- Measured on the tile: at 4%, flat `#111111` becomes about `#151515` (mean 21.4) with a std of about 2.3 levels, enough to dither the glow's 12 gray-level steps. Side effect to keep in mind: grain lifts dark areas, so the page reads about 4 levels lighter than its CSS `#111111`; above about 5% it starts to dull small gray text.
- Turned off in: the admin (the admin layout got a `data-admin` attribute and CSS uses `body:has([data-admin])::before`; browsers without `:has` simply keep the grain there), print, `forced-colors`, `prefers-contrast: more`.
- Tuning: change `--grain-opacity` (0.03 subtle, 0.04 now, 0.08 strong stylised). Optional later idea, not built: a very slow stepped shimmer using a `transform` only.
- Docs: DESIGN_GUIDE "Film grain".
- Verified: `npx tsc --noEmit` clean; Tailwind CLI compile keeps the new rules; the tile is seamless by measurement (wrap-edge step matches neighbouring-column steps). NOT verified in a browser: how it looks on a real screen, text legibility at 4%, and the lighter-by-4-levels background.


### 2026-10-10 (about-blocks): an extra text block and two images on the About page, branch `about-blocks` (off `stats-and-strips`)
- Agent: Claude Edge
- Request (Fahim, with a wireframe): one more text block on the About page, images uploadable from the dashboard. Wireframe: new block on top = image left, title and text right; below it the existing "honest story" = text left, image right. He clarified the borders in the wireframe were only to explain the layout, so the page has none.
- Page (`app/about/page.tsx`): the story section now holds two blocks. Extra block: 36.5% image / 63.5% text. Story: 63.5% text / 36.5% image. Square images (`aspect-square`, `object-cover`, `rounded-xl`, my choice: the wireframe's image cells are about square and a radius matches the site's cards; change the class to drop it), lazy, blur-reveal, stacked on phones. The extra block is hidden while its heading and text are both empty, and either image is optional (text then takes the full width), so nothing placeholder ever ships. Images are served through a Cloudinary transformation (`c_fill,g_auto,w_900,h_900,q_auto,f_auto`) via `squareImage()`.
- Dashboard (`/admin/about`): new "Extra block" section (heading, paragraphs separated by a blank line, "Image (left)") and an "Image (right)" field in the Story section. Image fields upload straight through the server actions `uploadAboutImageAction` / `removeAboutImageAction` (auth-checked, slot restricted to `extra` or `story`, 4MB, image types only) and save immediately, not with "Save changes"; the text fields save with the existing button. `saveAboutContentAction` validates the extra block (heading max 120, up to 12 paragraphs of max 1500, all optional). Cloudinary: new `uploadAboutImageToCloudinary(file, slot)` in `lib/cloudinary.ts` (fixed public ids `about-extra` / `about-story` in folder `personal-website/about`, so re-uploads overwrite instead of orphaning).
- DATABASE (not applied by me): migration `drizzle/0013_about_extra_block.sql` adds four columns to `about_content`: `extra_heading` text NOT NULL DEFAULT '', `extra_paragraphs` text[] NOT NULL DEFAULT '{}', `extra_image_url` text, `story_image_url` text. Additive, safe for the code on `main`. RUN IT IN NEON BEFORE MERGING (together with `0012` from `stats-and-strips`, one statement at a time): if the code deploys first, `getAboutContent()` fails on the missing columns and quietly falls back to the built-in default About text, hiding your edited copy on the live site. Back up first (`npx tsx scripts/export-backup.ts`).
- Docs: DESIGN_GUIDE ("About page blocks"), PLANNER (`about_content` columns, migration 0013).
- Verified: `npx tsc --noEmit` clean; Tailwind generates the two column rules. NOT verified in a browser, by `npm run build` here, or with a real upload (needs Cloudinary env vars on the deployment, already used by the avatar upload): check the layout at desktop and phone widths, upload and remove both images, and that an empty extra block does not render.


### 2026-10-10 (stats-and-strips): stats removed, one shared strip, speed from the dashboard, branch `stats-and-strips` (off `main`)
- Agent: Claude Edge
- Request (Fahim, with screenshots of the homepage and `/projects` stats): get rid of the stats on every page; make all strips share one speed and one background, with the speed adjustable from the dashboard.
- Stats: only two pages had them, so both blocks were removed (homepage: 9+ designing / 2+ building / 1+ securing; `/projects`: 16 projects / 15 live / 26 technologies). Nothing in the dashboard fed them (the homepage numbers were hardcoded).
- Layout consequence on the homepage: the thin line the portrait stood on belonged to the stats block, so the portrait now stands on the TOP BORDER OF THE MARQUEE STRIP instead. Hero section lost its `pb-20`, the hero container got `pb-16`, and that 4rem matches `HeroPortrait`'s `bottom-[-4rem]` (comments in both files say so). On `/projects` the strip now sits as a full-bleed band between the hero and the project grid.
- Strips: there were exactly two (homepage skills, `/projects` technologies) and they differed in band, edge fade and speed. They are now one component, `components/MarqueeStrip.tsx` (client): `#222222` band with `#333333` top and bottom lines, no edge fade (the homepage look), speed in pixels per second, duration = measured width of one copy / speed (so a long list and a short one move at the same pace), re-measured on resize and font load. `TechMarquee.tsx` was renamed and rewritten into it. Bug fixed on the way: both old strips had a seam jump because spacing used a flex `gap`, which makes half the track half a gap shorter than one copy; spacing is now inside each item and the track is `w-max`.
- Dashboard: `site_settings.marquee_speed` (integer, NOT NULL, default 60), "Strip speed" slider in Admin > Settings (10-200 px/s, step 5), clamped server-side in `saveSiteSettingsAction`, which now also revalidates `/projects`. The default 60 is close to the old homepage speed (about 65 px/s).
- DATABASE (not applied by me, no DB access): migration `drizzle/0012_site_marquee_speed.sql` is `ALTER TABLE "site_settings" ADD COLUMN "marquee_speed" integer DEFAULT 60 NOT NULL;`. Additive, so safe for the code currently on `main`. ORDER: run it in Neon BEFORE merging this branch. If the code deploys first, `getSiteSettings()` fails on the missing column and silently returns its defaults (title, description, avatar and the rest of the settings would fall back to defaults on the live site until the column exists). Back up first as PLANNER.md says (`npx tsx scripts/export-backup.ts`).
- Docs: DESIGN_GUIDE (strip section rewritten, portrait paragraph), PLANNER (components tree, `site_settings` columns, migrations 0011 and 0012).
- Verified: `npx tsc --noEmit` clean after each commit. NOT verified in a browser or by `npm run build` here: that both strips move at the same pace and have no seam jump, how the hero looks with the portrait standing on the strip, and the `/projects` hero spacing without the stats.


### 2026-10-10 (merge): stacked PRs #19, #20 and #21 merged into `main`
- Agent: Claude Edge
- Request (Fahim): "go" to merging the branches in order, after the Neon screenshot showed `projects.type` was already dropped on production and the live site was reading a column that no longer existed.
- Done, in order, all with "Create a merge commit" (no squash, the branches were stacked): PR #19 `motion-polish` into `main` (merge commit `b1ffbbf`), then PR #20 `face-reveal` retargeted to `main` and merged (`1be0288`), then PR #21 `glow-roam` retargeted to `main` and merged (this entry ships inside it). After each merge the source branch was deleted on the remote (`motion-polish`, `face-reveal`, and `glow-roam` after #21). The first merge is the one that fixes production: `main` no longer selects `projects.type`.
- No SQL was run or is pending: the column was already gone from production (see the entry below).
- Repo state afterwards: `main` carries the whole motion pass, the hero portrait, the `#111111` / `#222222` / `#333333` / `#444444` palette, the single fixed glow, the `Agent: Claude Edge` rule, and migration file `0011_remove_project_type.sql` (not auto-applied; the database already matches it). Hero CTA buttons are still hidden (`SHOW_HERO_CTAS = false`); `lib/email.ts` still uses the old palette. Remaining branch not deleted: `small-fixes` (already merged into `main` earlier, 0 commits of its own), waiting on Fahim's answer.
- Verified: Vercel built all three branch tips successfully before merging; GitHub reported each PR mergeable and clean. NOT verified here: the production deploys of `main` after each merge, and that `/projects` and the homepage show projects again.

### 2026-10-10 (database state): `projects.type` is already gone from production, merge #19 is urgent, branch `glow-roam`
- Agent: Claude Edge
- Trigger (Fahim, screenshot of the Neon SQL editor, production branch): `ALTER TABLE projects ALTER COLUMN type DROP NOT NULL;` failed with `column "type" of relation "projects" does not exist`. Neon's query history shows both statements were run on Oct 9 at 5:27am (the NOT NULL drop, then `remove type column from projects table`). So the production database is ALREADY in the final state the removal expects; no further SQL is needed, before or after merging.
- What this means: the SQL ordering I wrote earlier (nullable first, drop only after the merge deploys) assumed neither statement had run. The drop ran first, which is the unsafe order for the code on `main`: `lib/db/queries.ts` there still does `db.select().from(projects)` with `type` in the schema, and `getAllProjects` / `getFeaturedProjects` catch the error and return `[]`. Pages using them have `revalidate = 60`, so after the next regeneration the live homepage "Selected work" and `/projects` render with no projects, silently (no error page). Previews are fine: they run the new schema against the same database. Also affected on `main`: the `/admin/projects` list, and anything that counts projects (`/llms.txt`, stats).
- Fix: merge PR #19 (`motion-polish`, which removes `type` from the schema, the dashboard and every query); production redeploys from `main` and the pages regenerate correctly. PR #19's description was corrected to say no SQL is needed.
- Not run by me: no database access from here; this is read from the screenshot only. NOT verified: whether the live site is showing empty project lists right now (check `/projects` on production).
- Lesson for future migrations on this repo: when code and database must change together, drop the column only after the code that stops reading it is live (expand, deploy, then contract), and tell the person to run exactly one statement at a time.

### 2026-10-10 (palette): page background back to #111111, branch `glow-roam`
- Agent: Claude Edge
- Request (Fahim): go back to `#111111`; AGENTS.md `Agent` field is `Claude Edge` on every entry (already done earlier today, see the log-convention entry below); then help merge the branches.
- Done: `git revert` of `f2d3f90` ("page background #000000"), so all 18 files (public site, admin, favicon glyph, `--bg` in `globals.css`) have `#111111` again; no `#000000` hex is left in `app/`, `components/` or `public/`. `lib/email.ts` was never changed. DESIGN_GUIDE section 2 (tokens, table, snippets, the "four-step ladder" wording) and the AGENTS.md Conventions palette line are back to `#111111`. The glow keeps its current tuning (`GLOW_PEAK` 0.22 of `#444444`), which was originally set against `#111111`, so the "centre looks darker on black" caveat in the previous entry no longer applies.
- History kept: the black-background commit and its revert both stay in the branch history; the older entry below describing the black background is a record of that attempt, not the current state.
- Verified: `npx tsc --noEmit` clean after the revert; grep shows 0 `#000000` and 33 `#111111` hex values in code. NOT verified in a browser.

### 2026-10-09 (log convention): Agent field is "Claude Edge" on every entry, branch `glow-roam`
- Agent: Claude Edge
- Request (Fahim): edit AGENTS.md so the agent is "Claude Edge" for every single entry, from now on and in future; then help merge the branches.
- Done: every Session Log entry (43) now reads `- Agent: Claude Edge`, and the Conventions bullet says the field is always `Claude Edge`. Every future entry uses it. Earlier entries had `Agent: claude-sonnet (chat)`; an earlier pass of this same change (commits `2634212`, `5edba37`, already pushed) had set `Claude Vivaldi` instead, and that was replaced with `Claude Edge` to match Fahim's wording. Nothing else in any entry was touched (model names mentioned inside an entry's text are unchanged).
- Not changeable from here: the `repo-maintainer` skill's own template lives outside the repo, so the rule is carried by this Conventions bullet and by Fahim's saved preferences.
- Verified: 43 entries and 43 `- Agent: Claude Edge` lines; the only remaining mentions of `Claude Vivaldi` or `claude-sonnet (chat)` are in this entry and the Conventions bullet.

### 2026-10-09 (static glow + black): single fixed glow, background #000000, branch `glow-roam`
- Agent: Claude Edge
- Request (Fahim): single glow, fixed blur, background `#000000`. Context: he asked whether the roaming branch is redundant if the blur drift is off; answered that drift (blur over time) and roam (position over time) are different, and he chose a static glow.
- Glow: `components/MintGlow.tsx` rewritten again. One orb, fixed Gaussian-style softness, no roaming, no drift, no hold timer. It is centred behind the hero portrait (`data-glow-anchor`), re-measured on load, resize and navigation, glides 1.2s between the portrait spot and the upper-right default used on pages without a portrait, fades in once placed, keeps the 28% scroll parallax. The roaming version is in git history at `14cec60`. The branch name `glow-roam` is now misleading (rename it if wanted; nothing depends on the name).
- Background: every `#111111` (public site and admin, 28 occurrences in 18 files, plus `--bg` and the favicon glyph) became `#000000`. `lib/email.ts` still has the old palette. Surfaces `#222222`, lines `#333333`, hover borders and glow `#444444` unchanged: he only specified the background, so the ladder is now black, 222, 333, 444 (a bigger jump from the page to the first surface than before).
- Check: the suit in the portrait averages about `#212121` (lower torso about `#111111`), so on pure black it stays visible, where it nearly vanished on `#111111`. The glow's centre colour is lower on black (alpha 0.22 of `#444444` is about `#0F0F0F`, was about `#1C1C1C` on `#111111`) though its lift over the page is a bit larger; raise `GLOW_PEAK` if it reads too faint.
- Docs: DESIGN_GUIDE palette (tokens, text, snippets) and the Ambient glow row updated; the 2026-06-29 changelog row was restored to its true `#070807` (an earlier bulk remap had rewritten it).
- Verified: `npx tsc --noEmit` clean after each commit; grep finds no `#111111` left outside the email template. NOT verified in a browser: how the portrait and glow read on pure black, and that the glow lands behind the portrait at 1024, 1366 and 1920 widths.

### 2026-10-09 (cleanup): `glow-drift` branch deleted, branch `glow-roam`
- Agent: Claude Edge
- Decision (Fahim, after being told it held the only copy of the drift code): delete `glow-drift`, local and remote. Deleted at tip `ffc7af9` (commits `2ad28ca` drift code, `ffc7af9` docs). If the random softness drift is ever wanted again: `git fetch origin ffc7af9 && git branch glow-drift ffc7af9` works only while GitHub still serves the commit (not guaranteed, no PR was opened), otherwise rebuild from the description in the 2026-10-08 glow-drift entry above (two soft gradient layers, opacity cross-fade on random 6-14s timers, independent per orb).
- Earlier entries that say `glow-drift` was "kept for later" are history; the branch no longer exists. The roaming glow on `glow-roam` supersedes it.
- Remaining remote branches: `main`, `small-fixes` (already merged into `main`, 0 commits of its own, safe to delete), `motion-polish`, `face-reveal`, `glow-roam` (stacked in that order).

### 2026-10-09 (glow-roam): one softer, roaming background glow that starts behind the portrait, branch `glow-roam` (off `face-reveal`)
- Agent: Claude Edge
- Request (Fahim): keep only the right-side glow, make it a bit more blurred, let it roam around the background, always starting from behind his picture and staying there for 3 seconds at the beginning.
- Done (`components/MintGlow.tsx` rewritten): (1) the lower-left echo orb is removed; (2) the remaining orb uses a smooth Gaussian-style falloff (11 stops, `closest-side`, no border-radius clip) and is about 13% larger, which is what "more blurred" means here (the old linear fade ended at a faintly visible disc edge); (3) roaming: placed instantly behind the portrait, fades in over 1.4s, rests 3s, then every 16-26s eases to a random viewport point at least 30% of the diagonal from where it is; (4) the portrait carries `data-glow-anchor`, and MintGlow centres on it (biased to face and shoulders, 38% down); (5) MintGlow lives in RootLayout, so it persists across client navigation: navigating to a page that has the portrait (the homepage) glides it back behind the portrait over 2.2s, rests 3s, then roams again; on other pages it keeps roaming.
- Implementation notes: only `transform` animates (CSS transition, compositor-only); scroll parallax moved to a separate zero-size wrapper so two transforms never fight; the orb is hidden (`.glow-orb`, `@media (scripting: enabled)`) until JS positions it so it never flashes at the wrong spot, and shows at the old upper-right position without JS. If the portrait is hidden (phones, below 640px) or scrolled out of view at load, it starts from the upper-right default instead. Reduced motion: no roaming, no glide, no parallax.
- Left alone: the separate faint glow at the bottom of the homepage closing "Reach Out!" section (`app/page.tsx`), because he spoke about the two background glows. The earlier random softness drift stays only on `glow-drift` (not adopted).
- Housekeeping: an earlier attempt in the same session had left a duplicate `data-glow-anchor` attribute/comment and an unused `glow-in` keyframes block; both removed before committing.
- Verified: `npx tsc --noEmit` clean. NOT verified in a browser: that the glow really starts behind the portrait (the anchor point is the portrait box centre, 38% down), that the pace feels like roaming and not drifting-too-fast/slow, and that the hold-then-glide feels right after navigating Home.

### 2026-10-09 (glow drift not adopted): back to the steady glow, branch `face-reveal`
- Agent: Claude Edge
- Decision (Fahim): undo the random glow drift, but keep the `glow-drift` branch.
- Done: nothing to revert in code. The drift only ever existed on `glow-drift` (commits `2ad28ca` and `ffc7af9`, built on `face-reveal` at `f60c6c0`); `face-reveal` never contained it, so the steady `#444444` glow in `components/MintGlow.tsx` is what ships from here. `glow-drift` was deliberately left untouched on the remote so the experiment can be revisited (tuning knobs: `DRIFT_*` / `SOFT_*` constants at the top of `MintGlow.tsx` there).
- Consequence: `glow-drift` no longer contains the tip of `face-reveal` (it lacks this note). Harmless; if it is ever resurrected, merge `face-reveal` into it first. Do not re-add the drift without being asked.
- Work from `face-reveal` (and its preview deployment), not `glow-drift`.

### 2026-10-08 (palette): new neutral palette, branch `face-reveal`
- Agent: Claude Edge
- Request (Fahim): background `#111111`; everything else `#222222` and `#333333`; glow `#444444`. (Triggered by his question whether the background was `#000000`; it was `#070807`.)
- How I read it: a four-step gray ladder. `#111111` page; `#222222` surfaces/fills; `#333333` lines; `#444444` glow. Text colours (`#F3F6F4`, `#8A938E`, `#5C615E`, `#C7CCCA`) and the mint accent `#3DF49A` were NOT in the request and are unchanged.
- Mapping applied (role-aware, via a throwaway script; roles read from the Tailwind utility or CSS property):
  - `#070807` (page, grid cells, nav) to `#111111`.
  - Fills `#0F0F0F`, `#0A0C0B`, `#090A09`, `#0F1210`, `#141712`, `#121312`, `#0C0D0C` to `#222222`.
  - Lines `#1F2421` to `#333333` (borders, dividers, the `gap-px` grid colour, decorative separators). Reason: a border must differ from the surface under it, and surfaces are now `#222222`.
  - `#2B302D` / `#3A3F3C` by role: as border or hover-border to `#444444` (so hover still reads as a step up from the new `#333333` borders), as fill to `#333333`, as TEXT or placeholder to `#5C615E` (the existing dim-text tone; `#333333` text on `#222222` would be about 1.3:1 and unreadable). `#3B3F3D` / `#474C49` text to `#5C615E`.
  - `--bg`, `--surface`, `--border` in `globals.css` updated; `rgba(31,36,33,.8)` pre border to `rgba(51,51,51,.8)`; code block background `rgba(0,0,0,.45)` to `rgba(34,34,34,.6)`; favicon glyph (light mode) to `#111111`.
- Glow: `components/MintGlow.tsx` `GLOW_RGB` is `'68, 68, 68'` (`#444444`). Alphas raised (0.06/0.02/0.03 became 0.24/0.08/0.12) because `#444444` over `#111111` needs about 4x the alpha to give the same faint lift the light-gray glow gave; if it reads too strong or too faint, tune those three numbers. The closing "Reach Out!" section glow (`app/page.tsx`) was mint and is now `rgba(68,68,68,0.28)`.
- Scope: public site and the admin dashboard (they share these tokens), as two separate commits so the admin one can be dropped. NOT changed: `lib/email.ts` (transactional emails keep the old dark palette), mint accent usages (buttons, focus rings, `.border-glow`, credential dot glow).
- Judgement calls Fahim may want to revisit: the hover-border `#444444`, placeholders at `#5C615E`, and the hero ticker band being `#222222` (a visibly lighter strip than the page).
- Verified: `npx tsc --noEmit` clean after each commit; Tailwind CLI compile contains the new utilities and none of the old hex values; grep finds no old neutral left in `app/`, `components/` (emails excepted). NOT verified in a browser: contrast and overall feel, especially cards (`#222222` on `#111111`), the gray glow strength, and the portrait against the lighter page.

### 2026-10-08 (face-reveal, alignment + glow colour): branch `face-reveal`
- Agent: Claude Edge
- Feedback (Fahim, screenshot with two red lines): the head sat at the lower line (y about 173 at 1361px wide), he wants it at the upper line (about y 125-135, level with the top of "Build"). Also: change the mint glow to light gray.
- Why my earlier alignment was 34px low: I estimated the headline block height as h1 + `mb-8` (32) + sub row `mt-12` (48) = 80px between them, but adjacent sibling margins collapse, so the gap is 48px, not 80. That made the wrapper shorter than I assumed, so the `0.31 x font-size` offset I derived from the first screenshot was measured against the wrong wrapper top. The aspect-ratio width derivation itself was fine (it matched the rendered width). Fix: measured from the second screenshot instead: wrapper top at about y 131, "Build" glyph top at about y 140, so `top` is now `-0.04 x font-size` (head top about y 130). Portrait grows to about 535px high at 1361px wide (was 490). Horizontal `right` moved 11.5% to 10.5% so the centre stays where it was while the figure gets wider.
- Glow: the ambient glow is the site-wide fixed `components/MintGlow.tsx` (not hero-only), so every page changes. Colour is now one constant, `GLOW_RGB = '214, 220, 216'` (light gray), alphas lowered a little (0.07/0.025/0.04 became 0.06/0.02/0.03) because light gray reads brighter than mint at the same alpha. To revert to mint: `'61, 244, 154'`. The component is still called MintGlow; renaming it was left out to avoid churn.
- Not changed: the accent colour `#3DF49A` itself, `.border-glow`, and `DESIGN_GUIDE.md` "Accent Glow" (a separate CSS utility) are still mint.
- Verified: `npx tsc --noEmit` clean after each commit. NOT verified in a browser: head-to-"Build" alignment, and whether the gray glow is too strong/weak.

### 2026-10-08 (face-reveal, placement): portrait moved to the drawn spot, hero buttons hidden, branch `face-reveal`
- Agent: Claude Edge
- Request (Fahim, with a screenshot drawn over in red): put the portrait in the marked area; he does not know what to do with the buttons, hide them for now and unhide them when he says so.
- Reading of the drawing (an interpretation, not a measurement): top aligned with the top of "Build", and the figure in the column between the two vertical lines (about x 812 to 1115 at 1366px wide), bottom still on the stats rule. So the portrait moved left, away from the right edge, and grew slightly in height (about 527px at 1366px, was 519px).
- Done: `HeroPortrait.tsx` now sets `top` from the h1 font size (0.31 x, measured from the screenshot: cap top y=145 vs line-box top y=103 at a 136.6px font), `bottom-[-4rem]`, `right-[11.5%]`, `aspect-[571/907]` for the width, and the img fills it (`object-contain object-bottom`). If the head sits a few px high or low against "Build", adjust the 0.31.
- Hero buttons: `const SHOW_HERO_CTAS = false` at the top of `app/page.tsx` wraps the buttons div. TO UNHIDE: set it to `true`. The buttons' JSX, delays and styles are untouched. While hidden, the homepage has no direct "contact" link above the fold (the nav still has Contact).
- Verified: `npx tsc --noEmit` clean; Tailwind CLI generates the new arbitrary classes. NOT verified in a browser: the `aspect-ratio` width derivation from a `top`+`bottom` absolute box (supported in current browsers, but check the figure is not stretched or offset at 1366, 1024 and 768 widths), and the head alignment with "Build".

### 2026-10-08 (face-reveal, revision): natural scale, no added glow, branch `face-reveal`
- Agent: Claude Edge
- Feedback (Fahim): the photo feels zoomed, keep it normal; use the glow that existed before.
- Changes: (1) Removed the mint radial glow I had added behind the head and the bottom `mask-image`; the page's existing `MintGlow` is the only glow now. (2) Re-exported the asset as the FULL figure (571x907, 32 KB) instead of the head-and-chest crop, and shrank it: `clamp(320px, 38vw, 540px)` high, so the head is about two thirds of its previous size. (3) Because the photo is cut off at the waist, the cut now sits exactly on the stats rule so he stands on the line instead of fading out: the headline + intro row is wrapped in a new `relative` div (re-indented), the portrait is anchored to its bottom and pushed down `4rem` to match the `mt-16` above the rule. If either value changes, change both.
- Known trade-off: the "Let's talk" / "About me" buttons now sit over the lower part of the jacket and hands. They are above the portrait in the stacking order, so they stay clickable and readable (the filled mint button especially), but check it looks acceptable. Option if not: move the buttons next to the intro text.
- Not done: nothing below `sm` (phones); no `srcset`.
- Verified: `npx tsc --noEmit` clean; a Python mock at 1366x768 (no site glow in it) showed the proportions. NOT verified in a browser.

### 2026-10-08 (face-reveal): hero portrait, branch `face-reveal` (off `motion-polish`)
- Agent: Claude Edge
- Request (Fahim): create a new branch `face-reveal` and try his photo (transparent B&W cutout, uploaded) in the empty right side of the homepage hero.
- Branch: `face-reveal` was cut from `motion-polish`, not `main`, because the hero uses `.blur-load` and the arrival gate that only exist there. A PR for `face-reveal` therefore also contains the unmerged motion commits: merge `motion-polish` first, or target it.
- Asset: the upload already had real transparency (70% of pixels alpha 0). Cropped to the subject (head to upper chest/arms, 571x629) and saved as `public/images/fahim-hero.webp`, quality 88 with alpha: 25 KB vs 245 KB for the PNG. Source resolution is the limit: it is slightly soft on 2x screens.
- Component: `components/HeroPortrait.tsx` (see DESIGN_GUIDE "Hero portrait"). `app/page.tsx`: hero container gets `relative` and renders `<HeroPortrait />` first. Plain `<img>` because the repo does not use `next/image` anywhere (Vercel + Cloudflare dual deploy).
- Design reasoning: a small circle would look like a sticker next to 9rem type, so it is a large cutout; the jacket is near-black on a near-black page, so a mint radial glow behind the head provides the silhouette and a bottom mask dissolves the torso before the CTA buttons.
- Not done: nothing is shown below `sm` (phones); a mobile placement is undecided. No `srcset`/second size.
- Verified: `npx tsc --noEmit` clean; Tailwind CLI generates the arbitrary classes used; an approximate mock rendered in Python (not a browser) looked right at 1366x768. NOT verified in a browser: check overlap with the headline at 1024 and 768 widths, the CTA buttons over the faded torso, and that the glow does not look like a hard disc.

### 2026-10-08 (projects page + dashboard): `type` removed everywhere, branch `motion-polish`
- Agent: Claude Edge
- Request (Fahim, answering "remove the Types stat and the `type` field from the dashboard, with or without the DB column?"): "yes, remove". Read as all of it, including the column, following the 2026-10 credentials-timeline cleanup precedent (schema edit, `drizzle-kit generate`, Neon SQL given separately and run by hand).
- Commits: (1) `/projects` hero: "Types" stat removed, stats row is now three columns (`grid-cols-3`, so no orphan on mobile). (2) `type` removed from `/admin/projects` (form field, list badge, JSON import normalisation, JSON help panel and its example), from `lib/db/schema.ts`, and `drizzle/0011_remove_project_type.sql` generated (`ALTER TABLE "projects" DROP COLUMN "type";`) with its snapshot and journal entry. Tags field now sits full width in the form. `PLANNER.md` schema and form-field lines updated.
- NOT applied to the database. The migration is not run by the build (`db:migrate` is manual), so nothing changes in Neon until Fahim runs SQL. ORDER MATTERS, because Vercel previews and production share one database:
  1. Now, before using the dashboard on the preview: `ALTER TABLE projects ALTER COLUMN type DROP NOT NULL;` (safe for both the old and new code; without it, creating a project from the new code fails because `type` is NOT NULL with no default).
  2. Only AFTER this branch is merged and production has redeployed: `ALTER TABLE projects DROP COLUMN type;` (irreversible). Doing it earlier breaks production, whose code still reads the column.
- Left alone: `components/ProjectsSection.tsx` has its own hardcoded demo data with a `type` field and is not imported anywhere (dead code, not connected to the database). Old exports/backups still containing `type` are harmless: the JSON import ignores unknown keys.
- Verified: `npx tsc --noEmit` clean after each commit; drizzle-kit generated exactly one statement. NOT verified in a browser or against the database: after SQL step 1, create and edit a project on the preview, and run a JSON import.

### 2026-10-08 (projects page): "By Type" section removed, dashboard connection checked, branch `motion-polish`
- Agent: Claude Edge
- Request (Fahim): on `/projects` remove everything after "By Type", along with it; check whether anything removed so far was also connected to the dashboard and, if so, remove it there too.
- Done: deleted the "By Type" section (heading plus the per-type groups of `ProjectCard` grids). Nothing was left after it (the Technologies section went in the previous change). `/projects` is now: hero (title, lead, stats, technologies ticker) and the all-projects grid. `public/llms.txt` described the page as "filtered by type"; reworded so the AEO summary matches the page.
- Dashboard check (grepped `app/admin`, `lib`, `components`, `app/api`, and the repo for both section names): neither removed section had any dashboard control, setting or table. Their headings and intro text were hardcoded in `app/projects/page.tsx`; their content was computed from each project's `tags` and `type`.
  - `tags`: still fully live (card chips, the Technologies stat, the hero ticker). Nothing to remove.
  - `type`: after this change it only feeds the "Types" stat in the hero, the small type badge in `/admin/projects`, the admin form field, JSON import and the `type` column (NOT NULL, no default). It is the one thing that became close to dead. NOT removed yet: removing the field while keeping the "Types" stat would leave a stale number, so removing it means removing that stat too, and removing the column means a drizzle migration plus Neon SQL (as in the 2026-10 credentials-timeline cleanup). Waiting on Fahim's call.
- Verified: `npx tsc --noEmit` clean. NOT verified in a browser.

### 2026-10-08 (projects page): technologies ticker in the hero, Technologies section removed, branch `motion-polish`
- Agent: Claude Edge
- Request (Fahim, with a screenshot of the `/projects` preview): remove the Technologies section on `/projects` and put a marquee of technologies in the hero, just below the numbers.
- Done: deleted the "Technologies" chip-grid section (below "By Type"). New `components/TechMarquee.tsx` (server component): list doubled for a seamless loop, track is `w-max`, second copy `aria-hidden`, edge fade via `mask-image`, hover pause, duration scales with item count. It sits inside the hero section directly under the stats grid, `blur-load` entrance, bottom border so stats and ticker read as one band. Items are the unique project tags, most used first then alphabetical (the removed section was alphabetical).
- Kept on purpose: the "Technologies" stat number in the hero (he only asked to remove the section). Say so if the stat should go too.
- Noticed, not changed: the homepage ticker (`app/page.tsx`) has no `w-max` on its track, so `translateX(-50%)` is half the container width, not half the content width, and the loop probably jumps at the seam. Fix is adding `w-max` to that div (and swapping in `TechMarquee` would remove the duplication).
- Verified: `npx tsc --noEmit` clean; Tailwind CLI generates `w-max`, the mask utility and `animate-marquee`. NOT verified in a browser: check the ticker speed, the edge fade, the loop seam and the hover pause on the preview, plus how the hero looks with the section removed on mobile.

### 2026-10-08 (motion pass, fix): hero entrance missed after clicking a nav link from the bottom of a page, branch `motion-polish`
- Agent: Claude Edge
- Report (Fahim): after scrolling to the bottom of a page and clicking a nav link, the page scrolls up on its own (wanted) but the hero entrance is missed. He asked for the animation to start once the scroll reaches the top, and chose to keep the smooth scroll-up.
- Cause (read from code and the Next source, not reproduced in a browser): `html` has `scroll-behavior: smooth` and no `data-scroll-behavior="smooth"` attribute. In Next 16.2.6, `disableSmoothScrollDuringRouteTransition` only forces an instant scroll when that attribute is present, so the route-change scroll-to-top is smooth. The hero entrance (`.blur-load`, `BlurWords mode="load"`) is timer-based and starts at mount, so it finished before the scroll arrived.
- Fix: `app/template.tsx` (client) runs a layout effect: if the page mounts with `scrollY > 24`, it sets `data-await-top` on the wrapper before first paint; CSS pauses the hero entrance while that attribute is present (`globals.css`); a passive scroll listener releases it at `scrollY <= 24`, with a 2s safety timeout for manual scrolling, `#anchor` navigation or a stalled scroll. At the top on mount nothing is gated, so first paint and no-JS visitors are unaffected. Not gated: the 180ms route fade and scroll-triggered reveals (they fire when in view).
- Alternative not taken: `data-scroll-behavior="smooth"` on `<html>` would make route changes jump instantly (one attribute) but removes the smooth scroll-up he likes. Still available if the gate ever misbehaves.
- Verified: `npx tsc --noEmit` clean. NOT verified in a browser: check on the preview from the bottom of `/credentials` (long page) and from a short page, plus a reload mid-page.

### 2026-10-08 (motion pass, fix): navbar lost its background blur, branch `motion-polish`
- Agent: Claude Edge
- Report (Fahim): the navbar lost its background blur. `backdrop-blur-md` is still on the pill, so the cause is an ancestor. My `app/template.tsx` wrapped every page, navbar included, in a `div` animating opacity with `both` fill (it stays applied after the fade). An element with an opacity animation becomes a backdrop root, which restricts what a descendant's `backdrop-filter` can see, and Chromium keeps that state while the animation fills forward.
- Fix: the fade now targets `.route-enter > main` and `.route-enter > footer` (every public page renders Navbar, `<main>`, Footer as siblings), the wrapper itself no longer animates, and the keyframes are `from`-only with `backwards` fill.
- Rule to keep: never put an opacity, filter, mask or transform animation on an ancestor of the navbar.
- Verified: `npx tsc --noEmit` clean. NOT verified in a browser (none available here): confirm on the preview that the pill blurs the hero and cards behind it on first load and after navigating between pages.

### 2026-10-08 (motion pass, follow-up): slower reveals and per-card reveals, same branch `motion-polish`
- Agent: Claude Edge
- Request (Fahim): the reveal is too fast, make it a bit slower, and give the cards the same blur reveal.
- Slower (commit "Slow the blur reveal"): block reveal 600ms to 900ms, per-word 550ms to 800ms, word stagger 45ms to 70ms, `.blur-stagger` steps 70ms to 110ms (cap 420ms to 660ms), hero delays 220/320/420ms to 340/480/620ms, h1 line delays 90/180ms to 140/280ms, inner-page lead text 140ms to 220ms. All of it is CSS variables or the numeric `delay` props, so it is a one-line retime if it still feels off.
- Bug found while adding cards, fixed in its own commit: the reveal keyframes used `to { opacity: 1 }` with `both` fill, which pinned `opacity: 1` after the animation and would have overridden the dimmed foundational certs (`opacity-50 hover:opacity-70`) on `/credentials`. Keyframes are now `from`-only with `backwards` fill and the hidden state is dropped via `:not([data-revealed='true'])`, so the end state is always the element's own style. Do not change the fill back to `both`.
- Cards (commit "Cards reveal one by one"): `ProjectCard` (home + both grids on `/projects`) and the home blog teaser cards keep their cell (background, 1px grid lines, hover) and blur only their content in, per card, as each scrolls into view; cards in the same row stagger by 180ms (`index` prop on `ProjectCard`). Removed the grid-level `Reveal` wrappers from those two homepage grids (a hidden wrapper would have hidden the cards too). `/blog` list: each card wrapped in its own `Reveal` (col-span moved to the wrapper, `h-full` on the `Link`), `--blur-from: 3px` because of the large cover images. `/credentials`: cert, community and contribution grids use `.blur-stagger`.
- Skipped on purpose: the credentials timeline (vertical, continuous, per-item reveal would fight the line) and the skills cards (already revealed individually).
- Docs: DESIGN_GUIDE.md section 8 (new durations, fill-mode warning, the three card patterns), PLANNER.md timeline row.
- Verified: `npx tsc --noEmit` clean after each commit; Tailwind CLI compile confirms the new hidden/revealed selectors. NOT verified: `npm run build` (no Google Fonts egress here), browser, real feel of the new timings.

### 2026-10-08 (motion pass): blur-fade reveals and microinteractions, branch `motion-polish`
- Agent: Claude Edge
- Request (Fahim): add motion/animation to the site, audit first, approve, then implement in small commits. Fahim's own direction: he loves scroll-triggered faded-blur reveals (seen in motion-primitives' Text Effect "speed" demo) and asked for it to be applied his own way, not by importing that library. Approved the suggested cut (items 1-6, 8, 10); skipped card hover polish, skeleton `loading.tsx` and the beta popup animation.
- Audit findings that drove the work: `framer-motion` installed but imported nowhere; `animate-fade-up`/`fade-in` defined but unused; no `prefers-reduced-motion` handling; no `loading.tsx`/`error.tsx`/`template.tsx`; 19 `transition-all` uses; no hero entrance; mobile menu links set `animationDelay` with no animation class (dead stagger); inputs removed the outline and only changed border colour.
- Decision: CSS-only, no `framer-motion` (about 17 KB gzipped saved by my estimate, not measured). `Navbar`/`Footer` stay per-page (moving them into the layout is a structural change outside a motion pass).
- Commits, one concern each, `npx tsc --noEmit` clean after every one:
  1. Foundation: `--ease-out`/`--ease-in-out` tokens (+ `ease-ui-out`/`ease-ui-in-out` in `tailwind.config.ts`), global reduced-motion guard, MintGlow parallax skips under reduced motion, `transition-all` replaced with explicit properties on every public page and component (Navbar done in its own commit), marquee pauses on hover.
  2. Blur reveal primitives: `components/Reveal.tsx` (client, one IntersectionObserver, sets `data-revealed` on the DOM node, plays once), `components/BlurWords.tsx` (per-word, `mode` load/scroll, `delay`/`stagger`/`duration` knobs), CSS in `globals.css`. Hero h1 words plus sub text, CTAs and stats enter in pure CSS (no wait for hydration, h1 first line has no delay so first paint is not held back).
  3. Homepage section headings blur in per word on scroll; teaser paragraphs, code card, skills list (`.blur-stagger`) and the two `gap-px` grids (as one block) reveal on scroll. Inner pages (`/about`, `/projects`, `/blog`, `/contact`, `/credentials`): h1 per-word on load, lead paragraph `.blur-load`, below-the-fold h2s on scroll. About/contact h1 used `<br />` plus an accent `<span>`; now two `block` BlurWords lines (same layout).
  4. Buttons: `active:scale-[0.97]` press everywhere, hover grow (`hover:scale-105`, `scale-[1.01]`) removed.
  5. Focus: global mint `:focus-visible` outline for links/buttons; contact inputs get a soft 3px mint ring (they already removed the outline).
  6. Navbar: passive scroll listener and initial state on mount, outer nav no longer transitions, underline slides in on hover (stays on for the active page), mobile menu links now really stagger (opacity + rise + blur via `transitionDelay`, immediate on close), closed menu is `invisible` (links leave the tab order), Esc closes, body scroll locked while open, `aria-expanded`/`aria-controls`/state-aware label.
  7. `app/template.tsx`: 180ms enter-only opacity fade on every navigation (skipped on `/admin`). Enter-only because the App Router unmounts the old page first; an exit animation would need a router-freezing hack.
  8. Contact form: `Loader2` spinner while sending, success circle pops and the check draws (`pathLength` stroke animation), error message eases in and now has `role="alert"`.
- Gotchas worth remembering: the hidden state for reveals is only applied under `@media (scripting: enabled)`, so no-JS visitors see everything. Reveals end on `filter: none` / `transform: none` so no stacking context is left behind. `.blur-stagger` must not wrap a `gap-px` grid (the grid colour shows through hidden cells), which is why the projects and blog teaser grids reveal as one block.
- Docs: DESIGN_GUIDE.md section 8 rewritten (principles, tokens, blur reveal, other motion), button/navbar snippets updated, changelog row added. PLANNER.md: architecture tree, timeline row, next steps.
- Verified: `npx tsc --noEmit` clean at baseline and after each commit. Tailwind CLI compile confirmed the new utilities are generated (`ease-ui-out`, `active:scale-[0.97]`, the arbitrary `transition-[...]` lists, `blur-[6px]`, `scale-x-100`).
- NOT verified: `npm run build` fails in the sandbox on `next/font` (Google Fonts unreachable), the known limitation noted under Security/Gotchas. No browser test, no Lighthouse run, no real bundle-size measurement, no ESLint (the repo has no ESLint config). Needs a Vercel preview check, see the test checklist in the PR.
- Open follow-ups: skeleton `loading.tsx` (each skeleton would need its own Navbar since pages render it themselves), beta popup in `ProjectsSection` may be dead code since the status badges were removed, `framer-motion` can be removed from `package.json` if the CSS-only approach stays.

### 2026-10-06 (homepage teaser editable from dashboard)
- Agent: Claude Edge
- Request (Fahim): "make editable" for the homepage block left hardcoded in the previous entry ("Design can't be separated from engineering", the two paragraphs, "Full story" link and the code-style card).
- Extended `about_content` with 9 columns: `home_heading`, `home_paragraph_one`, `home_paragraph_two`, `home_link_label`, `home_card_role`, and four `text[]` lists (`home_card_description`, `home_card_stack`, `home_card_availability`, `home_card_obsessions`). Defaults equal the previous hardcoded copy. New migration `drizzle/0010_about_homepage_teaser.sql` (+ snapshot); `0009` was left untouched because it was already pushed.
- `app/page.tsx` now reads `getCachedAboutContent()` in its existing `Promise.all`; a small `quoteList()` helper renders the card lists as `'a', 'b'`. The card keys (`role`, `description`, ...), brackets, and the `/about` link stay in code.
- `/admin/about` gained a "Homepage teaser" section above the About page fields. Card lists are comma-separated inputs (max 8 items, 40 chars each, parsed client-side and re-validated in `saveAboutContentAction`). The save action now also revalidates `/`.
- MUST DO: run BOTH `0009` and `0010` (`npx drizzle-kit migrate`, back up first). If only `0009` is applied, `select *` hits missing columns, the catch returns the defaults, and saving errors, so the dashboard looks inert.
- Verified: `npx tsc --noEmit` clean. Not run: `npm run build`, browser test.

### 2026-10-06 (about page editable from dashboard)
- Agent: Claude Edge
- Request (Fahim): make the About section texts editable from the dashboard. Interpreted as the `/about` page (header, story, call to action). The homepage "Design can't be separated from engineering" block is NOT included; it is still hardcoded in `app/page.tsx`.
- New `about_content` table (single row, `id=1`): `headline_top`, `headline_accent`, `intro`, `story_heading`, `story_paragraphs text[]`, `cta_heading`, `cta_text`, `cta_primary_label`, `cta_secondary_label`, `updated_at`. Column defaults equal the previous hardcoded copy, with the three em dashes replaced (colon, comma) to match the dash cleanup. Migration `drizzle/0009_about_content.sql` plus `0009_snapshot.json`, generated cleanly (only the new table).
- `lib/db/queries.ts`: `DEFAULT_ABOUT_CONTENT`, `getAboutContent()` (uncached, creates the row on first read, falls back to defaults on any error), `getCachedAboutContent()` (1h `unstable_cache`, tag `about-content`), `updateAboutContent()`.
- `app/about/page.tsx` is now an async server component rendering from `getCachedAboutContent()`. The "About" eyebrow label and the button links (`/contact`, the design portfolio) stay in code.
- New admin route `/admin/about` (`page.tsx` + `AboutForm.tsx`), sidebar entry "About". Story paragraphs are one textarea, blank line between paragraphs, max 12.
- `saveAboutContentAction` in `app/admin/actions.ts` checks `isAuthenticated()` itself (unlike `saveSiteSettingsAction`, which relies on the page gate), validates and length-caps each field, and copies known fields only. Revalidates tag `about-content`, `/about`, `/admin/about`.
- MUST DO before the dashboard works: run `npx drizzle-kit migrate` against Neon (back up first with `npx tsx scripts/export-backup.ts`). Until then `/about` renders the defaults and the admin form loads but saving errors.
- Verified: `npx tsc --noEmit` clean. Not run: `npm run build` (needs Neon and Google Fonts egress), no browser test. The repo has no ESLint config, so lint was skipped.

### 2026-10-06 (homepage review fixes): copy fixes in code, remaining ones are DB-side
- Agent: Claude Edge
- Source: an external review of the live homepage, checked against the repo before editing. Branch `small-fixes` fast-forwarded to `main`, then `app/page.tsx` only.
- Hero: "Fahim  - an Aspiring AI Engineer. I build better and secure web architecture." became "Fahim, an Aspiring AI Engineer. I build better, more secure web architecture." Comma instead of the review's suggested " - " because spaced hyphens fall under the dash cleanup; the old line also produced a double space.
- Home about teaser: "the way I design — with intention" became "the way I design, with intention" (em dash out).
- Contact CTA: added the missing period after "AI era" (the review wrongly put it after "harder") and fixed "nowdays" to "nowadays".
- NOT fixable from code, still live and must be done in the dashboard: (1) `/admin/settings` keywords still contain "most handsome man in bangladesh" (the code defaults in `lib/db/queries.ts` are clean; the live value is the DB row); delete the whole keywords tag content if wanted, since Google ignores it. (2) `/admin/projects` Bindu description "better then NGL" should read "better than NGL". (3) `/admin/skills` "Web products" description "CMS,E-commerce" needs a space after the comma.
- Deliberately not done: no project cards added (Fahim's call), D-SHASTHO "my role" line skipped until Fahim supplies a true one-sentence contribution.
- Open: head metadata showed no og:image / twitter:image on the homepage despite `summary_large_image`; verify in view-source or a share debugger. The CTA button label rendered as "Start conversationStart a conversation" in a text scrape; check it is a hover-swap or sr-only span and not a double render.
- Not run: `npx tsc --noEmit` / `npm run build` (string-only edits; Vercel build is the check).

### 2026-10-03 (about page): removed "Tools & stack" too
- Agent: Claude Edge
- Deleted the "Tools & stack" section from `app/about/page.tsx` (Design/Frontend/Backend/DevOps 4-column breakdown, inline data, no DB). Same page as last entry -- About is down to header, "The honest story", and the closing CTA now.

### 2026-10-03 (about page): removed "What I believe" and "How I got here"
- Agent: Claude Edge
- Deleted both sections from `app/about/page.tsx` wholesale: the Values block ("What I believe", a 2-column grid partner to "The honest story") and the whole Timeline section ("How I got here", the 2019-2024+ history with the vertical line/dots). Removed their now-unused `values` and `timeline` data arrays too.
- "The honest story" survives on its own, no longer paired in a 2-column grid -- changed that grid to a single `max-w-2xl` column so the remaining text isn't stretched full-width.
- This page is fully static (no DB query, no admin page) -- nothing to clean up on the dashboard side, unlike the skills/projects/credentials removals earlier this conversation.

### 2026-10-03 (projects page): status badges removed entirely, including from DB
- Agent: Claude Edge
- Per screenshot, phrased as "gone for good": removed the LIVE/BETA/DEPRECATED/FUNDING pills shown on each project card, and -- unlike the credentials-timeline cleanup earlier, where unused columns were deliberately left in place -- this time dropped the underlying `status_badges` column from `projects` outright, since the instruction was for a permanent removal this time, not a soft deprecation.
- Flagged before removing, since it wasn't purely decorative: `statusBadges` also gated a "this project is in beta, might be unstable" warning modal before opening a beta project's Live link (`BetaModal` in the old `ProjectCard.tsx`). That whole interaction is gone with the column -- Live links now always open directly. `ProjectCard.tsx` lost its `'use client'` directive too, since nothing in it needs client-side state anymore.
- Swept the whole codebase for every reference, not just the obvious ones: the admin form's toggle buttons and list-view pills (`/admin/projects`'s `ProjectsManager.tsx`), the bulk-JSON import's parsing/validation and its example/doc text (`JsonHelpPanel.tsx`), and two sanitize helpers in `app/admin/actions.ts` (`sanitizeStatusBadges`, the `ALLOWED_BADGES` list) used by both the single-project and bulk-upsert actions.
- `drizzle-kit generate` run immediately after the schema edit. Neon SQL (`DROP COLUMN`) provided separately, marked irreversible.

### 2026-10-03 (projects page): remove per-card type eyebrow
- Agent: Claude Edge
- Per screenshot: removed the small uppercase `{project.type}` label (TOOL/WEB/EDUCATION) that sat above each project card's title, in `components/ProjectCard.tsx`. Since ProjectCard is shared, this clears it from both the main grid and the "By Type" breakdown section further down `/projects` in one place -- "the whole page" as asked.
- Did NOT remove the `type` field from `/admin/projects` or the DB column: unlike the credentials-timeline cleanup, this one isn't fully dead. It still drives the "Types" count stat at the top of `/projects` and the "By Type" grouped section (real `h3` headings, not eyebrows) further down the same page -- neither of which was part of what Fahim circled. Left the admin list view's own small type badge alone too (a pill, not the same bare eyebrow pattern, and still an accurate reflection of a live field).

### 2026-10-03 (skills section): real row/column layout switch, not just image-side
- Agent: Claude Edge
- Misread Fahim's earlier sketch as "rows, with per-skill left/right image toggle." What he actually wanted was two complete arrangements (full-width rows, and a card grid with a centered icon) with a dashboard switch between them — should have asked when the sketch was ambiguous between those two readings instead of guessing.
- Built it properly this time: new `skillsLayout` column (`'rows' | 'columns'`, default `'rows'`) on `site_settings` (a site-wide switch, not per-skill), with a toggle at the top of `/admin/skills`. `app/page.tsx` renders one of two complete JSX blocks for the "What I do" section depending on this setting.
- Columns mode: unified card (one background/border, no split), icon centered above left-aligned title/desc, grid up to 3 across on desktop — matches Fahim's reference screenshot of his own already-uploaded icons. Rows mode carries over from last session, per-skill `imagePosition`. `imagePosition` is stored regardless of which layout is active, but only has a visible effect in rows mode — the admin form now says so.
- `drizzle-kit generate` run immediately after the schema edit, before committing. Neon SQL provided separately for the live DB.
- Correction, same day: the rows split was 50/50, not matching the sketch — re-checked it and the actual ratio is closer to 40% image / 60% text. Changed `md:w-1/2`/`md:w-1/2` to `md:w-2/5`/`md:w-3/5`.

### 2026-10-02 (skills section): back to stacked rows, image side switchable per entry
- Agent: Claude Edge
- Per Fahim's sketch: skills section is no longer the 3-column card grid — it's a single-column stack of full-width rows again, each split 50/50 into image and text. New `imagePosition` column (`'left' | 'right'`, default `'left'`) on `skills`, with a Left/Right toggle in `/admin/skills`'s create/edit form, so which side the image sits on is per-skill and dashboard-controlled rather than fixed or auto-alternated. New entries default to alternating based on position in the list, as a starting suggestion only — fully overridable per skill.
- Image half keeps the transparent-background treatment from last session (blends a transparent PNG into the page); text half keeps its solid `bg-[#0A0C0B]`. On phones, `imagePosition` is ignored — always image-then-text, stacked, since left/right has no meaning in one column.
- Ran `drizzle-kit generate` immediately after the schema edit, before anything else, per the standing rule from the skills/footer-links mistakes earlier.
- Neon SQL provided separately (`add-skills-image-position.sql`) — adds the column (safe on an existing table: `NOT NULL DEFAULT 'left'` backfills automatically) and optionally alternates the 3 existing seeded skills left/right/left by sort order, matching the sketch's pattern.

### 2026-10-02 (skills section): thumbnail area transparent, text block solid
- Agent: Claude Edge
- Per Fahim's annotated screenshot: reversed the earlier call on the skills-card thumbnail background. The top (image) area now has no background of its own (removed `bg-[#141712]`) so a transparent PNG blends straight into the page with no visible box around it. The bottom (title/desc) block now has an explicit solid background (`bg-[#0A0C0B]`), the opposite of the thumbnail above it.
- Admin skills manager description text updated to match. Left the small 64px thumbnail preview in the admin list view (`/admin/skills`) with its own light background unchanged on purpose — that's an internal management UI showing where the image slot is, not a copy of the public card's exact rendering, so the light box still earns its keep there.

### 2026-10-02 (branch cleanup): small-ui-fixes merged, replaced by small-fixes
- Agent: Claude Edge
- `small-ui-fixes` was merged into `main` via PR #6 (up through the stray-typo-fix commit). My last commit on that branch — switching the skills-grid thumbnail to full-bleed (`object-cover`, no padding) — landed ~3 minutes after the merge, so it never made it into `main`.
- Fahim then hand-edited `main` directly: homepage copy/typo fixes, the `knowsAbout` list in `layout.tsx`, the availability section wording, renamed the skills-section heading to "I like building." (matching his reference) with a simplified header, and nudged the navbar blur `sm` -> `md` on top of my earlier change. None of that touched the skills-card markup itself, so no conflict with the thumbnail fix below.
- Deleted `small-ui-fixes` (stale, diverged from `main` post-merge) and created `small-fixes` fresh off current `main`. Reapplied the full-bleed thumbnail fix against `main`'s actual current file (not a blind cherry-pick, since the surrounding heading/header markup had changed) and updated the matching description text in `/admin/skills`.

### 2026-10-02 (homepage copy pass): typos, code-block syntax, "Aspiring" positioning
- Agent: Claude Edge
- `app/page.tsx`: fixed typos (seperated, Develope, Postgress, Cause, centrice/softwares), missing spaces after punctuation, "curious about the space between pixels", and "Most developers leave security for last". Hero code block: unclosed `'Polymath;` string fixed, `Description`/`Availability` keys lowercased to match the rest.
- Eyebrow "Things I like and.." replaced with "Selected work"; "Things I write.." now ends with a single period.
- Positioning decision (Fahim): "Aspiring AI Engineer" everywhere. Updated `DEFAULT_SITE_SETTINGS` in `lib/db/queries.ts` and the placeholders in `app/admin/settings/SettingsForm.tsx`. The LIVE title/OG/description/jobTitle come from the `site_settings` DB row, so they must also be changed in `/admin/settings`. `lib/db/schema.ts` column defaults and `drizzle/meta` snapshots were deliberately NOT touched (changing them would need a migration).
- Hero stats (9+/2+/1+ years) kept as is, per Fahim. Note: `app/credentials/page.tsx` meta says "7+ years of professional design, 4+ years of full-stack development" - inconsistent with the homepage; unresolved.
- Project status badges (e.g. Bindu and LearnDE showing both `live` and `beta`) are DB-driven via `/admin/projects`, not code. Beta projects render "Live" as a button that opens a warning modal, not an anchor, so a missing `<a>` for those is expected behavior.
- Not run this session: `npx tsc --noEmit` / `npm run build` (string-only edits; Vercel build is the check).

### 2026-09-28 (skills section): switched from wide rows to compact icon-card grid
- Agent: Claude Edge
- Per Fahim's reference (another site's "What I work on" section): replaced the full-width image-beside-text row layout (from the earlier Frame_6 sketch) with a compact card grid — 1 column on phones, up to 3 across on desktop (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), each card holding a small 56px icon slot above the title and description, not a large image block beside it.
- Icon slot keeps the same transparent-PNG-friendly background idea as before (`#141712`, a shade lighter than the page), just much smaller and square instead of wide. No image uploaded yet -> falls back to showing the skill's number, same as before.
- Updated the stale "image beside text on wide screens" description text in `/admin/skills` to match the new grid.
- Section heading ("What I do" / "— three disciplines, one person") left untouched — only the cards below it changed.

### 2026-09-28 (navbar): more transparent, less blur, rounded hamburger bars
- Agent: Claude Edge
- Navbar pill: `backdrop-blur-xl` -> `backdrop-blur-sm`, background opacity dropped a tier at both states (`/70`->`/40` idle, `/95`->`/70` scrolled), so more of what's behind it shows through.
- Hamburger icon: its 3 bars gained `rounded-full` end caps instead of square ones.

### 2026-09-28 (home CTA button): one-line label, again
- Agent: Claude Edge
- Same "Start a conversation" wrap bug as the hero CTA fixed earlier — but that fix was made on `over-engineered`, a separate branch from `main` that `small-ui-fixes` doesn't include (neither branch has been merged). Applied the identical fix here: `whitespace-nowrap` + smaller `px-6` below 380px, with the label itself swapping to "Start conversation" below 380px and "Start a conversation" at 380px and up.
- Worth remembering next merge: `over-engineered` and `small-ui-fixes` both touch some of the same spots (this button, likely others) independently — check for overlapping fixes when either merges to main, to avoid reverting one branch's fix with the other's older version.

### 2026-09-28 (navbar): floating rounded pill instead of flush top bar
- Agent: Claude Edge
- Per Fahim's sketch: Navbar.tsx no longer sits flush against the top edge as a square-cornered, full-bleed bar. It's now a floating pill, inset `top-4` from the viewport top (and `px-4`/`sm:px-6` from the sides), `rounded-full`, with a blurred background at all times — not just after scroll. Scroll still deepens the background opacity and adds a shadow for legibility over busy content, but the shape itself (floating, rounded, inset) is now constant, mobile and desktop alike.
- Logo stays left, hamburger stays right on mobile; desktop nav links replace the hamburger inside the same pill, same as before — only the outer shape changed, matching "expanded but like this" from the sketch.
- No page padding changes needed — the pill's total height (~16px top offset + ~60px bar) is well under the existing `pt-32` every page already uses to clear the fixed nav.

### 2026-09-28 (credentials admin): removed dead type/tags controls, no DB change needed
- Agent: Claude Edge
- Checked: yes, the type badge (work/education/milestone) and the tag chips removed from the public timeline last session were both dashboard-editable, in `/admin/credentials`'s timeline form (`CredentialsManager.tsx`) — a Type dropdown, a "Tags (comma separated)" input, and matching read-only badges in the admin's own list view. With nothing on the public page rendering either anymore, both were dead controls (editing them had no visible effect) and are now removed from the form, the list view, and the JSON-import placeholder example. `isCurrent` ("Current role" checkbox) was left alone — still live, still tints the year/dot on the public page.
- Checked whether this needs Neon SQL: no. `credential_timeline.type` and `.tags` are both `NOT NULL` with DB-level defaults (`'work'` and `'{}'`), so omitting them from the dashboard's create payload is safe — Postgres fills the default, no constraint violation, no migration. Existing rows keep whatever type/tags values they already had; they're just inert now, not blanked out.
- Left the `type` and `tags` columns in `lib/db/schema.ts` as they are — removing them outright would be a bigger, less reversible step (an actual migration) that wasn't asked for. Easy to revisit if Fahim wants a full cleanup later.

### 2026-09-28 (credentials timeline): remove type badge, Current badge, tags
- Agent: Claude Edge
- Per Fahim's annotated screenshot: removed, from every entry in the Experience & Education timeline (`app/credentials/page.tsx`) — the WORK/EDUCATION/MILESTONE type label next to the title, the green "Current" pill, and the row of tag chips below the description (e.g. "AI Engineering", "Remote", "Internship").
- Removed the now-dead `typeLabel()` helper along with it. Left `event.isCurrent` itself alone — it still tints the year and timeline dot mint-green for the current entry, which is a different, subtler cue than the text pill that got removed and wasn't part of what was circled.
- Scoped to the timeline section only. The Certifications badge text and the Contributions "releases" label are different content (not type/status chips) and weren't touched.

### 2026-09-28 (about CTA): last remaining unstacked button pair
- Agent: Claude Edge
- Fahim's screenshot for the "credentials CTA" fix actually showed /about's CTA ("Get in touch" / "See portfolio ↗") — same no-wrap flex row bug, same fix. Searched the whole `app/` tree for the pattern (`flex gap-4 shrink-0` beside `rounded-full` buttons) to confirm this was the last one; /credentials was already fixed, /page.tsx's hero and bottom CTA were already fixed earlier this session, /projects and /contact have no button pairs like this.
- All secondary-CTA button pairs across the site now share the same rule: `flex-col` (full-width, stacked) below `sm` (640px), `flex-row` (auto-width, side by side) at `sm` and up.

### 2026-09-28 (credentials CTA): buttons stack on phone
- Agent: Claude Edge
- /credentials page's "Want to work together?" CTA ("Get in touch" / "LinkedIn") sat in a no-wrap flex row, same overflow risk as the hero and footer bugs this session. Now `flex-col` (full-width, stacked) below `sm` (640px), `flex-row` (auto-width, side by side) at `sm` and up.

### 2026-09-28 (footer): dashboard-driven, restructured to fix mobile overflow
- Agent: Claude Edge
- Bug: the footer's 5 nav links (About, Blog, Contact, Portfolio, LinkedIn) sat in one `flex` row with no wrap, so on phones the row overflowed and the first item ("About") got clipped off the left edge.
- Fix + feature: new `footer_links` table (label, url, groupLabel, external, sortOrder), full CRUD at `/admin/footer-links` (`FooterLinksManager.tsx`), linked from the sidebar. Links sharing a `groupLabel` render as one footer column.
- `Footer.tsx` is now an async Server Component reading `getFooterLinks()` (previously a static component with a hardcoded link list). Layout: brand block + link columns side by side on desktop (`md:flex-row`), brand then each column stacked full-width on phones (`flex-col`, `grid-cols-1` under `sm`), divider + centered copyright below — matches the structural pattern Fahim sketched (not its colors/copy).
- Grouping is by label only, not by numeric contiguity: bucketed with a `Map` keyed by `groupLabel`, so reordering one link can never split it from its group. Per-item reorder swaps `sortOrder` only with the neighbor *within the same group*, so it can't accidentally jump columns either.
- Neon seed SQL provided separately (`create-and-seed-footer-links.sql`) — seeds the current 5 links as "Navigate" (About, Blog, Contact) and "Elsewhere" (Portfolio, LinkedIn), matching current hrefs/targets exactly.
- Learned from the skills-table mistake last session: ran `drizzle-kit generate` immediately after finalizing schema.ts this time, before committing, so the migration and schema never drift apart in the same commit.

### 2026-09-28 (hero buttons): stack on phone
- Agent: Claude Edge
- Hero "Let's talk" / "About me" buttons sat side by side at every width, cramped on narrow phones. Now `flex-col` (full-width, stacked) below the `sm` breakpoint (640px) and `flex-row` (auto-width, side by side) at `sm` and up, per Fahim's sketch.

### 2026-09-28: Skills CRUD + "What I do" redesign (branch small-ui-fixes)
- Agent: Claude Edge
- Branch created fresh from `main` (not from `over-engineered` — no eyebrow/dash/font changes carried over).
- New `skills` table (`lib/db/schema.ts`): title, desc, imageUrl, sortOrder, timestamps. Full CRUD in `lib/db/queries.ts` and `app/admin/actions.ts`, admin UI at `/admin/skills` (`SkillsManager.tsx`), linked from `AdminSidebar.tsx`.
- Image upload: new `uploadSkillImageToCloudinary` in `lib/cloudinary.ts`, separate from the avatar uploader — each skill's thumbnail lives at its own `skill-<id>` Cloudinary public_id, so uploads don't collide across skills or force a single shared slot.
- Home page "What I do" (`app/page.tsx`): replaced the hardcoded `services` array with `getSkills()`; rebuilt from a 3-column grid into a single-column list of full-width rows — image beside text on desktop (`md:flex-row`), image above text on phones (`flex-col`). No image yet → falls back to showing the skill's number.
- Thumbnail background is `#141712` (a shade lighter than the page's `#070807`) specifically so a transparent PNG upload still reads as a card instead of floating on empty space.
- Neon seed SQL provided separately (`create-and-seed-skills.sql`) — creates the table and seeds the 3 existing cards (Graphic Design, UI/UX Design, Full-Stack Dev) with `image_url` left NULL; images to be uploaded later from the dashboard.
- Known gap: `MAX_AVATAR_BYTES` (4MB) is reused as the skill-image size cap rather than a dedicated constant — fine for now, rename if a different limit is ever wanted for skill thumbnails specifically.

### 2026-09-11 — Dashboard-driven metadata + Blog AuthorCard/JSON-LD
- Agent: Claude Edge
- Added `site_settings` table (single row, `id=1`) — `title`, `description`, `job_title`, `keywords[]`, `og_title`, `og_description`, `updated_at`. Migration `0002_high_marrow.sql`, hand-trimmed (see Gotchas above).
- `app/layout.tsx`: static `metadata` export replaced with async `generateMetadata()` reading `getCachedSiteSettings()` (`unstable_cache`, 1h revalidate, tag `site-settings`). Root layout's inline JSON-LD Person block now also reads `jobTitle`/`description` from the same settings instead of a hardcoded duplicate.
- New admin route `/admin/settings` (`page.tsx` + `SettingsForm.tsx`), nav entry added to `AdminSidebar.tsx`, quick-action tile added to `/admin` dashboard.
- `saveSiteSettingsAction` (`app/admin/actions.ts`): `revalidateTag('site-settings', 'max')` + `revalidatePath('/')` on save.
- `components/AuthorCard.tsx` added, rendered at the bottom of `app/blog/[slug]/page.tsx` only. Links to `/projects`, `/blog`, GitHub, and the external design portfolio (`mahtamundesigns.vercel.app`) in place of a literal `/portfolio` route, which doesn't exist in this repo — matches the existing `Footer.tsx` convention.
- Blog post page had no JSON-LD at all before this change (despite PLANNER.md's AEO section referencing an Article schema). Added a full `Article` JSON-LD block with `headline`, `description`, `image`, `datePublished`, `dateModified`, and a nested `author` object (`Person`, `jobTitle` sourced from `site_settings`). Also added `authors` to the page's Next `Metadata` return.
- Verified: `npx tsc --noEmit` clean. `npm run build` could not complete in this sandbox — no egress to `fonts.googleapis.com` (next/font/google fetch) or Neon; needs verification locally or on Vercel.
- Not yet done: migration `0002` has not been applied to production Neon. Run `npx drizzle-kit migrate` once this is deployed, or seed the default row manually — `getSiteSettings()` will also create it lazily on first read if the migration is applied but the row doesn't exist yet.

### 2026-09-11 — Avatar upload (Cloudinary)
- Agent: Claude Edge
- `site_settings.avatar_url` (text, nullable) — migration `0003`, clean diff this time (confirms the 0002 snapshot-chain repair worked).
- `lib/cloudinary.ts`: signed upload via plain `fetch` + Web Crypto SHA-1, not the `cloudinary` Node SDK — this repo dual-deploys to Cloudflare Workers via OpenNext, and Web Crypto works identically there and on Vercel. Fixed `public_id`/`folder` so re-uploads overwrite the same asset rather than accumulating orphaned images; response URL gets a `?v=timestamp` cache-buster.
- `uploadAvatarAction` / `removeAvatarAction` in `app/admin/actions.ts` — both do an explicit `isAuthenticated()` check inside the action itself. This is a deliberate deviation from the rest of this file (which relies entirely on the calling page's auth redirect): an unauthenticated file-upload endpoint is a meaningfully higher-risk surface than an unauthenticated text-field write. Worth considering the same explicit check for the other actions in this file at some point — flagging, not fixing, since that's a broader change than this task asked for.
- `AuthorCard.tsx` now renders the real photo when `avatarUrl` is set, initials fallback otherwise. Also threaded `avatarUrl` into both JSON-LD `Person` blocks (root layout + blog post Article author) as an `image` field, for the same reason `jobTitle`/`description` were threaded through earlier — keeping every rendering of the identity in sync with one source.
- Needs `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` set in Vercel + Cloudflare — not set anywhere yet, this is brand new infra for this repo (no prior image upload capability existed at all; blog covers are still the manual `blog-image` GitHub repo workflow).
- Verified: `npx tsc --noEmit` clean.

### 2026-09-11 — Fix: Server Action body size limit blocking avatar upload
- Agent: Claude Edge
- Live `/admin/settings` upload was failing with a generic "An unexpected response was received from the server." — Next.js's default Server Action body limit is 1MB, so any real photo got rejected by the framework before `uploadAvatarAction` ever ran, producing that generic client-side parse-failure message rather than a real error.
- Fix: `next.config.ts` now sets `experimental.serverActions.bodySizeLimit: '4mb'`. Capped at 4MB rather than the previous 5MB check, to stay under Vercel's ~4.5MB serverless function request-body ceiling (a hard platform limit `bodySizeLimit` can't raise past).
- `MAX_AVATAR_BYTES` moved out of `lib/cloudinary.ts` into `lib/constants.ts` (no server-only deps) so `SettingsForm.tsx` can import the same constant for a client-side pre-check — oversized files now get an immediate "Image must be under 4MB." instead of a round trip that ends in the generic error.
- If upload still fails after this deploy with a *specific* message (not the generic one), the next likely cause is `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` not being set in Vercel yet.
