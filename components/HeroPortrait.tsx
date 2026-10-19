/**
 * Homepage hero portrait: transparent cutout standing on the marquee strip.
 *
 * - The parent is the full-height hero container (`relative`), whose bottom
 *   edge is the top border of the marquee strip, so `bottom-0` stands the
 *   figure on the strip wherever the centred text sits. The height comes from the screen, not the
 *   headline (`min(100vh - 8rem, 40rem)`), so a shorter headline no longer
 *   shrinks the figure; 8rem keeps the head clear of the navbar, 40rem caps
 *   it on tall screens so it does not run into the headline.
 * - Zoomed in: the box is `aspect-[452/731]` while the photo is 452 x 969,
 *   and the img is `object-cover object-top`, so the bottom quarter (thighs)
 *   is cropped and head and shoulders are about 1.3x larger. The cut sits on
 *   the strip, so he still reads as standing on the line.
 * - Horizontal: `right-[6%]` of the container, in the free column to the
 *   right of the headline.
 * - No mask, no glow; black suit with a blue shirt (2026-10-20), after a blue-suit try, the first colour photo and the B&W cutout.
 * - Behind the headline (-z-10), hidden below `lg` (narrower, it would sit under the hero text and buttons).
 * - Plain <img>, pre-cropped WebP with alpha (452 x 969; black suit, blue shirt, since 2026-10-20; under a new file name so browsers do not reuse a cached older photo): the site does
 *   not use next/image (Vercel + Cloudflare), and fetchPriority="high"
 *   keeps it from loading late.
 * - Enters with blur-load, so the route "arrival gate" in app/template.tsx
 *   holds it too.
 */
export default function HeroPortrait() {
  return (
    <div
      className="blur-load pointer-events-none absolute right-[6%] bottom-0 h-[min(calc(100vh-8rem),40rem)] -z-10 hidden aspect-[452/731] lg:block"
      style={
        {
          '--reveal-delay': '220ms',
          '--reveal-duration': '1200ms',
          '--blur-from': '4px',
        } as React.CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/fahim-hero-blue-shirt.webp"
        width={452}
        height={969}
        alt="Portrait of Mahtamun Hoque Fahim"
        fetchPriority="high"
        decoding="async"
        draggable={false}
        className="block h-full w-full select-none object-cover object-top"
      />
    </div>
  )
}
