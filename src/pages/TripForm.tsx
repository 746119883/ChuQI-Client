import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useCreateTrip,
  useTrip,
  useUpdateTrip,
  useUploadTripCover,
} from '@/hooks/useTrips'
import { useImmichStatus } from '@/hooks/useImmich'
import api from '@/lib/api'
import ImmichPicker from '@/components/ImmichPicker'
import type { ImmichAsset, Visibility } from '@/lib/types'

export default function TripForm() {
  const { id } = useParams<{ id: string }>()
  const editId = id ? Number(id) : undefined
  const isEdit = !!editId
  const navigate = useNavigate()

  const { data: existing } = useTrip(editId)
  const create = useCreateTrip()
  const update = useUpdateTrip(editId ?? 0)
  const uploadCoverMutation = useUploadTripCover(editId ?? 0)
  const { data: immichStatus } = useImmichStatus()

  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [summary, setSummary] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('family')

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverImmich, setCoverImmich] = useState<ImmichAsset | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    if (existing) {
      setTitle(existing.title)
      setDestination(existing.destination)
      setStartDate(existing.start_date)
      setEndDate(existing.end_date ?? '')
      setSummary(existing.summary)
      setVisibility(existing.visibility)
      if (existing.cover_url && !coverPreview) setCoverPreview(existing.cover_url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing])

  const onPickLocalCover = (f: File | null) => {
    setCoverFile(f)
    setCoverImmich(null)
    setCoverPreview(f ? URL.createObjectURL(f) : null)
  }
  const onPickImmichCover = (assets: ImmichAsset[]) => {
    const a = assets[0]
    if (!a) return
    setCoverImmich(a)
    setCoverFile(null)
    setCoverPreview(a.thumbnail_url)
  }

  const submit = async () => {
    if (!title.trim() || !startDate) return
    const payload = {
      title: title.trim(),
      destination: destination.trim(),
      start_date: startDate,
      end_date: endDate || null,
      summary: summary.trim(),
      visibility,
      cover_immich_asset_id: coverImmich?.id ?? (isEdit ? undefined : ''),
    }

    let tripId = editId
    if (isEdit) await update.mutateAsync(payload)
    else {
      const created = await create.mutateAsync(payload)
      tripId = created.id
    }

    if (coverFile && tripId) {
      if (tripId === editId) {
        await uploadCoverMutation.mutateAsync(coverFile)
      } else {
        const fd = new FormData()
        fd.append('cover', coverFile)
        await api.post(`/trips/${tripId}/cover/`, fd, {
          headers: { 'Content-Type': undefined } as never,
        })
      }
    }

    navigate(`/trips/${tripId}`, { replace: true })
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">{isEdit ? '编辑旅行' : '新旅行'}</h1>

      <div className="bg-white rounded-xl p-5 space-y-4">
        <div>
          <label className="text-sm text-slate-700 block mb-1.5">封面</label>
          <div className="flex items-center gap-4">
            <div className="w-28 h-20 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
              {coverPreview ? (
                <img src={coverPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">🧳</span>
              )}
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <label className="text-slate-600 cursor-pointer hover:text-slate-900">
                📷 上传图片
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onPickLocalCover(e.target.files?.[0] ?? null)}
                />
              </label>
              {immichStatus?.enabled && (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="text-left text-slate-600 hover:text-slate-900"
                >
                  🖼 从 Immich 选
                </button>
              )}
            </div>
          </div>
        </div>

        <label className="space-y-1 block">
          <span className="text-sm text-slate-700">标题</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="2026 五一·三亚"
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-sm text-slate-700">目的地</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="海南三亚"
            className="w-full px-3 py-2 border border-slate-200 rounded-md"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-sm text-slate-700">出发日期</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-slate-700">返回日期</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md"
            />
          </label>
        </div>

        <label className="space-y-1 block">
          <span className="text-sm text-slate-700">备注 / 实用信息</span>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="当地交通、注意事项、必带物品..."
            className="w-full px-3 py-2 border border-slate-200 rounded-md resize-none"
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          className="text-sm text-slate-600 bg-transparent focus:outline-none"
        >
          <option value="family">家人可见</option>
          <option value="private">仅自己</option>
        </select>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
            取消
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!title.trim() || !startDate || pending}
            className="px-5 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40"
          >
            {pending ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <ImmichPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onConfirm={onPickImmichCover}
        maxSelect={1}
      />
    </div>
  )
}
