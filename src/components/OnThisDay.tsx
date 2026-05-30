import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOnThisDay } from '@/hooks/useMoments'
import type { OnThisDayGroup } from '@/lib/types'

function yearsAgoLabel(n: number) {
  return n === 1 ? '去年的今天' : `${n} 年前的今天`
}

export default function OnThisDay() {
  const { data } = useOnThisDay()
  const [zoom, setZoom] = useState<string | null>(null)

  if (!data || data.groups.length === 0) return null

  return (
    <section className="bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-100 rounded-2xl p-5 space-y-4">
      <h2 className="flex items-center gap-2 font-semibold text-slate-900">
        <span>📅</span> 那年今日
      </h2>

      {data.groups.map((g: OnThisDayGroup) => (
        <div key={g.year} className="space-y-2">
          <div className="text-sm font-medium text-amber-700">
            {yearsAgoLabel(g.years_ago)}
            <span className="text-slate-400 font-normal"> · {g.year}</span>
          </div>

          {/* 照片 */}
          {g.photos.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {g.photos.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setZoom(p.preview_url)}
                  className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-100"
                >
                  <img
                    src={p.thumbnail_url}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </button>
              ))}
            </div>
          )}

          {/* 动态 */}
          {g.moments.map((m) => (
            <div key={m.id} className="text-sm text-slate-700 bg-white/70 rounded-lg px-3 py-2">
              <span className="text-slate-400">
                {m.author.display_name || m.author.username}：
              </span>
              {m.content || '(图片动态)'}
            </div>
          ))}

          {/* 旅行 */}
          {g.trips.map((t) => (
            <Link
              key={t.id}
              to={`/trips/${t.id}`}
              className="flex items-center gap-2 text-sm bg-white/70 rounded-lg px-3 py-2 hover:bg-white"
            >
              {t.cover_url ? (
                <img src={t.cover_url} alt="" className="w-8 h-8 rounded object-cover" />
              ) : (
                <span>✈️</span>
              )}
              <span className="text-slate-800 font-medium">{t.title}</span>
              {t.destination && <span className="text-slate-400">· {t.destination}</span>}
            </Link>
          ))}
        </div>
      ))}

      {zoom && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setZoom(null)}
        >
          <img src={zoom} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </section>
  )
}
