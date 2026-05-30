import { useState } from 'react'
import { useCreateTripItem, useUpdateTripItem } from '@/hooks/useTrips'
import { ITEM_TYPES } from '@/lib/tripMeta'
import type { TripItem, TripItemType } from '@/lib/types'

interface Props {
  tripId: number
  defaultDate: string
  item?: TripItem
  onDone: () => void
  onCancel: () => void
}

export default function TripItemForm({ tripId, defaultDate, item, onDone, onCancel }: Props) {
  const isEdit = !!item
  const create = useCreateTripItem(tripId)
  const update = useUpdateTripItem(tripId)

  const [date, setDate] = useState(item?.date ?? defaultDate)
  const [time, setTime] = useState(item?.time ?? '')
  const [type, setType] = useState<TripItemType>(item?.item_type ?? 'activity')
  const [title, setTitle] = useState(item?.title ?? '')
  const [detail, setDetail] = useState(item?.detail ?? '')
  const [location, setLocation] = useState(item?.location ?? '')

  const submit = async () => {
    if (!title.trim() || !date) return
    const payload = {
      trip: tripId,
      date,
      time: time || null,
      item_type: type,
      title: title.trim(),
      detail: detail.trim(),
      location: location.trim(),
    }
    if (isEdit) await update.mutateAsync({ id: item!.id, ...payload })
    else await create.mutateAsync(payload)
    onDone()
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-200">
      <div className="flex flex-wrap gap-1.5">
        {ITEM_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`px-2.5 py-1 rounded-full text-xs border ${
              type === t.value
                ? 'bg-slate-900 text-white border-slate-900'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-md text-sm"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-md text-sm"
        />
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题，如 MU5137 浦东→三亚"
        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
      />
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="地点 (可选)"
        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
      />
      <textarea
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        rows={2}
        placeholder="详情：航班号 / 确认号 / 地址 (可选)"
        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none"
      />

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-slate-600">
          取消
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!title.trim() || pending}
          className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40"
        >
          {pending ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
