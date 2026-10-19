'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { type BlogPost } from '@/lib/db/queries'
import { formatDate } from '@/lib/utils'
import DeletePostButton from './DeletePostButton'

interface Props {
  posts: BlogPost[]
}

type FilterStatus = 'all' | 'published' | 'draft'

export default function PostsSearchList({ posts }: Props) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<FilterStatus>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((post) => {
      if (status === 'published' && !post.published) return false
      if (status === 'draft' && post.published) return false
      if (!q) return true
      return (
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.slug.toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    })
  }, [posts, query, status])

  const clearFilters = () => {
    setQuery('')
    setStatus('all')
  }

  const filtersActive = query.trim() !== '' || status !== 'all'

  return (
    <>
      {/* Search + filter bar */}
      <div className="flex items-center gap-3 mb-6">
        {/* Search input */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6475] pointer-events-none"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
          >
            <path
              d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, excerpt, slug or tag..."
            className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg pl-10 pr-9 py-2.5 text-sm text-[#0B0F19] placeholder:text-[#5B6475] focus:outline-none focus:border-[#2563FF]/40 transition-colors"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6475] hover:text-[#0B0F19] transition-colors"
              aria-label="Clear search"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1 1L11 11M11 1L1 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1 bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg p-1 shrink-0">
          {(['all', 'published', 'draft'] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                status === s
                  ? 'bg-[#2563FF] text-white'
                  : 'text-[#5B6475] hover:text-[#0B0F19]'
              }`}
              style={{ fontFamily: 'var(--font-jakarta)' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      {filtersActive && (
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-xs text-[#5B6475]"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            {filtered.length === 0
              ? 'No posts match'
              : `${filtered.length} of ${posts.length} post${posts.length !== 1 ? 's' : ''}`}
          </p>
          <button
            onClick={clearFilters}
            className="text-xs text-[#5B6475] hover:text-[#2563FF] transition-colors"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Posts list */}
      {filtered.length === 0 ? (
        <div className="border border-[#E5E7EB] rounded-xl p-16 text-center">
          {filtersActive ? (
            <>
              <p
                className="text-[#5B6475] text-sm mb-3"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                No posts match your search.
              </p>
              <button
                onClick={clearFilters}
                className="text-[#2563FF] text-sm"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <p
                className="text-[#5B6475] text-sm mb-4"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                No posts yet.
              </p>
              <Link
                href="/admin/posts/new"
                className="text-[#2563FF] text-sm"
                style={{ fontFamily: 'var(--font-jakarta)' }}
              >
                Write your first post →
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-6 py-5 flex items-center gap-6 hover:border-[#D1D5DB] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      post.published
                        ? 'bg-[#2563FF]/10 text-[#2563FF] border border-[#2563FF]/20'
                        : 'bg-[#E5E7EB] text-[#5B6475] border border-[#E5E7EB]'
                    }`}
                    style={{ fontFamily: 'var(--font-jetbrains)' }}
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  <span
                    className="text-[#6B7280] text-xs"
                    style={{ fontFamily: 'var(--font-jetbrains)' }}
                  >
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <h3
                  className="text-[#0B0F19] font-semibold truncate"
                  style={{ fontFamily: 'var(--font-clash)' }}
                >
                  {post.title}
                </h3>
                <p
                  className="text-[#5B6475] text-xs truncate mt-0.5"
                  style={{ fontFamily: 'var(--font-jakarta)' }}
                >
                  {post.excerpt}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {post.published && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="text-xs text-[#5B6475] hover:text-[#0B0F19] transition-colors"
                    style={{ fontFamily: 'var(--font-jakarta)' }}
                  >
                    View ↗
                  </Link>
                )}
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="text-xs text-[#5B6475] hover:text-[#2563FF] transition-colors px-3 py-1.5 border border-[#E5E7EB] rounded-lg"
                  style={{ fontFamily: 'var(--font-jakarta)' }}
                >
                  Edit
                </Link>
                <DeletePostButton id={post.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
