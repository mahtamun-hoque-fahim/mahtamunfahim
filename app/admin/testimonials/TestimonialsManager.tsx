'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, ChevronUp, ImagePlus, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { NewTestimonial, Testimonial } from '@/lib/db/queries'
import { MAX_AVATAR_BYTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  createTestimonialAction,
  deleteTestimonialAction,
  removeTestimonialImageAction,
  reorderTestimonialsAction,
  updateTestimonialAction,
  uploadTestimonialImageAction,
} from '@/app/admin/actions'

const inputCls =
  'w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#0B0F19] placeholder-[#6B7280] focus:outline-none focus:border-[#2563FF] transition-colors'
const labelCls = 'block text-sm font-medium text-[#0B0F19] mb-1'
const btnPrimary =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563FF] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors disabled:opacity-50'
const btnSecondary =
  'inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#5B6475] hover:text-[#0B0F19] hover:border-[#D1D5DB] transition-colors'

const SIZES: Array<{ value: string; label: string; hint: string }> = [
  { value: 'normal', label: 'Normal', hint: 'one tile' },
  { value: 'wide', label: 'Wide', hint: 'two tiles across' },
  { value: 'tall', label: 'Tall', hint: 'two tiles down' },
]

type Draft = Pick<NewTestimonial, 'name' | 'role' | 'business' | 'quote' | 'websiteUrl' | 'size' | 'published'>
const emptyDraft: Draft = { name: '', role: '', business: '', quote: '', websiteUrl: '', size: 'normal', published: true }

