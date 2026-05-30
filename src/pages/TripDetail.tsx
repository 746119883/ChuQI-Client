import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useDeleteTrip,
  useDeleteTripItem,
  useTrip,
  useTripToImmichAlbum,
  useTripToMoment,
} from '@/hooks/useTrips'
import { useMe } from '@/hooks/useAuth'
import { ITEM_TYPE_META, STATUS_META, dateRangeLabel } from '@/lib/tripMeta'
import TripItemForm from '@/components/TripItemForm'
import TripChecklist from '@/components/TripChecklist'
import type { TripItem } from '@/lib/types'

export default function TripDetail() {
  const { id } = useParams<{ id: string }>()
  const tripId = Number(id)
  const navigate = useNavigate()
  const { data: trip, isLoading } = useTrip(tripId)
  const { data: me } = useMe()
  const del = useDeleteTrip()
  const delItem = useDeleteTripItem(tripId)
  const toMoment = useTripToMoment(tripId)
  const toAlbum = useTripToImmichAlbum(tripId)

  const [adding, setAdding] = useState(false)
  const [editingItem, setEditingItem] = useState<TripItem | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, TripItem[]>()
    for (const it of trip?.items ?? []) {
      if (!map.has(it.date)) map.set(it.date, [])
      map.get(it.date)!.push(it)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [trip])

  if (isLoading) return <p className="text-slate-500">加载中...</p>
  if (!trip) return <p className="text-slate-500">旅行不存在</p>

  const isOwner = me?.id === trip.owner.id
  // 清单是协作的：家人可见的旅行任何家人都能改
  const canEditChecklist = isOwner || trip.visibility === 'family'
  const st = STATUS_META[trip.status]

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const onToMoment = async () => {
    const res = await toMoment.mutateAsync(true)
    flash(
      res.photos_attached > 0
        ? `已发动态，带了 ${res.photos_attached} 张照片`
        : '已发动态（这段时间 Immich 没照片）',
    )
  }

  const onToAlbum = async () => {
    try {
      const res = await toAlbum.mutateAsync()
      flash(`已归集 ${res.asset_count} 张到 Immich 相册「${res.album_name}」`)
    } catch (e) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      flash(msg ?? '归集失败')
    }
  }

  const onDelete = () => {
    if (!confirm(`删除旅行「${trip.title}」?`)) return
    del.mutate(trip.id, { onSuccess: () => navigate('/trips', { replace: true }) })
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Link to="/trips" className="text-sm text-slate-500 hover:text-slate-900">
        ← 旅行
      </Link>

      {trip.cover_url && (
        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[16/9]">
          <img src={trip.cover_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900">{trip.title}</h1>
              <span className={`text-xs px-1.5 py-0.5 rounded ${st.cls}`}>{st.label}</span>
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {trip.destination && <>📍 {trip.destination} · </>}
              {dateRangeLabel(trip.start_date, trip.end_date)}
            </div>
          </div>
          {isOwner && (
            <div className="flex items-center gap-3 text-sm shrink-0 pt-1">
              <Link to={`/trips/${trip.id}/edit`} className="text-slate-500 hover:text-slate-900">
                编辑
              </Link>
              <button onClick={onDelete} className="text-slate-400 hover:text-rose-600">
                删除
              </button>
            </div>
          )}
        </div>
        {trip.summary && (
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mt-3">{trip.summary}</p>
        )}
      </div>

      {/* 一键操作 */}
      {isOwner && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToMoment}
            disabled={toMoment.isPending}
            className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
          >
            {toMoment.isPending ? '发布中...' : '📣 发成动态'}
          </button>
          <button
            type="button"
            onClick={onToAlbum}
            disabled={toAlbum.isPending}
            className="px-3 py-1.5 text-sm bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50"
          >
            {toAlbum.isPending ? '归集中...' : '🖼 归集到 Immich 相册'}
          </button>
        </div>
      )}
      {toast && <p className="text-sm text-emerald-600">{toast}</p>}

      {/* 旅行清单 */}
      <TripChecklist tripId={trip.id} items={trip.checklist} canEdit={canEditChecklist} />

      {/* 行程 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">行程</h2>
          {isOwner && !adding && (
            <button
              type="button"
              onClick={() => { setAdding(true); setEditingItem(null) }}
              className="text-sm text-blue-600 hover:underline"
            >
              + 加行程
            </button>
          )}
        </div>

        {adding && (
          <TripItemForm
            tripId={trip.id}
            defaultDate={trip.start_date}
            onDone={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        )}

        {grouped.length === 0 && !adding && (
          <p className="text-sm text-slate-400 py-4">还没有行程，点「+ 加行程」开始排。</p>
        )}

        {grouped.map(([date, items]) => (
          <div key={date} className="bg-white rounded-xl p-4">
            <div className="text-sm font-medium text-slate-700 mb-3 border-b border-slate-100 pb-2">
              {date}
            </div>
            <div className="space-y-3">
              {items.map((it) =>
                editingItem?.id === it.id ? (
                  <TripItemForm
                    key={it.id}
                    tripId={trip.id}
                    defaultDate={it.date}
                    item={it}
                    onDone={() => setEditingItem(null)}
                    onCancel={() => setEditingItem(null)}
                  />
                ) : (
                  <div key={it.id} className="flex gap-3">
                    <div className="text-lg shrink-0 w-6 text-center">
                      {ITEM_TYPE_META[it.item_type].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {it.time && <span className="text-xs text-slate-400">{it.time.slice(0, 5)}</span>}
                        <span className="font-medium text-slate-900">{it.title}</span>
                      </div>
                      {it.location && <div className="text-xs text-slate-500 mt-0.5">📍 {it.location}</div>}
                      {it.detail && (
                        <div className="text-sm text-slate-600 mt-0.5 whitespace-pre-wrap">{it.detail}</div>
                      )}
                    </div>
                    {isOwner && (
                      <div className="flex flex-col gap-1 text-xs shrink-0">
                        <button onClick={() => { setEditingItem(it); setAdding(false) }} className="text-slate-400 hover:text-slate-900">
                          改
                        </button>
                        <button
                          onClick={() => { if (confirm('删除这项行程?')) delItem.mutate(it.id) }}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          删
                        </button>
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
