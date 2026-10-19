import Link from 'next/link'
import { Github } from 'lucide-react'

type Props = {
  jobTitle: string
  avatarUrl?: string | null
}

export default function AuthorCard({ jobTitle, avatarUrl }: Props) {
  return (
    <div className="mt-16 pt-8 border-t border-[#E5E7EB]">
      <div className="flex items-start gap-4 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-6">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Mahtamun Hoque Fahim"
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover shrink-0 border border-[#E5E7EB]"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full bg-[#E5E7EB] flex items-center justify-center text-lg font-bold
                       text-[#2563FF] shrink-0"
            style={{ fontFamily: 'var(--font-clash)' }}
          >
            MH
          </div>
        )}

        <div className="min-w-0">
          <p
            className="text-[#0B0F19] text-base font-bold"
            style={{ fontFamily: 'var(--font-clash)' }}
          >
            Mahtamun Hoque Fahim
          </p>
          <p
            className="text-[#5B6475] text-sm mt-0.5"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            {jobTitle}
          </p>
          <p
            className="text-[#5B6475] text-sm mt-3 leading-relaxed"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Writing about building and shipping software solo — from
            architecture decisions to the small tools that make it easier.
          </p>

          <div
            className="flex flex-wrap items-center gap-4 mt-4 text-sm"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            <a
              href="https://mahtamundesigns.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5B6475] hover:text-[#2563FF] transition-colors"
            >
              Portfolio ↗
            </a>
            <Link
              href="/blog"
              className="text-[#5B6475] hover:text-[#2563FF] transition-colors"
            >
              More posts
            </Link>
            <a
              href="https://github.com/mahtamun-hoque-fahim"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#5B6475] hover:text-[#2563FF] transition-colors"
            >
              <Github className="h-3.5 w-3.5" strokeWidth={2} />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