export default function TestimonialsManager({ initial }: { initial: Testimonial[] }) {
  const [items, setItems] = useState(initial)
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  const run = (fn: () => Promise<void>) => {
    setError('')
    start(async () => {
      try {
        await fn()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  const openNew = () => { setDraft(emptyDraft); setEditing('new') }
  const openEdit = (t: Testimonial) => {
    setDraft({ name: t.name, role: t.role, business: t.business, quote: t.quote, websiteUrl: t.websiteUrl ?? '', size: t.size, published: t.published })
    setEditing(t.id)
  }

  const save = () => run(async () => {
    if (editing === 'new') {
      const created = await createTestimonialAction({ ...draft, sortOrder: items.length } as NewTestimonial)
      if (created) setItems([...items, created])
    } else if (editing) {
      const updated = await updateTestimonialAction(editing, draft)
      if (updated) setItems(items.map((t) => (t.id === updated.id ? updated : t)))
    }
    setEditing(null)
  })

  const remove = (t: Testimonial) => {
    if (!confirm(`Delete the testimonial from ${t.name}? This cannot be undone.`)) return
    run(async () => {
      await deleteTestimonialAction(t.id)
      setItems(items.filter((x) => x.id !== t.id))
    })
  }

  const move = (index: number, dir: -1 | 1) => {
    const next = [...items]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j], next[index]]
    setItems(next)
    run(() => reorderTestimonialsAction(next.map((t, i) => ({ id: t.id, order: i }))))
  }

  const togglePublished = (t: Testimonial) => run(async () => {
    const updated = await updateTestimonialAction(t.id, { published: !t.published })
    if (updated) setItems(items.map((x) => (x.id === t.id ? updated : x)))
  })

  const upload = (t: Testimonial, file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_AVATAR_BYTES) return setError('Image must be under 4MB.')
    const fd = new FormData()
    fd.set('file', file)
    run(async () => {
      const updated = await uploadTestimonialImageAction(t.id, fd)
      if (updated) setItems(items.map((x) => (x.id === t.id ? updated : x)))
    })
  }

  const removeImage = (t: Testimonial) => run(async () => {
    const updated = await removeTestimonialImageAction(t.id)
    if (updated) setItems(items.map((x) => (x.id === t.id ? updated : x)))
  })

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#5B6475]">
          {items.length === 0 ? 'No testimonials yet.' : `${items.filter((t) => t.published).length} of ${items.length} published`}
        </p>
        <button type="button" className={btnPrimary} onClick={openNew} disabled={pending}>
          <Plus className="w-4 h-4" /> Add testimonial
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {editing && (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#0B0F19]">{editing === 'new' ? 'New testimonial' : 'Edit testimonial'}</h2>
            <button type="button" aria-label="Close" onClick={() => setEditing(null)} className="text-[#6B7280] hover:text-[#0B0F19]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <label><span className={labelCls}>Name *</span>
              <input className={inputCls} value={draft.name} maxLength={80} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
            <label><span className={labelCls}>Role</span>
              <input className={inputCls} value={draft.role ?? ''} maxLength={80} placeholder="Owner" onChange={(e) => setDraft({ ...draft, role: e.target.value })} /></label>
            <label><span className={labelCls}>Business</span>
              <input className={inputCls} value={draft.business ?? ''} maxLength={80} onChange={(e) => setDraft({ ...draft, business: e.target.value })} /></label>
          </div>
          <label className="block"><span className={labelCls}>Quote *</span>
            <textarea className={inputCls} rows={4} maxLength={600} value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} /></label>
          <label className="block"><span className={labelCls}>Their website</span>
            <input className={inputCls} value={draft.websiteUrl ?? ''} placeholder="https://" onChange={(e) => setDraft({ ...draft, websiteUrl: e.target.value })} /></label>
          <div>
            <span className={labelCls}>Tile size in the grid</span>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button key={s.value} type="button" aria-pressed={draft.size === s.value} onClick={() => setDraft({ ...draft, size: s.value })}
                  className={cn(btnSecondary, draft.size === s.value && 'border-[#2563FF] bg-[#EFF4FF] text-[#2563FF] hover:border-[#2563FF] hover:text-[#2563FF]')}>
                  {s.label} <span className="text-[#6B7280]">({s.hint})</span>
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#0B0F19]">
            <input type="checkbox" checked={draft.published ?? true} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
            Published on the homepage
          </label>
          <p className="text-sm text-[#6B7280]">Save first, then add the screenshot of their website from the list below.</p>
          <div className="flex gap-2">
            <button type="button" className={btnPrimary} onClick={save} disabled={pending || !draft.name.trim() || !draft.quote.trim()}>
              {pending && <Loader2 className="w-4 h-4 animate-spin" />} Save
            </button>
            <button type="button" className={btnSecondary} onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}

      <ul className="space-y-3">
        {items.map((t, i) => (
          <li key={t.id} className="rounded-xl border border-[#E5E7EB] bg-white p-4 flex gap-4">
            <div className="w-36 shrink-0">
              <div className="aspect-[16/10] rounded-lg overflow-hidden bg-[#F7F8FA] flex items-center justify-center">
                {t.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.thumbnailUrl} alt="" className="w-full h-full object-cover object-top" />
                ) : (
                  <span className="text-xs text-[#6B7280] px-2 text-center">No screenshot</span>
                )}
              </div>
              <div className="mt-2 flex gap-2 text-sm">
                <label className="inline-flex items-center gap-1 text-[#2563FF] cursor-pointer">
                  <ImagePlus className="w-4 h-4" /> {t.thumbnailUrl ? 'Replace' : 'Upload'}
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(t, e.target.files?.[0])} />
                </label>
                {t.thumbnailUrl && <button type="button" className="text-[#6B7280] hover:text-red-600" onClick={() => removeImage(t)}>Remove</button>}
              </div>
              <p className="mt-1 text-xs text-[#6B7280]">16:10, e.g. 1600 x 1000, 4 MB max</p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#0B0F19]">{t.name}{t.business && <span className="font-normal text-[#5B6475]"> · {t.business}</span>}</p>
              <p className="text-sm text-[#374151] line-clamp-3 mt-1">“{t.quote}”</p>
              <p className="text-xs text-[#6B7280] mt-2">{SIZES.find((s) => s.value === t.size)?.label ?? t.size} tile · {t.published ? 'Published' : 'Hidden'}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button type="button" aria-label="Move up" className={btnSecondary} disabled={i === 0 || pending} onClick={() => move(i, -1)}><ChevronUp className="w-4 h-4" /></button>
              <button type="button" aria-label="Move down" className={btnSecondary} disabled={i === items.length - 1 || pending} onClick={() => move(i, 1)}><ChevronDown className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button type="button" className={btnSecondary} onClick={() => togglePublished(t)} disabled={pending}>{t.published ? 'Hide' : 'Publish'}</button>
              <button type="button" aria-label="Edit" className={btnSecondary} onClick={() => openEdit(t)}><Pencil className="w-4 h-4" /></button>
              <button type="button" aria-label="Delete" className={cn(btnSecondary, 'hover:text-red-600')} onClick={() => remove(t)} disabled={pending}><Trash2 className="w-4 h-4" /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
