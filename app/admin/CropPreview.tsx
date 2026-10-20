/* What part of an uploaded thumbnail the public site shows. Each frame has the
   ratio of the real box (measured on /testimonials at 1440 and 390 px wide) and
   crops like it does (object-cover object-top), so it shows exactly that part.
   If the tiles in TestimonialGrid / PortfolioGrid change size, change these. */
const DESKTOP_TILE: Record<string, [number, number]> = { normal: [352, 224], tall: [352, 224], wide: [728, 224] }
const PHONE_TILE: [number, number] = [342, 192]
const FRAME_H = 80

export type CropFrame = { label: string; w: number; h: number }

export default function CropPreview({ src, size, extra = [] }: { src: string; size?: string; extra?: CropFrame[] }) {
  if (!size || !DESKTOP_TILE[size]) size = 'normal'
  const [dw, dh] = DESKTOP_TILE[size]
  const frames: CropFrame[] = [
    { label: `Desktop tile (${size})`, w: dw, h: dh },
    { label: 'Phone tile', w: PHONE_TILE[0], h: PHONE_TILE[1] },
    ...extra,
  ]
  return (
    <div>
      <p className="text-xs text-[#5B6475] mb-1.5">What visitors see:</p>
      <div className="flex flex-wrap gap-3">
        {frames.map((f) => (
          <figure key={f.label}>
            <div className="rounded-md overflow-hidden border border-[#E5E7EB] bg-[#F7F8FA]" style={{ height: FRAME_H, width: Math.round((FRAME_H * f.w) / f.h) }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover object-top" />
            </div>
            <figcaption className="mt-1 text-[11px] text-[#6B7280]">{f.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
