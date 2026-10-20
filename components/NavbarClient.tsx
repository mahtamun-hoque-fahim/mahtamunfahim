'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import Logo from '@/components/Logo'

const allLinks = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

// Rendered by components/Navbar.tsx, which decides whether Portfolio and Blog show.
export default function NavbarClient({ show }: { show: Record<'/portfolio' | '/testimonials' | '/blog', boolean> }) {
  const navLinks = allLinks.filter((l) => show[l.href as keyof typeof show] ?? true)
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [onDark, setOnDark] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      // Dark style while a section marked data-nav-dark is behind the pill
      // (its vertical middle sits about 46px from the top of the screen).
      setOnDark(
        Array.from(document.querySelectorAll('[data-nav-dark]')).some((el) => {
          const r = el.getBoundingClientRect()
          return r.top <= 46 && r.bottom >= 46
        })
      )
    }
    onScroll() // correct state on load/restore (e.g. reload mid-page)
    // passive: tells the browser this handler never blocks scrolling.
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  // While the full-screen menu is open: Esc closes it, and the page
  // behind it does not scroll.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) return null

  // The open mobile menu is a white page, so the pill stays light over it.
  const dark = onDark && !menuOpen

  return (
    <>
      {/* Floating pill nav: inset from the top (and sides) at every width —
          never flush against the viewport edge, mobile or desktop. Scroll
          only adds a shadow; the shape and the solid fill do not change. */}
      <nav className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6">
        <div
          className={cn(
            // Solid fills, no blur: white on light sections, one step lighter
            // than the dark sections (#1F2937 on #0B0F19) over dark ones.
            'max-w-6xl mx-auto rounded-full border px-5 sm:px-6 py-3 flex items-center justify-between transition-[background-color,border-color,box-shadow] duration-300',
            dark
              ? cn('bg-[#1F2937] border-[#1F2937]', scrolled && 'shadow-lg shadow-black/30')
              : cn('bg-white border-[#E5E7EB]', scrolled && 'shadow-lg shadow-black/5')
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className={cn('group inline-flex items-center transition-colors duration-300', dark ? 'text-white' : 'text-[#0B0F19]')}
            aria-label="Mahtamun — home"
          >
            <Logo height={32} className="transition-opacity group-hover:opacity-80" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm tracking-wide transition-colors duration-200 relative group',
                  pathname === link.href
                    ? dark ? 'text-[#60A5FA]' : 'text-[#2563FF]'
                    : dark ? 'text-[#A3ACBD] hover:text-white' : 'text-[#5B6475] hover:text-[#0B0F19]'
                )}
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute -bottom-1 left-0 w-full h-px origin-left transition-transform duration-300 ease-ui-out',
                    pathname === link.href
                      ? cn(dark ? 'bg-[#60A5FA]' : 'bg-[#2563FF]', 'scale-x-100')
                      : cn(dark ? 'bg-[#A3ACBD]' : 'bg-[#5B6475]', 'scale-x-0 group-hover:scale-x-100')
                  )}
                />
              </Link>
            ))}

          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span
              className={cn(
                'block w-6 h-0.5 rounded-full transition-[transform,opacity,background-color] duration-300 ease-ui-in-out',
                dark ? 'bg-white' : 'bg-[#0B0F19]',
                menuOpen && 'rotate-45 translate-y-2'
              )}
            />
            <span
              className={cn(
                'block w-6 h-0.5 rounded-full transition-[transform,opacity,background-color] duration-300 ease-ui-in-out',
                dark ? 'bg-white' : 'bg-[#0B0F19]',
                menuOpen && 'opacity-0'
              )}
            />
            <span
              className={cn(
                'block w-6 h-0.5 rounded-full transition-[transform,opacity,background-color] duration-300 ease-ui-in-out',
                dark ? 'bg-white' : 'bg-[#0B0F19]',
                menuOpen && '-rotate-45 -translate-y-2'
              )}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          'fixed inset-0 z-40 bg-[#FFFFFF] flex flex-col justify-center items-center gap-10 transition-[opacity,visibility] duration-300',
          // invisible (not just transparent) so closed links leave the tab order
          menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        )}
      >
        {navLinks.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            className={cn(
              'text-4xl font-display font-bold transition-[opacity,transform,filter,color] duration-500 ease-ui-out',
              pathname === link.href ? 'text-[#2563FF]' : 'text-[#0B0F19]',
              menuOpen
                ? 'opacity-100 translate-y-0 blur-0'
                : 'opacity-0 translate-y-3 blur-[6px]'
            )}
            style={{
              fontFamily: 'var(--font-clash)',
              // stagger only on the way in; closing is immediate
              transitionDelay: menuOpen ? `${80 + i * 50}ms` : '0ms',
            }}
          >
            {link.label}
          </Link>
        ))}

      </div>
    </>
  )
}
