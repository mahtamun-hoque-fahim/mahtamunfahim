'use client'

import { useEffect, useRef } from 'react'

// The guided map's winding road (app/page.tsx) with a blue glow that marks
// the current step: whichever step row is nearest the middle of the screen.
// When that changes, the glow travels slowly ALONG the road (not in a straight
// line) to the new step's pin and settles there. It is painted only on the
// road stroke. The SVG is stretched (preserveAspectRatio="none"), so the
// gradient is scaled back into a circle on screen; `road-fade` fades it at
// both ends of the road.
const GLOW_RADIUS = 140 // px on screen
const SAMPLES = 400
const EASE = 0.035 // share of the remaining distance covered per frame: slow, visible travel

export default function RoadGlow({ d, height }: { d: string; height: number }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const gradRef = useRef<SVGRadialGradientElement>(null)
  const glowRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const path = pathRef.current
    const grad = gradRef.current
    const glow = glowRef.current
    const rows = svg?.parentElement ? Array.from(svg.parentElement.querySelectorAll(':scope > li')) : []
    if (!svg || !path || !grad || !glow || !rows.length) return

    // the length along the road of each step's pin, at (50, 50 + 100i)
    const len = path.getTotalLength()
    const samples = Array.from({ length: SAMPLES + 1 }, (_, i) => ({ l: (len * i) / SAMPLES, p: path.getPointAtLength((len * i) / SAMPLES) }))
    const pins = rows.map((_, i) =>
      samples.reduce((a, b) => (Math.hypot(b.p.x - 50, b.p.y - (50 + 100 * i)) < Math.hypot(a.p.x - 50, a.p.y - (50 + 100 * i)) ? b : a)).l
    )
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let target = pins[0]
    let at = target
    let frame = 0

    const draw = () => {
      const { width, height: h } = svg.getBoundingClientRect()
      if (!width || !h) return
      const sx = width / 100
      const { x, y } = path.getPointAtLength(at)
      grad.setAttribute('r', String(GLOW_RADIUS / sx))
      grad.setAttribute('gradientTransform', `translate(${x} ${y}) scale(1 ${sx / (h / height)})`)
    }

    const tick = () => {
      at += (target - at) * EASE
      if (Math.abs(target - at) < 0.05) at = target
      draw()
      frame = at === target ? 0 : requestAnimationFrame(tick)
    }

    const update = () => {
      const mid = window.innerHeight / 2
      const boxes = rows.map((r) => r.getBoundingClientRect())
      const inView = boxes[0].top < window.innerHeight && boxes[boxes.length - 1].bottom > 0
      glow.style.opacity = inView ? '1' : '0'
      if (!inView) return
      let current = 0
      boxes.forEach((b, i) => {
        if (Math.abs(b.top + b.height / 2 - mid) < Math.abs(boxes[current].top + boxes[current].height / 2 - mid)) current = i
      })
      if (pins[current] === target) return
      target = pins[current]
      if (still) { at = target; draw() }
      else if (!frame) frame = requestAnimationFrame(tick)
    }

    draw()
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', draw)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', draw)
      cancelAnimationFrame(frame)
    }
  }, [height])

  return (
    <svg ref={svgRef} aria-hidden="true" className="hidden md:block absolute inset-0 w-full h-full road-fade" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <radialGradient ref={gradRef} id="road-glow" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10">
          <stop offset="0" stopColor="#2563FF" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="#2563FF" stopOpacity="0.2" />
          <stop offset="1" stopColor="#2563FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path ref={pathRef} d={d} fill="none" stroke="#E5E7EB" strokeWidth="34" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path ref={glowRef} d={d} fill="none" stroke="url(#road-glow)" strokeWidth="34" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="transition-opacity duration-500 ease-ui-out" style={{ opacity: 0 }} />
      <path d={d} fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="12 14" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
