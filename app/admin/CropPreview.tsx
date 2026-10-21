'use client'

/* What part of an uploaded thumbnail the public site shows, and where it is
   focused. Each frame has the ratio of the real box (measured on /testimonials
   at 1440 and 390 px wide) and crops like it does (object-cover at the focus
   point), so it shows exactly that part. Clicking the full image moves the
   focus point. If the tiles in TestimonialGrid / PortfolioGrid change size,
   change these numbers. */
// wide tiles are 16:10 of their width (728 x 455 desktop, 342 x 214 phone); the others are a fixed height
const DESKTOP_TILE: Record<string, [number, number]> = { normal: [352, 224], tall: [352, 224], wide: [728, 455] }
const PHONE_TILE: Record<string, [number, number]> = { normal: [342, 192], tall: [342, 192], wide: [342, 214] }
const FRAME_H = 80

export type CropFrame = { label: string; w: number; h: number }

export default function CropPreview({ src, size, focus, onFocus, extra = [] }: {
  src: string
  size?: string
  focus: string // CSS object-position, 'x% y%'
  onFocus: (focus: string) => void
  extra?: CropFrame[]
}) {
  if (!size || !DESKTOP_TILE[size]) size = 'normal'
  const [dw, dh] = DESKTOP_TILE[size]
  const frames: CropFrame[] = [
    { label: `Desktop tile (${size})`, w: dw, h: dh },
    { label: 'Phone tile', w: PHONE_TILE[size][0], h: PHONE_TILE[size][1] },
    ...extra,
  ]
  const [fx, fy] = focus.split(' ')
  return (
    <div className="flex flex-wrap gap-6">
      <div className="w-56">
        <p className="text-xs text-[#5B6475] mb-1.5">Click the part that must stay visible:</p>
        <button
          type="button"
          aria-label="Set the focus point"
          className="relative block w-full rounded-md overflow-hidden border border-[#E5E7EB] cursor-crosshair"
          onClick={(e) => {
            if (e.detail === 0) return // keyboard "click" has no position
            const r = e.currentTarget.getBoundingClientRect()
            const pct = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 100)
            onFocus(`${pct((e.clientX - r.left) / r.width)}% ${pct((e.clientY - r.top) / r.height)}%`)
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="block w-full h-auto" />
          <span aria-hidden="true" className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white bg-[#2563FF] shadow-[0_0_0_1px_rgba(11,15,25,0.4)]" style={{ left: fx, top: fy }} />
        </button>
        <button type="button" className="mt-1 text-xs text-[#2563FF] hover:underline disabled:text-[#6B7280] disabled:no-underline" disabled={focus === '50% 50%'} onClick={() => onFocus('50% 50%')}>
          Back to centre
        </button>
      </div>
      <div>
        <p className="text-xs text-[#5B6475] mb-1.5">What visitors see:</p>
        <div className="flex flex-wrap gap-3">
          {frames.map((f) => (
            <figure key={f.label}>
              <div className="rounded-md overflow-hidden border border-[#E5E7EB] bg-[#F7F8FA]" style={{ height: FRAME_H, width: Math.round((FRAME_H * f.w) / f.h) }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-full h-full object-cover" style={{ objectPosition: focus }} />
              </div>
              <figcaption className="mt-1 text-[11px] text-[#6B7280]">{f.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  )
}
