import { useMemo, useState } from 'react'
import type { MediaItem } from '@/lib/types'
import MediaLightbox from './MediaLightbox'

interface Props {
  items: MediaItem[]
  groupByMonth?: boolean
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function MediaGrid({ items, groupByMonth = false }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const groups = useMemo(() => {
    if (!groupByMonth) return null
    const map = new Map<string, MediaItem[]>()
    for (const m of items) {
      const dateStr = m.taken_at ?? m.uploaded_at
      const d = new Date(dateStr)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(m)
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [items, groupByMonth])

  if (items.length === 0) {
    return <p className="text-center text-slate-500 py-16">还没有照片/视频</p>
  }

  const renderItem = (m: MediaItem, idx: number) => {
    const previewUrl = m.type === 'photo' ? m.thumbnail || m.image : m.poster
    return (
      <button
        type="button"
        key={`${m.type}-${m.id}`}
        onClick={() => setLightboxIndex(idx)}
        className="aspect-square overflow-hidden rounded-md bg-slate-200 cursor-pointer group relative"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={m.caption}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full bg-slate-300" />
        )}
        {m.type === 'video' && (
          <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                <span className="text-white text-base ml-0.5">▶</span>
              </div>
            </div>
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 text-xs text-white bg-black/60 rounded">
              {formatDuration(m.duration)}
            </div>
          </>
        )}
      </button>
    )
  }

  return (
    <>
      {groups ? (
        <div className="space-y-6">
          {groups.map(([month, monthItems]) => {
            const [y, mo] = month.split('-')
            return (
              <section key={month}>
                <h3 className="text-sm font-medium text-slate-600 mb-2">
                  {y} 年 {parseInt(mo, 10)} 月 · {monthItems.length} 项
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {monthItems.map((m) => {
                    const globalIdx = items.indexOf(m)
                    return renderItem(m, globalIdx)
                  })}
                </div>
              </section>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {items.map(renderItem)}
        </div>
      )}

      {lightboxIndex !== null && (
        <MediaLightbox
          items={items}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
        />
      )}
    </>
  )
}
