'use client'

import { useEffect } from 'react'

/**
 * Scroll snapping for the page it is rendered on (once per page). While
 * mounted it puts `snap-zone` on <html> (`scroll-snap-type: y mandatory`,
 * globals.css); stops are the `snap-start` / `snap-center` elements in <main>.
 *
 * Some stops are further apart than one wheel step, and the browser then
 * snaps back to where you were. So each wheel step goes to the next (or
 * previous) stop itself. Keyboard and touch keep the plain CSS snapping.
 */
export default function SnapScroll() {
  useEffect(() => {
    const root = document.documentElement
    // Snapping ends at the element marked `data-snap-end` (the final CTA): it
    // is still a stop, but from its top down the page scrolls freely.
    const end = document.querySelector<HTMLElement>('main [data-snap-end]')
    const endTop = () => (end ? scrollY + end.getBoundingClientRect().top : Infinity)
    const update = () => root.classList.toggle('snap-zone', scrollY < endTop() - 2)
    update()
    addEventListener('scroll', update, { passive: true })

    // Layout position, ignoring transforms: a panel still waiting to slide up
    // (or a tilted note) must not move its stop.
    const docTop = (el: HTMLElement) => {
      let t = 0
      for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) t += n.offsetTop
      return t
    }
    const stops = () =>
      Array.from(document.querySelectorAll<HTMLElement>('main .snap-start, main .snap-center'))
        .map((el) => {
          const r = el.getBoundingClientRect()
          const cs = getComputedStyle(el)
          const top = cs.scrollSnapAlign.includes('center')
            ? docTop(el) + el.offsetHeight / 2 - innerHeight / 2
            : docTop(el) - parseFloat(cs.scrollMarginTop || '0')
          return { top: Math.round(top), r }
        })
        .sort((a, b) => a.top - b.top)

    let lockUntil = 0
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 1) return
      // One step per gesture: trackpads send a burst of small wheel events.
      if (performance.now() < lockUntil) return e.preventDefault()
      const down = e.deltaY > 0
      const y = Math.round(scrollY)
      // Past the end marker: plain scrolling (up from below it too).
      if (down ? y >= endTop() - 2 : y > endTop() + 2) return
      const all = stops()
      // Inside a section taller than the screen: scroll it normally.
      const cur = [...all].reverse().find((s) => s.top <= y + 2)
      if (cur && (down ? cur.r.bottom > innerHeight + 2 : y > cur.top + 2)) return
      const max = document.documentElement.scrollHeight - innerHeight
      const next = down ? all.find((s) => s.top > y + 2) : [...all].reverse().find((s) => s.top < y - 2)
      const target = next && Math.min(Math.max(next.top, 0), max)
      if (target === undefined || Math.abs(target - y) <= 2) return
      e.preventDefault()
      lockUntil = performance.now() + 800
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
      scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' })
    }

    addEventListener('wheel', onWheel, { passive: false })
    return () => {
      removeEventListener('wheel', onWheel)
      removeEventListener('scroll', update)
      root.classList.remove('snap-zone')
    }
  }, [])

  return null
}
