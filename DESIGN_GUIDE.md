# DESIGN_GUIDE.md — Mahtamun Personal Website

> **Rule:** Update this file every time you change a color, token, component pattern, or layout convention.
> It is the single source of truth for the visual system.

---

## 1. Brand Identity

**Site name:** `Mahtamun`  
**Tagline:** Designing the gap between beauty and function.  
**Tone:** Direct, minimal, confident. No buzzwords. No fluff.  
**Audience:** Potential clients, collaborators, employers — people who value craft.

---

## 2. Color System

Light theme on the public site since the 2026-10 retheme (branch `rethemed`, brief in `docs/RETHEME.md`). White page, one blue accent, gray lines, no glow and no grain. The admin dashboard uses the same light palette (since 2026-10-19), with the same hex values; its error and warning text uses Tailwind `red-600` / `amber-700` for contrast on white.

### CSS Variables

```css
/* app/globals.css */
:root {
  --bg:           #FFFFFF;  /* page */
  --surface:      #F7F8FA;  /* cards, bands, the marquee strip, inputs, code blocks */
  --line:         #E5E7EB;  /* borders, dividers, gap-px grid colour */
  --border:       #E5E7EB;  /* legacy name of --line */
  --line-strong:  #D1D5DB;  /* hover borders */
  --text:         #0B0F19;  /* headings and body */
  --text-body:    #374151;  /* long-form paragraphs (blog prose) */
  --muted:        #5B6475;  /* secondary text */
  --accent:       #2563FF;  /* buttons, links, italic headline words, focus rings */
  --accent-hover: #1D4ED8;  /* button hover */
  --accent-dim:   #1D4ED8;  /* legacy name of --accent-hover */
  --accent-soft:  #EFF4FF;  /* tinted badges and highlighted panels */
}
```

### Named Palette (reference)

| Token / hex     | Hex       | Usage | Contrast on white |
|-----------------|-----------|-------|-------------------|
| `--bg`          | `#FFFFFF` | Page, the cells of `gap-px` grids, the mobile menu | |
| `--surface`     | `#F7F8FA` | Cards, panels, inputs, code blocks, the marquee band, hover fill on grid cells | |
| `--line`        | `#E5E7EB` | All borders, dividers, grid lines (the `bg` of a `gap-px` grid), timeline line | |
| `--line-strong` | `#D1D5DB` | Hover borders, secondary-button hover border, decorative ghost text (404 number, marquee separators) | decorative only |
| `--text`        | `#0B0F19` | Headings, primary text | about 19:1 |
| `#374151`       | `--text-body` | Body copy inside `prose-dark` blog content | about 10:1 |
| `--muted`       | `#5B6475` | Secondary text, meta info | about 6:1 |
| `#6B7280`       | (no token) | Dim text: placeholders, ghost numbers, inactive states | about 4.8:1 (AA) |
| `--accent`      | `#2563FF` | Primary buttons, links, active nav underline, icons, content labels, focus rings | about 4.9:1 |
| `--accent-hover`| `#1D4ED8` | Primary button hover | about 6.7:1 |
| `--accent-soft` | `#EFF4FF` | Tinted badges, copy-button hover in blog code blocks | |

Text on a blue button is `#FFFFFF`. Translucent accents (`bg-[#2563FF]/10`, `border-[#2563FF]/20`) are fine for badges. Syntax highlighting in blog code blocks uses a light, GitHub-style set (`.hl-*` in `globals.css`).

Old dark-to-light mapping used in the retheme (useful when touching code that still has a dark value): `#111111` to `#FFFFFF`, `#222222` to `#F7F8FA`, `#333333` to `#E5E7EB` (as text: `#D1D5DB`), `#444444` to `#D1D5DB`, `#F3F6F4` to `#0B0F19`, `#8A938E` to `#5B6475` (as a hover border: `#D1D5DB`), `#5C615E` to `#6B7280`, `#C7CCCA` to `#374151`, `#3DF49A` to `#2563FF`, `#5BFBA8` to `#1D4ED8`, `#06160E` (text on mint) to white.

### Dark bands (focus shifts)

