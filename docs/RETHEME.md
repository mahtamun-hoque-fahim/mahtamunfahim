# Retheme brief (branch `rethemed`)

Locked on 2026-10-19 with Fahim. This brief is the source of truth for the `rethemed` branch. Where it disagrees with DESIGN_GUIDE.md or the AGENTS.md conventions (dark-first palette, Syne / Plus Jakarta Sans, mint accent), this brief wins on this branch, and those docs get rewritten as each phase lands.

## 1. Locked decisions

| Area | Decision |
|---|---|
| Background | White. Light theme only on the public site. |
| Accent | Royal blue `#2563FF` (about 4.9:1 on white, OK for text and buttons; was #2563EB until 2026-10-20). |
| Style | Minimal: lots of white space, thin lines, few colours, no heavy effects. |
| Headline font | Plus Jakarta Sans (Google Fonts), with italic words used as the accent. Was Instrument Serif until 2026-10-20 (Fahim switched it). |
| Body font | Inter (Google Fonts). |
| Audience | Small businesses and founders: local and online businesses (e-commerce, F-commerce, service businesses) that need a website and brand that bring customers. |
| Main offer (bottom of the funnel) | A free 30-minute website audit. Every page leads to it. |
| Structure | Funnel-based, top / middle / bottom (TOFU / MOFU / BOFU), section rhythm inspired by aevonbd.vercel.app. |
| Voice | Solution-centric and client-centric, not engineer-centric (rules in section 4). |

Unchanged from the current site: motion stays CSS-first (`Reveal`, `BlurWords`, no animation library), no emojis (lucide-react icons only), Next.js / Neon / Drizzle stack, and content stays editable from the dashboard.

## 2. Visual tokens (starting values)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FFFFFF` | Page |
| `--surface` | `#F7F8FA` | Cards, bands, the marquee strip |
| `--line` | `#E5E7EB` | Borders, dividers, `gap-px` grid colour |
| `--line-strong` | `#D1D5DB` | Hover borders |
| `--text` | `#0B0F19` | Headings and body |
| `--muted` | `#5B6475` | Secondary text (about 6:1 on white) |
| `--accent` | `#2563FF` | Buttons, links, italic headline words, focus rings |
| `--accent-hover` | `#1D4ED8` | Button hover |
| `--accent-soft` | `#EFF4FF` | Tinted badges and highlighted panels |

- Headlines: Plus Jakarta Sans, tight leading; one or two words per headline in italic blue.
- Labels and eyebrows: Inter, small caps-style uppercase with wide tracking (JetBrains Mono is dropped).
- Buttons: primary is solid blue, pill-shaped; secondary is a white button with a `--line` border.
- Film grain: removed (it was made for the dark page). Ambient glow: removed or replaced by a very faint blue wash behind the hero only.
- Hero portrait: kept (the B&W cutout reads well on white).
- Admin dashboard: light too, same tokens as the public site (decided 2026-10-19, done right after phase 1).

## 3. Funnel structure

### Homepage, top to bottom

| # | Section | Funnel stage | Job |
|---|---|---|---|
| 1 | Hero | TOFU | An outcome headline for the client, one line saying who it is for, primary CTA "Get a free website audit", secondary "See client work", and a small reassurance line ("30 minutes. No obligation."). |
| 2 | The problem | TOFU | Name the pains a small business recognises: the site looks outdated, loads slowly, is not found on Google, gets visitors but no enquiries, worries about being hacked. A simple before / after contrast. |
| 3 | What I solve (services as outcomes) | TOFU to MOFU | Each service framed as a result and what the client gets: a brand people remember (design), a website that turns visitors into enquiries (web development), a site that stays fast and safe (security), less manual work with smart automation (AI). Fed by the `skills` table. |
| 4 | Who I help (strip) | TOFU | Marquee of business types (e-commerce shops, F-commerce sellers, clinics, restaurants, service businesses...). Reuses `MarqueeStrip`. |
| 5 | Work as case studies | MOFU | Each project as problem, what I did, result. Only real results; when there is no number, say what changed. |
| 6 | How it works | MOFU | Four steps: free audit, a clear plan and fixed price, build, launch and support. |
| 7 | Why work with me | MOFU | Trust points: you own everything (domain, code, accounts), clear pricing up front, direct contact with the person doing the work, support after launch. Plus a short About teaser. |
| 8 | Testimonials | MOFU | Only when real ones exist. Never invented. Hidden while empty. |
| 9 | Ways to work together | BOFU | Engagement options, for example a one-time project, a website care plan, design-only work. Prices optional ("from ..."). |
| 10 | Guides (blog teaser) | TOFU (for search) | Two or three posts written for business owners. Kept small. |
| 11 | FAQ | BOFU | Objections answered: cost, timeline, "I already have a website", who updates it, hosting, ownership. |
| 12 | Final CTA | BOFU | The free audit again, with what they will get from it. |

### Other pages

- Navbar: Services, Work, Process, About, Blog, plus a blue "Free audit" button that is always visible.
- `/contact` becomes the audit request: name, business, website link (optional), main goal, budget range, timeline. Shorter forms win; every field must earn its place.
- `/projects`: case-study cards (problem, solution, result) instead of a tech list. Tech tags move to a secondary line.
- `/about`: the story told as "why this matters to your business", ending on the audit CTA.
- `/credentials`: removed on `discovered-funnel` (page, dashboard and tables), at Fahim's request.
- `/blog`: written for owners (TOFU). Every post ends with the audit CTA.

## 4. Copy rules

1. Lead with the client's problem or the result, never the technology. "Your website should bring you customers" beats "I build secure web architecture".
2. Write "you" more than "I". Fahim appears as the guide, the client is the hero.
3. One idea per headline. Concrete over clever.
4. Tech names (Next.js, Postgres...) only in case-study details, never in headlines.
5. Every section ends by pointing to the next step, and the last step is always the free audit.
6. No invented numbers, clients, logos or testimonials. A claim on the site must be true.
7. Plain, warm English that a busy shop owner understands on a phone.

Example from the current site:

- Now: "Fahim, an Aspiring AI Engineer. I build better, more secure web architecture."
- Direction: "Websites that bring you *customers*, not just compliments." / "I design and build fast, secure websites for small businesses and founders, so more visitors become enquiries."

## 5. What is taken from aevonbd.vercel.app

Structure and rhythm only, not its copy, brand or colours: outcome headline plus a free-audit CTA with a reassurance line; a problem section before any services; a before / after contrast; services described by what they do for the business; an industries strip; worked examples clearly labelled; a numbered process; a trust section; engagement models; FAQ for objections; a closing CTA that repeats the offer.

## 6. Build phases

1. Foundation: tokens, fonts, light palette across the public site, grain and glow removed. (Everything still works, just rethemed.)
2. Homepage restructure and new copy, sections 1 to 12.
3. Navbar and the audit request on `/contact`.
4. Inner pages: projects as case studies, About, blog post CTA.
5. Dashboard editing for the new sections (problem points, process steps, trust points, engagement options, FAQ, testimonials) with migrations, added before the code that reads them.

Each phase is its own commit (or PR), checked in the live preview before the next starts.
