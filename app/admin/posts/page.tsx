import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/auth-utils'
import { getBlogPosts, getSiteSettings, type BlogPost } from '@/lib/db/queries'
import PostsSearchList from './PostsSearchList'
import BlogSwitch from './BlogSwitch'

export default async function AdminPostsPage() {
  const authenticated = await isAuthenticated()
  if (!authenticated) redirect('/admin/login')

  const [posts, settings] = await Promise.all([getBlogPosts() as Promise<BlogPost[]>, getSiteSettings()])

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1
          className="text-4xl font-bold text-[#0B0F19]"
          style={{ fontFamily: 'var(--font-clash)' }}
        >
          Blog Posts
        </h1>
        <Link
          href="/admin/posts/new"
          className="px-5 py-2.5 bg-[#2563FF] text-white text-sm font-semibold rounded-lg hover:bg-[#1D4ED8] transition-colors"
          style={{ fontFamily: 'var(--font-jakarta)' }}
        >
          + New post
        </Link>
      </div>

      <BlogSwitch initial={settings.blogEnabled} />
      <PostsSearchList posts={posts} />
    </div>
  )
}