The light page is broken by full-bleed dark bands where attention matters most (pattern borrowed from AEVON and Tradefigur): on `discovered-funnel` the cost moment (the slide-up "Looks nice, but does it bring customers?" panel), How I work with its free-audit pitch (added 2026-10-20 at Fahim's request), and the final audit CTA. Every dark band carries `data-nav-dark` so the navbar turns dark over it. Keep them few; more and they stop standing out.

| Role | Hex | Contrast on `#0B0F19` |
|------|-----|------------------------|
| Band background | `#0B0F19` (the `--text` colour) | |
| Headings | `#FFFFFF` | about 19:1 |
| Body text, small print | `#A3ACBD` | about 8.5:1 |
| Eyebrow / accent text | `#60A5FA` (the accent `#2563FF` is too dark for text here) | about 7.6:1 |
| Inner panels, lines | `#111827`, `#1F2937` | |
| Highlight panel ("After") | `#2563FF` with white text, `#DBEAFE` label | 4.9:1 |

Markup: `<section className="bg-[#0B0F19]">` with the usual `max-w-6xl mx-auto px-6` container inside, so the colour runs edge to edge. Primary buttons stay solid blue; never use `#6B7280` or `#5B6475` text on the dark band (below 4.5:1).

### Offer cards (Ways to work together)

The three offer cards on the homepage are blue, black and white, in that order (`offerThemes` in `app/page.tsx`, cycled if more offers are added). Blue: `#2563FF` card, white title, text and semibold link (4.9:1). Black: `#0B0F19` card, white title and fit line, `#A3ACBD` text, `#60A5FA` link (the dark-band colours above). White: white card with a `#E5E7EB` border, `#0B0F19` title, `#374151` text. Each card ends in a pill button "Start with a free audit" (with an arrow) to `/contact` that contrasts with its card: white with blue text on the blue card, blue on the black card, black on the white card. Motion (`.offer-stack` in `globals.css`, from `md` up): out of view the three cards lie piled on the middle one, tilted -5deg, 2deg and 6deg; once the row scrolls into view (`Reveal` sets `data-revealed`) they slide out into the tidy row, 850ms each, 120ms apart, after a 250ms pause. Transform only; phones keep the plain column.

### Convention: Hardcoded Hex Over Mapped Tokens

This codebase consistently uses hardcoded hex literals (`bg-[#2563FF]`) for one-off color usage rather than the mapped Tailwind tokens (`bg-accent`). Both work — Tailwind's JIT scans for the literal class string in source and generates valid CSS either way — this is purely an established convention for this project, not a technical limitation.

```tsx
// Established convention in this codebase
<p className="text-[#2563FF]">Hello</p>

// Also valid, but inconsistent with the rest of the codebase
<p className="text-accent">Hello</p>

// Also valid for one-offs tied to a CSS custom property directly
<p style={{ color: 'var(--accent)' }}>Hello</p>
```

The Tailwind color extensions (`accent`, `surface`, etc.) in `tailwind.config.ts` exist for documentation/reference and for any future component that wants to opt into the mapped tokens. Because the hex values are hardcoded, a palette change means a role-aware find-and-replace across `app/` and `components/`.

---

### Icon (the "m." mark)

A lowercase "m" with a blue `#2563FF` dot at its foot (Fahim's mark, from 2026-10-19). Files:

| File | Use |
|------|-----|
| `app/icon.svg` | Favicon. The "m" is `#0B0F19` on light browser themes and white on dark ones (`prefers-color-scheme` inside the SVG); the dot stays blue. viewBox cropped to `8 8 360 360`. |
| `app/apple-icon.png` | iOS home screen, 180px: white "m" on `#0B0F19`. Next serves both as `<link>` tags automatically. |
| `public/images/mark-white.svg` | The original artwork (white "m", transparent), for dark backgrounds. |
| `public/images/icon-512.png` | 512px square on `#0B0F19`, for anything that needs a raster icon (profiles, manifests, emails). |

The navbar keeps the "mah tamun." wordmark (`components/Logo.tsx`); the mark is the short form.

## 3. Typography

### Font Stack

| Role      | Font             | CSS variable (use this) | Loaded as            | Tailwind class | Weights |
|-----------|------------------|-------------------------|----------------------|----------------|---------|
| Headlines | Plus Jakarta Sans | `var(--font-clash)`     | `--font-plus-jakarta` | `font-display` | 400–800, normal and italic |
| Body      | Inter            | `var(--font-jakarta)`   | `--font-inter`       | `font-body`    | variable (100–900) |
| Labels    | Inter            | `var(--font-jetbrains)` | `--font-inter`       | `font-mono`    | 400–500 |
| Code      | system monospace | `var(--font-code)`      | (none, system stack) | —              | — |

Both fonts load through `next/font/google` in `app/layout.tsx` (self-hosted at build time, zero layout shift; the build therefore needs network access to Google Fonts). JetBrains Mono, Syne and Plus Jakarta Sans are no longer loaded.

**Naming quirk:** the variable names are historical. `--font-clash` (once Clash Display, then Syne) now points at Plus Jakarta Sans (Instrument Serif before 2026-10-20); `--font-jakarta` and `--font-jetbrains` both point at Inter. They are aliases in `app/globals.css` `:root`, kept so the many inline `style={{ fontFamily: 'var(--font-...)' }}` uses did not have to change. New code may keep using them. Real monospace (blog code) uses `--font-code`.

**No fake bold:** `html { font-synthesis-weight: none; }` stays: it was added for Instrument Serif (one weight) and is harmless with Plus Jakarta Sans, which ships real 400 to 800 weights. Headings that carry `font-bold` therefore really are bold now; most homepage headings carry no weight class and render at 400.

### Usage Patterns

```tsx
// Headline (hero, section titles), regular weight; one or two words in italic blue
<h2 style={{ fontFamily: 'var(--font-clash)' }}>
  Websites that bring you <em className="text-[#2563FF]">customers</em>
</h2>

// Body copy
<p style={{ fontFamily: 'var(--font-jakarta)' }}>...</p>

// Labels, tags, meta info (uppercase Inter with wide tracking)
<span className="text-xs tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-jetbrains)' }}>Label</span>
```

### Type Scale

| Element            | Size                          | Font             | Weight |
|--------------------|-------------------------------|------------------|--------|
| Hero heading       | `clamp(2.75rem, 5.5vw, 5rem)` | Plus Jakarta Sans | 400 |
| Page heading (H1)  | `clamp(2.5rem, 7vw, 6rem)`    | Plus Jakarta Sans | 400 (inner-page h1: 700) |
| Section heading    | `text-4xl` – `text-6xl`       | Plus Jakarta Sans | 400 (inner-page h1: 700) |
| Card heading       | `text-xl` – `text-2xl`        | Plus Jakarta Sans | 400 (inner-page h1: 700) |
| Body text          | `text-base` – `text-lg`       | Inter            | 400 |
| Small / meta       | `text-xs` – `text-sm`         | Inter            | 400–500 |
| Content labels     | `text-xs`, tracking `0.15em+`, uppercase | Inter | 400–500 |

### No eyebrows

Section and page headings stand on their own: no small uppercase label above them (removed from the homepage and the About, Blog and Contact headers on 2026-10-19, at Fahim's request). Small uppercase labels are still fine where they label content rather than a heading: the Before/After panels, blog card tags, footer column titles.

---

## 4. Spacing & Layout

### Max Width

All content is constrained to `max-w-6xl` (`72rem`) centered with `mx-auto px-6`.

### Padding Conventions

| Context           | Value                    |
|-------------------|--------------------------|
| Page top (navbar) | `pt-32` (clears fixed nav)|
| Section vertical  | `py-16` – `py-28`         |
| Card inner        | `p-6` – `p-8`             |
| Border gaps       | `gap-px bg-[#E5E7EB]` (CSS grid trick for 1px dividers between cards) |

### Grid System

- **3-column service grid:** `grid-cols-1 md:grid-cols-3 gap-px bg-[#E5E7EB]` with `bg-[#FFFFFF]` children — creates seamless 1px separators
- **2-column content split:** `grid-cols-1 md:grid-cols-2 gap-16`
- **Blog list:** `space-y-0` with `border-b border-[#E5E7EB]` per row

---

## 5. Component Patterns

### Buttons

```tsx
// Primary CTA — filled accent, rounded-full
<button
  className="px-7 py-3 bg-[#2563FF] text-white text-sm font-semibold rounded-full
             hover:bg-[#1D4ED8] transition-[background-color,transform] duration-200 active:scale-[0.97]"
  style={{ fontFamily: 'var(--font-jakarta)' }}
>
  Let's talk
</button>

// Secondary — ghost border, rounded-full
<button
  className="px-7 py-3 border border-[#E5E7EB] text-[#0B0F19] text-sm rounded-full
             hover:border-[#D1D5DB] transition-[border-color,color,transform] duration-200 active:scale-[0.97]"
  style={{ fontFamily: 'var(--font-jakarta)' }}
>
  About me
</button>

// Admin / small action — border, rounded-lg
<button
  className="text-xs px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-[#5B6475]
             hover:text-[#2563FF] hover:border-[#2563FF] transition-colors"
  style={{ fontFamily: 'var(--font-jakarta)' }}
>
  Edit
</button>
```

**Admin control states.** Every button and field inside `[data-admin]` gets the same five states from `globals.css`, whatever its own classes say: default and hover (hover on fields: `#D1D5DB` border), keyboard focus (buttons: the global 2px blue outline; fields: blue border plus a 3px `rgba(37,99,255,0.15)` ring), pressed (`scale(0.97)`), disabled (50% opacity, `not-allowed` cursor). Choice buttons (like the testimonial tile size) also show a selected state: blue border and text on `#EFF4FF`, with `aria-pressed`. Combine conditional classes with `cn()` (tailwind-merge): plain string concatenation of two `border-[...]` colours lets the CSS order pick the winner, which is how the selected size used to look unselected.

### Cards / Surface Panels

```tsx
<div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-6 md:p-8">
  ...
</div>
```

Hover state on interactive cards: `hover:bg-[#F7F8FA]` or `hover:border-[#D1D5DB]`.

### Status Badges (blog and admin)

```tsx
// Published / active
<span className="text-xs px-2 py-0.5 bg-[#2563FF]/10 text-[#2563FF] border border-[#2563FF]/20 rounded-full"
  style={{ fontFamily: 'var(--font-jetbrains)' }}>
  Published
</span>

// Draft / inactive
<span className="text-xs px-2 py-0.5 bg-[#E5E7EB] text-[#5B6475] border border-[#E5E7EB] rounded-full"
  style={{ fontFamily: 'var(--font-jetbrains)' }}>
  Draft
</span>
```

### Availability Pulse

```tsx
<div className="flex items-center gap-2">
  <span className="w-2 h-2 rounded-full bg-[#2563FF] animate-pulse" />
  <span className="text-[#2563FF] text-xs tracking-[0.25em] uppercase"
    style={{ fontFamily: 'var(--font-jetbrains)' }}>
    Available for work
  </span>
</div>
```

### CTA glow (removed)

The closing "Reach Out!" section used to have a faint radial glow; it was removed in the 2026-10 light retheme along with the page-wide ambient glow. The section is a plain `--line` bordered panel now.

### Code Aesthetic Block

Terminal-style card used in the homepage personality section:

```tsx
<div className="bg-[#222222] border border-[#333333] rounded-xl p-8"
  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
  {/* Traffic light dots */}
  <div className="flex gap-2 mb-6">
    <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
    <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
    <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
  </div>
  ...
</div>
```

### Skills Ticker (Marquee)

```tsx
<div className="overflow-hidden border-y border-[#333333] py-4 bg-[#222222]">
  <div className="flex gap-12 animate-marquee whitespace-nowrap">
    {ticker.map((skill, i) => (
      <span key={i} className="text-sm tracking-widest uppercase shrink-0"
        style={{ color: i % 3 === 0 ? '#3DF49A' : '#8A938E' }}>
        {skill}
        <span className="ml-12 text-[#333333]">◆</span>
      </span>
    ))}
  </div>
</div>
```

The `animate-marquee` keyframe runs `translateX(0% → -50%)` over 30s. Array must be doubled (`[...skills, ...skills]`) for seamless looping, and the track must be `w-max`: `translateX(-50%)` is half of the track's OWN width, so a track that is only as wide as its container loops at the wrong point.

`components/MarqueeStrip.tsx` is the ONE strip component, used by the homepage "who I help" strip (it also served the `/projects` technologies strip until that page was removed): a full-bleed `#F7F8FA` band with `#E5E7EB` top and bottom lines. It doubles the list itself, marks the second copy `aria-hidden`, pauses on hover, and sets the speed in pixels per second: the animation duration is `distance / speed`, where distance is the measured width of one copy (re-measured on resize and when fonts load), so a long list and a short one move at the same pace. The speed is `site_settings.marquee_speed` (default 60 px/s, range 10-200), edited with the "Strip speed" slider in Admin > Settings. The seam is exact because spacing lives inside each item (`mx-12` on the separator) and not in a flex `gap`: with a gap, half the track would be half a gap short of one copy and the loop would jump. Items on `/projects` are the unique project tags, most used first.

### Navbar

- Floating pill, `fixed top-4`, `z-50`, solid fills, no blur or transparency: `bg-white` with a `#E5E7EB` border on light sections, a soft shadow once `scrollY > 40`
- Over a dark section (any element with `data-nav-dark` behind the pill) it turns `#1F2937`, one step lighter than the `#0B0F19` section so the pill still reads as a separate bar, links `#A3ACBD` (hover white), active `#60A5FA`, white logo and hamburger. The open mobile menu keeps the light pill
- Logo: the wordmark SVG in `currentColor` with a blue dot
- Active link: `text-[#2563FF]` + `1px` underline via absolute `<span>`; other links slide the same underline in from the left on hover
- Hidden on `/admin/*` routes
- Mobile: full-screen overlay. Links fade, rise and de-blur in with a staggered `transitionDelay` (80ms + 50ms per link); closing is immediate. The closed menu is `invisible` so its links leave the tab order. Esc closes it, body scroll is locked while open, and the button carries `aria-expanded`.

### Footer

- `border-t border-[#333333] mt-24 py-12 px-6`
- Three columns: logo + tagline | nav links | copyright year
- Year is dynamically rendered: `new Date().getFullYear()`

---

## 6. Global CSS Utilities

Defined in `app/globals.css` under `@layer utilities`:

| Class            | Effect                                               |
|------------------|------------------------------------------------------|
| `.text-balance`  | `text-wrap: balance` — even heading line lengths     |
| `.mask-fade-right` | Gradient mask fading content to the right          |
| `.border-glow`   | `box-shadow: 0 0 0 1px var(--accent), 0 0 20px rgba(61,244,154,0.1)` |

### Special Effects

- **Film grain:** removed in the 2026-10 light retheme (see section 8).
- **Scrollbar:** 4px wide, accent-colored thumb, bg-colored track
- **Selection:** `background: var(--accent)`, `color: #06160E`

---

## 7. Blog — `prose-dark` Styles

Blog post content is rendered from Markdown via a custom `renderMarkdown()` function (`lib/markdown.ts`) — **no external library**. Styles live in `app/globals.css` under `.prose-dark`.

| Element      | Style                                                        |
|--------------|--------------------------------------------------------------|
| Headings     | Syne (`--font-clash`), 700, `var(--text)`, margins: `2rem` top / `0.75rem` bottom |
| Body `<p>`   | Plus Jakarta Sans, `#C7CCCA`, `1.25rem` bottom margin                   |
| `<a>`        | `var(--accent)`, underline, 3px offset                       |
| Inline `<code>` | `var(--surface)` bg, `var(--border)` border, accent text, JetBrains Mono |
| `<pre>`      | `var(--surface)` bg, 8px radius, scrollable overflow        |
| `<blockquote>` | 3px left border accent, italic, muted color               |
| `<img>`      | Full width, 8px radius, `var(--border)` border, `1.5rem` vertical margin |
| `<hr>`       | `var(--border)` top border                                   |

---

## 8. Animations

### Principles

- **CSS-first.** No animation library. `framer-motion` is installed but unused; adding it would cost bundle for no gain here.
- **Animate `opacity`, `transform` and (sparingly) `filter` only.** Never `transition-all`; list the properties (`transition-[background-color,transform]`).
- **Reveal once.** Scroll reveals play a single time per page view, then the observer is dropped.
- **Motion never delays reading.** Headings may reveal per word; paragraphs reveal as one block. Not used on blog post bodies, nav, footer, form fields or `/admin`.
- **Reduced motion is global.** `@media (prefers-reduced-motion: reduce)` in `globals.css` collapses every animation and transition to 0.01ms, so content simply appears.
- **Hidden states only exist under `@media (scripting: enabled)`**, so visitors without JS see all content.

### Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--ease-out` / `ease-ui-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | entrances, press feedback |
| `--ease-in-out` / `ease-ui-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | on-screen movement (hamburger bars) |

Durations: press 200ms, hover 150-300ms, route fade 180ms, block reveal 900ms, per-word reveal 800ms with a 70ms stagger between words. Hero delays: sub text 340ms, buttons 480ms, stats 620ms. Everything is driven by CSS variables (`--reveal-duration`, `--word-duration`, `--stagger`, `--reveal-delay`) with the defaults in `globals.css`, so retiming is a one-line change.

### Blur reveal (the signature effect)

Fade + 6px blur + 8px rise. The keyframes define only `from` and use `backwards` fill, so the end state is the element's normal style: no leftover blur layer or stacking context, and elements with their own opacity (dimmed cards) or hover styles keep working. Do not switch the fill to `both`/`forwards`: that pins `opacity: 1` and silently overrides those.

| Piece | What it does |
|-------|--------------|
| `components/BlurWords.tsx` | Per-word blur-in. `mode="load"` is pure CSS (above the fold, no wait for hydration); `mode="scroll"` waits for view. Knobs: `delay`, `stagger` (ms between words), `duration` (ms per word). |
| `components/Reveal.tsx` | Client wrapper, one IntersectionObserver, sets `data-revealed` once. Props: `as`, `delay`, `blurSelf={false}` for wrappers whose children animate. |
| `.blur-load` | CSS-only entrance for above-the-fold blocks; delay via `--reveal-delay`. |
| `.blur-stagger` | On a `Reveal` container of a small set of independent cards (e.g. a grid of small cards): children reveal in turn (110ms steps, capped at 660ms). Observed once for the whole container, so do not use it on tall lists. |
| Card in a `gap-px` grid | The cell (background, 1px lines, hover) stays visible; wrap only the card CONTENT in `<Reveal>` so each card blurs in on its own as it scrolls into view (see `ProjectCard`, home blog teaser). Hiding the cell itself would show the grid colour through it. Stagger cards that share a row with `delay={(index % columns) * 180}`. |
| Tall list of bordered cards | Wrap each card in its own `<Reveal>` (see `/blog`); image cards use `--blur-from: 3px` to keep the reveal cheap. |

### Film grain

Removed in the 2026-10 light retheme (`body::before` and `public/grain.png` deleted). It existed to dither the dark glow's banding, which a white page without a glow does not have.

### About page headline

Two lines from the dashboard (headline, then the blue line). From `lg` up each stays on one row (`lg:whitespace-nowrap`) at `min(5.2vw, 4.5rem)`, so the headline is exactly two lines; measured with the current copy, the longer line uses about 1064 of 1104px at 1366 and 1078px at 1920. Much longer copy in Admin > About would run past the container, so keep each line to about 32 characters. Phones and tablets keep `clamp(2.5rem, 7vw, 6rem)` and wrap.

### About page blocks

Two text blocks above the call to action: the EXTRA block (heading plus text, hidden while both are empty) and the STORY block ("The honest story"). How they are arranged is a dashboard switch, `about_content.layout`, edited in Admin > About > Layout (column split 36.5% / 63.5% in every layout, no borders):

| Layout | What it shows |
|--------|---------------|
| `beside` (default) | Both blocks with the image on the LEFT and the text on the right (the story used to have its image on the right). Two square images (`extra_image_url`, `story_image_url`). |
| `text` | No images. The two blocks stacked, each text column `max-w-2xl`. |
| `tall` | One tall image (`tall_image_url`, 3:4, 4:3 on phones) pinned on the left with `position: sticky` (`md:sticky md:top-28`, `md:max-h-[calc(100vh-9rem)]` so it never outgrows the window) while the two text blocks scroll on the right. Without a tall image it falls back to `text`. |

Every part is optional: a block without an image lets its text take the full width, and switching layouts never deletes an uploaded image (the three slots are separate). On phones every layout stacks, image first, nothing pinned. Images are lazy-loaded, reveal with a light blur, and are `rounded-xl` with `object-cover`. `fitImage(url, w, h)` in `app/about/page.tsx` asks Cloudinary for a smart-cropped (`g_auto`), compressed, best-format version at the displayed size (900x900 for the squares, 1200x1600 for the tall one). Everything is edited in Admin > About, including the image uploads (Cloudinary, `mahtamunfahim/about/about-extra`, `about-story`, `about-tall`); the dashboard shows the recommended ratio and resolution next to each upload (square 1:1, at least 900 x 900; tall 3:4, at least 900 x 1200). `position: sticky` works because `body { overflow-x: hidden }` propagates to the viewport as long as `html` has no overflow of its own: do not add `overflow` to `html` or to any wrapper around the About page.

### About page blocks

Two text blocks above the call to action, laid out as a wireframe (the cell borders in that wireframe were only explanatory; the real page has none): the EXTRA block (new) is image on the left (36.5% of the width) and heading plus text on the right; the STORY block is text on the left (63.5%) and image on the right. Both images are square (`aspect-square`, `object-cover`, `rounded-xl`), lazy-loaded, reveal with a light blur, and stack on phones (image first for the extra block, text first for the story). Every part is optional: the extra block does not render while its heading and text are both empty, and a block without an image lets the text take the full width. Everything comes from `about_content` and is edited in Admin > About (including the two image uploads, stored in Cloudinary at `mahtamunfahim/about/about-extra` and `about-story`). `squareImage()` in `app/about/page.tsx` asks Cloudinary for a 900px smart-cropped (`g_auto`), compressed, best-format version instead of the raw upload.

### Hero portrait

`components/HeroPortrait.tsx`, used once in the homepage hero. The full figure at natural proportions (`public/images/fahim-hero-blue-shirt.webp`, transparent colour WebP, 446 x 954, about 35 KB, cut at the thighs; `aspect-[446/954]`), no zoom, no mask, no glow. It lives inside a `relative` wrapper around the headline and intro row.
- **Vertical:** the bottom sits on the top border of the marquee strip (`bottom-[-4rem]`, equal to the hero container `pb-16`); the height comes from the screen, `min(100vh - 8rem, 40rem)`, not from the headline, so the headline length no longer changes the figure. **Zoom:** the box is `aspect-[452/731]` over a 452 x 969 photo with `object-cover object-top`, cropping the thighs so head and shoulders are about 1.3x larger.
- **Horizontal:** `right-[10.5%]` of the container, so he stands in the free column right of the headline, not against the edge.
- Behind the headline (`-z-10`), hidden below `sm`. Enters with `.blur-load` (220ms delay, 1.2s, 4px blur), so the route arrival gate holds it too. Plain `<img>` with `fetchPriority="high"` (the site does not use `next/image`). To change the photo, replace the WebP and update `width`/`height`.

The hero "Let's talk" / "About me" buttons are behind `const SHOW_HERO_CTAS = false` at the top of `app/page.tsx`. Set it to `true` to bring them back; nothing else changes.

### Focus list (one card at a time)

`components/FocusCards.tsx` (client): only the child crossing a thin band in the middle of the screen (IntersectionObserver, `rootMargin: -45% 0px -45% 0px`) gets `data-active`; the others are faded and blurred by `.focus-cards` in `globals.css` (opacity 0.15, `blur(4px)`, 500ms opacity/filter transition, hidden state only under `@media (scripting: enabled)`). Used twice on `discovered-funnel`: the problem cards (cards right, "Which of these sounds like your website?" pinned left) and the trust cards in How I work (mirrored: cards left, heading, About teaser text and "Full story" link pinned right, `md:order-*`). Give the list big gaps (`gap-[18vh]`) so two cards never share the band, and half a screen of vertical padding (`md:py-[50vh]`) so the title column is already pinned whenever any card is centred, which keeps the title (centred on the screen, no navbar offset) on the same level as the card.

Scroll snapping, for the whole homepage, is a separate component rendered once on the page, `components/SnapScroll.tsx`: it puts `snap-zone` on `<html>` (`scroll-snap-type: y mandatory`) while the page is mounted. Stops: the hero and the dark bands (`snap-start`), every light section (`snap-start scroll-mt-24`, so its top lands below the navbar), and each focus card (`snap-center`). Snapping ends at the final dark CTA (`data-snap-end`): it is still a stop, but from its top down the page scrolls freely (the class comes off and the wheel handler stands back), so the footer is plain scrolling. Because several stops are further apart than one wheel step (the browser would snap back), a `wheel` listener moves to the next or previous stop itself, one stop per gesture (800ms lock for trackpad bursts), and lets a section taller than the screen scroll normally until its end. Keyboard and touch use the plain CSS snapping. Reduced motion makes the jumps instant.

### Guided map (How it works)

The process steps on the homepage (`discovered-funnel`) are a long vertical map: a winding road from `md` up (an SVG behind the notes, `roadPath` in `app/page.tsx`: a 34px `#E5E7EB` band with white 12/14 centre dashes, `vector-effect: non-scaling-stroke` so the stretched viewBox does not distort the widths; it passes through every pin and swings out to alternating sides between them); its two ends fade out (`.road-fade` mask, 12% at the top and bottom), and a straight dashed `#D1D5DB` line on the left on phones, a solid blue numbered pin per step on the path (white ring so the path breaks around it), and one "sticky note" per step on alternating sides: `#EFF4FF` paper, `rounded-sm`, a soft drop shadow, a translucent blue strip of "tape" on top, tilted 1.5deg one way or the other and straightening on hover (`transform` transition only). Each row is at least 70vh tall, each note is a snap stop (`snap-center`) and blurs in with `Reveal`. The heading is its own stop (a `snap-start` wrapper, not the section), because `SnapScroll` lets the wheel scroll freely inside any stop taller than the screen. No step label above the note title: the pin carries the number. Step glow (`components/RoadGlow.tsx`, which renders the road SVG): a blue radial glow (140px radius, `#2563FF` at 55% fading to 0) marks the current step, the row nearest the middle of the screen. When the current step changes it travels slowly along the road (eased, 3.5% of the remaining distance per frame, about two seconds) and settles on that step's pin. It is painted as a stroke on the road only, so it never leaves the road, fades at both road ends with `.road-fade`, and fades in and out (opacity, 500ms) as the section enters and leaves the screen. Under reduced motion it jumps instead of travelling.

### Slide-up panel

The dark "Looks nice, but does it bring customers?" section on the homepage is a full-screen panel (`min-h-screen`, content centred, `rounded-t-[2.5rem]`) that rises 18vh into place, like a sheet, the first time it enters the view: a `Reveal as="section" blurSelf={false}` with `.slide-up` (globals.css, `transform` only, 900ms, `from`-only keyframes with `backwards` fill, hidden offset only under `@media (scripting: enabled)`). `SnapScroll` measures stops by layout position (`offsetTop` chain), not the on-screen box, so the panel's waiting offset and the tilted notes do not shift their stops.

### Before / after cards

Inside the slide-up panel (title and subtitle centred): two tall cards in a centred `max-w-5xl` container (`rounded-3xl`, `md:p-12`, `md:min-h-[20rem]`), Before in `#111827`, After in solid `#2563FF` with a deep shadow. From `md` up, while out of view (`.ba-cards` without `data-revealed`), the After card lies on top of the Before card, both tilted 1deg (kept subtle on purpose); when the `Reveal` wrapper enters the view they spread apart (750ms `transform` transition, 200ms delay), then each After line pops a tick: a `#16A34A` circle with a white lucide `Check`, using the existing `pop-in` keyframes (from 70% scale), 950ms plus 220ms per line. Keep the panel content within one screen (it is `min-h-screen`): at 727px high it measures 656px. Green appears only here, as the "fixed" signal. Phones: cards stacked, no overlap, ticks still pop.

### Portfolio

`/portfolio`: the h1 "Work that brings businesses customers." and one lead line, then the same bento grid as the testimonials (three columns from `md`, `wide` spans two columns, `tall` two rows, rounded `#F7F8FA` tiles). Each tile is one link to the item's page: the cover photo edge to edge at one fixed height for every tile size (`h-48` / `md:h-56`, `object-cover object-top`, a slight zoom on hover, transform only), then the client in muted text, the title in the headline font, the summary, and "See the project →". With nothing published the page shows one line pointing at the free audit, and the navbar has no Portfolio link. The grid is one component, `components/PortfolioGrid.tsx`.

Homepage: items marked featured (and published) show in "Work for businesses like yours." with an "All work →" link, in the same grid, just before "What clients say."; the section is not rendered while none is featured.

`/portfolio/[slug]`: back link, client, title (h1, bold), summary as the lead, the website link; the cover photo wider than the text (`max-w-6xl`, 16:9, `rounded-3xl`); the details as markdown in the blog prose style (`.prose-dark`, `max-w-3xl`); the gallery images full width, stacked, `rounded-3xl`; then a dark `#0B0F19` card asking for the free audit. Unpublished items 404.

### Testimonials bento grid

Homepage, in the proof part of the funnel: "What clients say." over a three-column bento grid (one column on phones) of rounded `#F7F8FA` tiles from Admin > Testimonials. Each tile opens with a screenshot of the client's website running to the tile's edges (one fixed height for every tile size, `h-48` / `md:h-56`, `object-cover object-top`, so the thumbnails in a row end on the same line whether a tile is normal, wide or tall), then the quote in the full ink at 18px and the client's name, role, business and website link. Tile size comes from the dashboard: `wide` spans two columns, `tall` two rows. Each tile reveals on scroll. The whole section is not rendered while no testimonial is published: never fill it with invented quotes.

### Other motion

| Where | Behavior |
|-------|----------|
| Route change | `app/template.tsx`: 180ms opacity fade on enter, replayed every navigation, applied to `<main>` and `<footer>` only (never an ancestor of the navbar: an opacity animation on an ancestor kills the navbar's `backdrop-filter`). Enter-only (exit animations need a router-freezing hack). Skipped on `/admin`. |
| Arrival gate | The site uses `scroll-behavior: smooth`, so after a link click from far down a page Next scrolls to the top smoothly. If the new page mounts scrolled down, `app/template.tsx` sets `data-await-top`, which pauses the hero entrance (`.blur-load`, `BlurWords mode="load"`) until `scrollY` is within 24px of the top (2s safety timeout). At the top on mount nothing is gated, so first paint never waits for JS. Scroll-triggered reveals need no gate (they fire when in view). |
| Buttons | `active:scale-[0.97]` press. No hover grow. |
| Keyboard focus | `:focus-visible` mint outline (2px, 3px offset) on links and buttons; form fields use a soft 3px mint ring. |
| Contact form | Spinner while sending; success circle pops in and the check draws (`.pop-in`, `.check-draw`); error message eases in with `role="alert"`. |
| Skills ticker | Pauses on hover. |
| Ambient glow | Removed in the 2026-10 light retheme (`components/MintGlow.tsx` deleted, along with the hero `data-glow-anchor`). The white page has no background glow. The roaming and fixed versions are in git history. |

### Tailwind keyframes (`tailwind.config.ts`)

| Name            | Keyframe                             | Duration   | Usage                    |
|-----------------|--------------------------------------|------------|--------------------------|
| `animate-fade-up`  | opacity 0→1, translateY 24px→0    | 0.6s ease  | Currently unused (superseded by blur reveal) |
| `animate-fade-in`  | opacity 0→1                       | 0.4s ease  | Currently unused         |
| `animate-marquee`  | translateX(0% → -50%)             | 30s linear | Skills ticker            |
| `animate-spin-slow` | Full rotation                    | 8s linear  | Reserved for future use  |
| `animate-pulse`    | Tailwind built-in                 | —          | Availability dot         |

---

## 9. Page Structure Reference

Everything runs on the Node.js runtime (no `runtime = 'edge'` exports; the Cloudflare build is handled by OpenNext). Public pages are statically generated and refreshed by `revalidate` or by `revalidatePath` / `revalidateTag` in the admin save actions.

| Route                    | Rendering                        | Auth   | Data source |
|--------------------------|----------------------------------|--------|-------------|
| `/`                      | static, `revalidate = 60`        | —      | published testimonials, blog posts; cached About content and site settings |
| `/about`                 | static                           | —      | `about_content` (cached 1h, tag `about-content`, revalidated on save) |
| `/blog`                  | static, `revalidate = 60`        | —      | `blog_posts` |
| `/blog/[slug]`           | static, `revalidate = 60`        | —      | `blog_posts`, cached site settings (JSON-LD author) |
| `/contact`               | static (form is a client component, server action on submit) | — | `contact_messages` (write) |
| `/admin`                 | `force-dynamic`                  | cookie | counts, recent posts and messages |
| `/admin/login`, `/forgot-password`, `/reset-password` | `force-dynamic` | — | Better Auth |
| `/admin/posts`, `/posts/new`, `/posts/[id]` | `force-dynamic` | cookie | `blog_posts` |
| `/admin/testimonials`    | `force-dynamic`                  | cookie | `testimonials` |
| `/footer-links`, `/about`, `/settings`, `/messages` | `force-dynamic` | cookie | their own tables |

---

## 10. Database

The database is Neon Postgres through Drizzle (the original Supabase setup is gone). The full, current schema (16 tables), column notes and the migration history live in **PLANNER.md, "Database schema"**; the source of truth is `lib/db/schema.ts`. This guide used to duplicate the `blog_posts` and `contact_messages` tables here and they drifted, so they were removed on purpose.

---

## 11. Environment Variables

The authoritative list, with where to get each value, is `.env.example` (and the table in README.md). In short:

```env
DATABASE_URL=                 # Neon pooled URL
DATABASE_URL_UNPOOLED=        # Neon direct URL (drizzle-kit)
BETTER_AUTH_SECRET=           # openssl rand -base64 32
BETTER_AUTH_URL=              # app base URL, differs per deploy target
NEXT_PUBLIC_APP_URL=          # same as BETTER_AUTH_URL
ADMIN_EMAILS=                 # comma-separated admin allowlist (unset = nobody can sign in)
RESEND_API_KEY=               # transactional email
RESEND_FROM_EMAIL=
CLOUDINARY_CLOUD_NAME=        # admin image uploads (avatar, skills, About page)
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 12. Changelog

| Date       | Change                                                                 |
|------------|------------------------------------------------------------------------|
| 2025-01    | Initial design system established                                      |
| 2025-01    | `prose-dark` blog styles added                                         |
| 2025-01    | Noise texture overlay, custom scrollbar, selection styles added        |
| 2026-04-04 | Supabase client refactored for Edge safety — no singleton, Realtime disabled, `persistSession: false`. Fixes CF Pages blog crash. |
| 2026-04-04 | `DESIGN_GUIDE.md` created — consolidated design system documentation   |
| 2026-05-15 | Better Auth UI added — login, forgot password, reset password pages use existing design tokens (no new colors required) |
| 2026-06-29 | Full palette + typeface rebrand: adopted the academic-line system from `learnDE`'s `DESIGN_GUIDE.md` — accent green `#3DF49A`→mint, `#070807` bg, Plus Jakarta Sans replacing Syne + Onest (JetBrains Mono unchanged). Every hardcoded hex and font reference updated across `app/`, `components/`, `lib/email.ts`, and this file. Scoped to color tokens + typography only — component structure (button shapes, badge sizes, spacing scale) was left as this project's own, not migrated to match learnDE's dashboard-oriented patterns. |
| 2026-09-28 | `small-ui-fixes` branch (off `main`): "What I do" section moved from a hardcoded array to a `skills` table, CRUD-able from `/admin/skills`. Each skill has an optional thumbnail (Cloudinary, own `skill-<id>` public_id per skill). Section layout changed from a 3-column grid to a single-column list of rows: image beside text on desktop, image above text on phones. Thumbnail slot background (`#222222`) is a shade lighter than the page so transparent PNG uploads still read as a tile. |
| 2026-06-29 | Display font split back out from body: every heading/display element that was originally Syne (recovered from git history, not guessed) now uses Clash Display via Fontshare's CDN link; Plus Jakarta Sans stays for body/UI text. `--font-clash` added to `:root` with a Jakarta/sans-serif fallback chain. |
| 2026-10-08 | Motion pass (`motion-polish`): CSS-only blur-fade reveal system, motion tokens, global reduced-motion guard, route fade, button press and focus states, navbar menu and contact form state animations. Section 8 rewritten; button snippets no longer use `transition-all` or hover grow. |
| 2026-10-08 | Palette change: neutrals become `#111111` page, `#222222` surfaces, `#333333` lines, `#444444` glow and hover borders; hero portrait added; ambient glow reduced to one `#444444` orb. A trial of pure `#000000` was reverted to `#111111` on 2026-10-10. |
| 2026-10-10 | Stats blocks removed from the homepage and `/projects`; one shared `MarqueeStrip` (same band, speed in px/s from Settings); the hero portrait now stands on the strip. |
| 2026-10-11 | Film grain tile (`public/grain.png`) replaces the SVG noise; About page extra block and two image slots; docs refresh (sections 3, 6, 9, 10, 11 rewritten: Supabase-era content removed, Clash Display/Fontshare replaced by Syne). |
| 2026-10-19 | Light retheme, phase 1 (`rethemed`): white page, blue `#2563EB` accent, gray lines (sections 2 and 3 rewritten); Instrument Serif headlines + Inter body and labels (old font variable names kept as aliases); film grain, ambient glow and the closing-CTA glow removed; blue focus rings, pill primary buttons; light syntax colours in blog code. Admin keeps the dark palette via `[data-admin]` tokens. |
| 2026-10-19 | Admin dashboard rethemed light too: same token hex values as the public site, dark `[data-admin]` token override removed, error/warning text `red-600` / `amber-700`. |
| 2026-10-20 | Headline font switched from Instrument Serif to Plus Jakarta Sans (400 to 800, normal and italic), still behind the `--font-clash` alias. |
| 2026-10-20 | Typography pass (taste-skill inspector): running text 16px in `#374151`, nothing under 13px, no tiny uppercase letter-spaced labels (strip, Before/After, blog tags, footer titles), headings two lines at every width (shorter copy, one size down on phones). Solid navbar (`#1F2937` over dark sections). Hero portrait zoomed and sized from the screen. |
| 2026-10-20 | Accent `#2563EB` to `#2563FF` (Fahim), about 4.9:1 on white; hero text block centred vertically in the hero, portrait anchored to the full-height container. |
| 2026-10-20 | Projects section removed from the homepage (and the whole Projects feature); testimonials bento grid with edge-to-edge website screenshots added in its place. |
