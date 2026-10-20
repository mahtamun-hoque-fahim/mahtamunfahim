'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, ImagePlus, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { NewPortfolioItem, PortfolioItem } from '@/lib/db/queries'
import { MAX_AVATAR_BYTES } from '@/lib/constants'
import { cn, slugify } from '@/lib/utils'
import {
  createPortfolioItemAction,
  deletePortfolioItemAction,
  removePortfolioImageAction,
  reorderPortfolioItemsAction,
  updatePortfolioItemAction,
  uploadPortfolioImageAction,
} from '@/app/admin/actions'

const inputCls =
  'w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#0B0F19] placeholder-[#6B7280] focus:outline-none focus:border-[#2563FF] transition-colors'
const labelCls = 'block text-sm font-medium text-[#0B0F19] mb-1'
const hintCls = 'mt-1 text-xs text-[#6B7280]'
const btnPrimary =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563FF] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors disabled:opacity-50'
const btnSecondary =
  'inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#5B6475] hover:text-[#0B0F19] hover:border-[#D1D5DB] transition-colors'

const SIZES: Array<{ value: string; label: string; hint: string }> = [
  { value: 'normal', label: 'Normal', hint: 'one tile' },
  { value: 'wide', label: 'Wide', hint: 'two tiles across' },
  { value: 'tall', label: 'Tall', hint: 'two tiles down' },
]

type Draft = Pick<NewPortfolioItem, 'title' | 'slug' | 'client' | 'summary' | 'body' | 'websiteUrl' | 'size' | 'published' | 'featured'>
const emptyDraft: Draft = { title: '', slug: '', client: '', summary: '', body: '', websiteUrl: '', size: 'normal', published: false, featured: false }

