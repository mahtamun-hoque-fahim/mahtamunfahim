import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-utils'
import { getContactMessages } from '@/lib/db/queries'
import { formatDateTime } from '@/lib/utils'
import MarkReadButton from './MarkReadButton'

export default async function AdminMessagesPage() {
  const authenticated = await isAuthenticated()
  if (!authenticated) redirect('/admin/login')

  const messages = await getContactMessages()

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-[#0B0F19] mb-10" style={{ fontFamily: 'var(--font-clash)' }}>
        Messages
        {messages.filter((m) => !m.read).length > 0 && (
          <span className="ml-3 text-lg text-[#2563FF]">({messages.filter((m) => !m.read).length} unread)</span>
        )}
      </h1>

      {messages.length === 0 ? (
        <div className="border border-[#E5E7EB] rounded-xl p-16 text-center">
          <p className="text-[#5B6475] text-sm" style={{ fontFamily: 'var(--font-jakarta)' }}>No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`border rounded-xl p-6 transition-colors ${msg.read ? 'border-[#E5E7EB] bg-[#F7F8FA]' : 'border-[#2563FF]/20 bg-[#F7F8FA]'}`}>
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {!msg.read && <span className="text-xs px-2 py-0.5 bg-[#2563FF]/10 text-[#2563FF] border border-[#2563FF]/20 rounded-full" style={{ fontFamily: 'var(--font-jetbrains)' }}>New</span>}
                    <span className="font-semibold text-[#0B0F19]" style={{ fontFamily: 'var(--font-clash)' }}>{msg.name}</span>
                    <a href={`mailto:${msg.email}`} className="text-[#5B6475] text-sm hover:text-[#2563FF] transition-colors" style={{ fontFamily: 'var(--font-jakarta)' }}>{msg.email}</a>
                    <div className="ml-auto flex items-center gap-3">
                      {msg.country && <span className="text-xs px-2 py-0.5 border border-[#E5E7EB] text-[#5B6475] rounded" style={{ fontFamily: 'var(--font-jetbrains)' }}>({msg.country})</span>}
                      <div className="text-right">
                        <p className="text-[#6B7280] text-xs" style={{ fontFamily: 'var(--font-jetbrains)' }}>{formatDateTime(msg.createdAt).date}</p>
                        <p className="text-[#6B7280] text-xs" style={{ fontFamily: 'var(--font-jetbrains)' }}>{formatDateTime(msg.createdAt).time}</p>
                      </div>
                    </div>
                  </div>
                  {msg.subject && <p className="text-sm text-[#0B0F19] font-medium mb-2" style={{ fontFamily: 'var(--font-jakarta)' }}>Re: {msg.subject}</p>}
                  <p className="text-[#5B6475] text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'var(--font-jakarta)' }}>{msg.message}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!msg.read && <MarkReadButton id={msg.id} />}
                  <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your message')}`} className="text-xs text-[#5B6475] hover:text-[#2563FF] transition-colors px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-center" style={{ fontFamily: 'var(--font-jakarta)' }}>Reply ↗</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
