'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronLeft,
  ExternalLink,
  Quote,
  LayoutDashboard,
  LogOut,
  Mail,
  ScrollText,
  Settings,
  Link2,
  User,
} from 'lucide-react'
import { logoutAction } from './actions'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: 'Posts', icon: ScrollText },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Quote },
  { href: '/admin/about', label: 'About', icon: User },
  { href: '/admin/footer-links', label: 'Footer Links', icon: Link2 },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed top-0 left-0 z-40 h-screen w-60 border-r border-[#E5E7EB] bg-[#FFFFFF] flex flex-col">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 border-b border-[#E5E7EB]">
        <Link href="/admin" className="flex items-center gap-2">
          <span
            className="text-xl font-bold text-[#0B0F19]"
            style={{ fontFamily: 'var(--font-clash)' }}
          >
            Admin
          </span>
          <span className="text-xl font-bold text-[#2563FF] leading-none">.</span>
        </Link>
        <p
          className="text-[10px] uppercase tracking-widest text-[#6B7280] mt-1"
          style={{ fontFamily: 'var(--font-jetbrains)' }}
        >
          mahtamun. portfolio
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p
          className="px-3 mb-2 text-[10px] uppercase tracking-widest text-[#6B7280]"
          style={{ fontFamily: 'var(--font-jetbrains)' }}
        >
          Manage
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? 'bg-[#2563FF]/10 text-[#2563FF]'
                      : 'text-[#5B6475] hover:text-[#0B0F19] hover:bg-[#F7F8FA]'
                  }`}
                  style={{ fontFamily: 'var(--font-jakarta)' }}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-[#E5E7EB] space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#5B6475] hover:text-[#0B0F19] hover:bg-[#F7F8FA] transition-colors"
          style={{ fontFamily: 'var(--font-jakarta)' }}
        >
          <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>Back to site</span>
          <ExternalLink className="h-3 w-3 ml-auto opacity-60" strokeWidth={2} />
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#5B6475] hover:text-red-600 hover:bg-red-500/5 transition-colors"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