export default function PortfolioManager({ initial }: { initial: PortfolioItem[] }) {
  const [items, setItems] = useState(initial)
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()

  const current = editing && editing !== 'new' ? items.find((x) => x.id === editing) : undefined
  const replace = (item: PortfolioItem) => setItems((list) => list.map((x) => (x.id === item.id ? item : x)))

  // Every action returns { error } instead of throwing (see app/admin/actions.ts).
  const run = (fn: () => Promise<string | undefined | void>) => {
    setError('')
    start(async () => {
      try {
        const msg = await fn()
        if (msg) setError(msg)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.')
      }
    })
  }

  const openNew = () => { setDraft(emptyDraft); setEditing('new') }
  const openEdit = (p: PortfolioItem) => {
    setDraft({ title: p.title, slug: p.slug, client: p.client, summary: p.summary, body: p.body, websiteUrl: p.websiteUrl ?? '', size: p.size, published: p.published, featured: p.featured })
    setEditing(p.id)
  }

  const save = () => run(async () => {
    if (editing === 'new') {
      const res = await createPortfolioItemAction({ ...draft, sortOrder: items.length })
      if (res.error) return res.error
      setItems([...items, res.item!])
      // stay in the editor so the cover and gallery can be added straight away
      setDraft({ ...draft, slug: res.item!.slug })
      setEditing(res.item!.id)
    } else if (editing) {
      const res = await updatePortfolioItemAction(editing, draft)
      if (res.error) return res.error
      replace(res.item!)
      setEditing(null)
    }
  })

  const remove = (p: PortfolioItem) => {
    if (!confirm(`Delete "${p.title}"? Its page goes away too. This cannot be undone.`)) return
    run(async () => {
      const res = await deletePortfolioItemAction(p.id)
      if (res.error) return res.error
      setItems(items.filter((x) => x.id !== p.id))
      if (editing === p.id) setEditing(null)
    })
  }

  const move = (index: number, dir: -1 | 1) => {
    const next = [...items]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j], next[index]]
    setItems(next)
    run(async () => (await reorderPortfolioItemsAction(next.map((p, i) => ({ id: p.id, order: i })))).error)
  }

  const togglePublished = (p: PortfolioItem) => run(async () => {
    const res = await updatePortfolioItemAction(p.id, { published: !p.published })
    if (res.error) return res.error
    replace(res.item!)
  })

  const toggleFeatured = (p: PortfolioItem) => run(async () => {
    const res = await updatePortfolioItemAction(p.id, { featured: !p.featured })
    if (res.error) return res.error
    replace(res.item!)
  })

  const upload = (p: PortfolioItem, slot: 'cover' | 'gallery', files: FileList | null) => {
    const list = Array.from(files ?? [])
    if (list.some((f) => f.size > MAX_AVATAR_BYTES)) return setError('Each image must be under 4MB.')
    run(async () => {
      // one at a time: each upload appends to the list the previous one returned
      for (const file of list) {
        const fd = new FormData()
        fd.set('file', file)
        const res = await uploadPortfolioImageAction(p.id, slot, fd)
        if (res.error) return res.error
        replace(res.item!)
      }
    })
  }

  const removeImage = (p: PortfolioItem, url?: string) => run(async () => {
    const res = await removePortfolioImageAction(p.id, url)
    if (res.error) return res.error
    replace(res.item!)
  })

  return (
    <div className="space-y-4" style={{ fontFamily: 'var(--font-jakarta)' }}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#5B6475]">
          {items.length === 0 ? 'No portfolio items yet.' : `${items.filter((p) => p.published).length} of ${items.length} published`}
        </p>
        <button type="button" className={btnPrimary} onClick={openNew} disabled={pending}>
          <Plus className="w-4 h-4" /> Add portfolio item
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      {editing && (
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#0B0F19]">{editing === 'new' ? 'New portfolio item' : 'Edit portfolio item'}</h2>
            <button type="button" aria-label="Close" onClick={() => setEditing(null)} className="text-[#6B7280] hover:text-[#0B0F19]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label><span className={labelCls}>Title *</span>
              <input className={inputCls} value={draft.title} maxLength={120} placeholder="A booking site for Studio Raya" onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
            <label><span className={labelCls}>Client</span>
              <input className={inputCls} value={draft.client ?? ''} maxLength={80} placeholder="Studio Raya" onChange={(e) => setDraft({ ...draft, client: e.target.value })} /></label>
          </div>
          <label className="block"><span className={labelCls}>Page link</span>
            <input className={inputCls} value={draft.slug ?? ''} maxLength={80} placeholder={slugify(draft.title) || 'made-from-the-title'} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
            <span className={hintCls}>/portfolio/{slugify(draft.slug || draft.title) || '...'} Leave empty to make it from the title.</span></label>
          <label className="block"><span className={labelCls}>Summary</span>
            <textarea className={inputCls} rows={2} maxLength={300} value={draft.summary ?? ''} placeholder="What the business needed and what changed." onChange={(e) => setDraft({ ...draft, summary: e.target.value })} />
            <span className={hintCls}>One or two lines, shown on the grid tile and at the top of the page.</span></label>
          <label className="block"><span className={labelCls}>Details</span>
            <textarea className={cn(inputCls, 'font-mono')} rows={12} maxLength={20000} value={draft.body ?? ''} placeholder={'## The problem\n\n## What I built\n\n## The result'} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
            <span className={hintCls}>Markdown, like a blog post. Shown on the item&apos;s page, above the images.</span></label>
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
            <input type="checkbox" checked={draft.published ?? false} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
            Published on /portfolio
          </label>
          <label className="flex items-center gap-2 text-sm text-[#0B0F19]">
            <input type="checkbox" checked={draft.featured ?? false} onChange={(e) => setDraft({ ...draft, featured: e.target.checked })} />
            Featured on the homepage (shows there only while published)
          </label>

          {current ? (
            <div className="grid sm:grid-cols-2 gap-6 pt-2 border-t border-[#E5E7EB]">
              <div>
                <span className={labelCls}>Cover photo</span>
                <div className="aspect-[16/10] rounded-lg overflow-hidden bg-white border border-[#E5E7EB] flex items-center justify-center">
                  {current.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={current.coverUrl} alt="" className="w-full h-full object-cover object-top" />
                  ) : (
                    <span className="text-xs text-[#6B7280]">No cover yet</span>
                  )}
                </div>
                <div className="mt-2 flex gap-3 text-sm">
                  <label className="inline-flex items-center gap-1 text-[#2563FF] cursor-pointer">
                    <ImagePlus className="w-4 h-4" /> {current.coverUrl ? 'Replace' : 'Upload'}
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(current, 'cover', e.target.files)} />
                  </label>
                  {current.coverUrl && <button type="button" className="text-[#6B7280] hover:text-red-600" onClick={() => removeImage(current)}>Remove</button>}
                </div>
                <p className={hintCls}>The grid thumbnail and the top of the page. 16:10, e.g. 1600 x 1000, 4 MB max. Saved as soon as it uploads.</p>
              </div>
              <div>
                <span className={labelCls}>Images on the page ({current.images.length})</span>
                <div className="grid grid-cols-3 gap-2">
                  {current.images.map((url) => (
                    <div key={url} className="relative aspect-[4/3] rounded-md overflow-hidden bg-white border border-[#E5E7EB]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" aria-label="Remove image" onClick={() => removeImage(current, url)}
                        className="absolute top-1 right-1 rounded-full bg-white/90 p-1 text-[#5B6475] hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-[4/3] rounded-md border border-dashed border-[#D1D5DB] flex items-center justify-center text-[#2563FF] cursor-pointer">
                    <ImagePlus className="w-5 h-5" />
                    <span className="sr-only">Add images</span>
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(current, 'gallery', e.target.files)} />
                  </label>
                </div>
                <p className={hintCls}>Shown full width below the details, in this order. Any size, 4 MB max each, up to 20.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#6B7280]">Save first, then add the cover photo and the images.</p>
          )}

          <div className="flex gap-2">
            <button type="button" className={btnPrimary} onClick={save} disabled={pending || !draft.title.trim()}>
              {pending && <Loader2 className="w-4 h-4 animate-spin" />} Save
            </button>
            <button type="button" className={btnSecondary} onClick={() => setEditing(null)}>{current ? 'Done' : 'Cancel'}</button>
          </div>
        </div>
      )}

      <ul className="space-y-3">
        {items.map((p, i) => (
          <li key={p.id} className="rounded-xl border border-[#E5E7EB] bg-white p-4 flex gap-4">
            <div className="w-36 shrink-0 aspect-[16/10] rounded-lg overflow-hidden bg-[#F7F8FA] flex items-center justify-center">
              {p.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverUrl} alt="" className="w-full h-full object-cover object-top" />
              ) : (
                <span className="text-xs text-[#6B7280] px-2 text-center">No cover</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#0B0F19]">{p.title}{p.client && <span className="font-normal text-[#5B6475]"> · {p.client}</span>}</p>
              {p.summary && <p className="text-sm text-[#374151] line-clamp-2 mt-1">{p.summary}</p>}
              <p className="text-xs text-[#6B7280] mt-2 flex items-center gap-2">
                {SIZES.find((s) => s.value === p.size)?.label ?? p.size} tile · {p.images.length} images · {p.published ? 'Published' : 'Hidden'}{p.featured && ' · Featured on the homepage'}
                {p.published && (
                  <a href={`/portfolio/${p.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#2563FF] hover:underline">
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button type="button" aria-label="Move up" className={btnSecondary} disabled={i === 0 || pending} onClick={() => move(i, -1)}><ChevronUp className="w-4 h-4" /></button>
              <button type="button" aria-label="Move down" className={btnSecondary} disabled={i === items.length - 1 || pending} onClick={() => move(i, 1)}><ChevronDown className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button type="button" className={btnSecondary} onClick={() => togglePublished(p)} disabled={pending}>{p.published ? 'Hide' : 'Publish'}</button>
              <button type="button" className={btnSecondary} onClick={() => toggleFeatured(p)} disabled={pending}>{p.featured ? 'Unfeature' : 'Feature'}</button>
              <button type="button" aria-label="Edit" className={btnSecondary} onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></button>
              <button type="button" aria-label="Delete" className={cn(btnSecondary, 'hover:text-red-600')} onClick={() => remove(p)} disabled={pending}><Trash2 className="w-4 h-4" /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
