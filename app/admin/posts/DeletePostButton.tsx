'use client'

import { useRouter } from 'next/navigation'
import { deletePostAction } from '@/app/admin/actions'

export default function DeletePostButton({ id }: { id: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    await deletePostAction(id)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-[#5B6475] hover:text-red-600 transition-colors px-3 py-1.5 border border-[#E5E7EB] rounded-lg hover:border-red-500/30"
      style={{ fontFamily: 'var(--font-jakarta)' }}
    >
      Delete
    </button>
  )
}
