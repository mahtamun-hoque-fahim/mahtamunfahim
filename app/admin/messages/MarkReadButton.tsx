'use client'

import { useRouter } from 'next/navigation'
import { markMessageReadAction } from '@/app/admin/actions'

export default function MarkReadButton({ id }: { id: string }) {
  const router = useRouter()

  const handleMarkRead = async () => {
    await markMessageReadAction(id)
    router.refresh()
  }

  return (
    <button
      onClick={handleMarkRead}
      className="text-xs text-[#5B6475] hover:text-[#2563FF] transition-colors px-3 py-1.5 border border-[#E5E7EB] rounded-lg hover:border-[#2563FF]/30"
      style={{ fontFamily: 'var(--font-jakarta)' }}
    >
      Mark read
    </button>
  )
}
