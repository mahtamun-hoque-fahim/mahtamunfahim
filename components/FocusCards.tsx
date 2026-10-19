'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * A list where only the child crossing the middle of the screen is in focus.
 * The others are faded and blurred by CSS (`.focus-cards`, globals.css),
 * only under `@media (scripting: enabled)`, so without JS everything shows.
 * One IntersectionObserver with a thin band in the middle of the viewport
 * marks the child inside it with `data-active`.
 */
export default function FocusCards({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = ref.current
    if (!list || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) el.dataset.active = 'true'
          else delete el.dataset.active
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )
    for (const child of Array.from(list.children)) io.observe(child)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn('focus-cards', className)}>
      {children}
    </div>
  )
}
