'use client'

import { useEffect, useRef } from 'react'

// The guided map's winding road (app/page.tsx) with a blue glow that follows
// the mouse along it: the glow sits on the point of the road nearest the
// cursor and is painted only on the road stroke, so it never leaves the road.
// The SVG is stretched (preserveAspectRatio="none"), so the gradient is
// scaled back into a circle on screen. `road-fade` fades it at both ends.
const GLOW_RADIUS = 140 // px on screen
const SAMPLES = 400

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
    const area = svg?.parentElement
    if (!svg || !path || !grad || !glow || !area) return

    const len = path.getTotalLength()
    const pts = Array.from({ length: SAMPLES + 1 }, (_, i) => path.getPointAtLength((len * i) / SAMPLES))
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let target = { x: pts[0].x, y: pts[0].y }
    let pos = { ...target }
    let frame = 0

    const draw = () => {
      const { width, height: h } = svg.getBoundingClientRect()
      const sx = width / 100
      const sy = h / height
      grad.setAttribute('r', String(GLOW_RADIUS / sx))
      grad.setAttribute('gradientTransform', `translate(${pos.x} ${pos.y}) scale(1 ${sx / sy})`)
    }

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.18
      pos.y += (target.y - pos.y) * 0.18
      draw()
      frame = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.01 ? requestAnimationFrame(tick) : 0
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = svg.getBoundingClientRect()
      const sx = r.width / 100
      const sy = r.height / height
      let best = pts[0]
      let bestD = Infinity
      for (const p of pts) {
        const dist = ((p.x * sx + r.left - e.clientX) ** 2) + ((p.y * sy + r.top - e.clientY) ** 2)
        if (dist < bestD) { bestD = dist; best = p }
      }
      target = { x: best.x, y: best.y }
      if (glow.style.opacity !== '1') {
        // first move in: start on the road under the cursor, not at the old spot
        pos = { ...target }
        draw()
        glow.style.opacity = '1'
      }
      if (still) { pos = { ...target }; draw() }
      else if (!frame) frame = requestAnimationFrame(tick)
    }
    const onLeave = () => { glow.style.opacity = '0' }

    area.addEventListener('pointermove', onMove)
    area.addEventListener('pointerleave', onLeave)
    return () => {
      area.removeEventListener('pointermove', onMove)
      area.removeEventListener('pointerleave', onLeave)
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
