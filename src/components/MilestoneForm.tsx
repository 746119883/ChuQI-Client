import { useState, type FormEvent } from 'react'
import api from '@/lib/api'
import {
  useCreateMilestone,
  useDeleteMilestone,
  useUpdateMilestone,
  useUploadMilestoneCover,
  type MilestoneInput,
} from '@/hooks/useMilestones'
import { MILESTONE_TYPES } from '@/lib/milestoneMeta'
import type { Milestone, MilestoneType, Visibility } from '@/lib/types'
import { Trash2 } from 'lucide-react'

interface Props {
  milestone?: Milestone
  onDone: () => void
  onCancel: () => void
}

export default function MilestoneForm({ milestone, onDone, onCancel }: Props) {
  const editing = !!milestone
  const create = useCreateMilestone()
  const update = useUpdateMilestone(milestone?.id ?? 0)
  const uploadCover = useUploadMilestoneCover(milestone?.id ?? 0)
  const del = useDeleteMilestone()

  const [title, setTitle] = useState(milestone?.title ?? '')
  const [date, setDate] = useState(milestone?.date ?? '')
  const [type, setType] = useState<MilestoneType>(milestone?.milestone_type ?? 'other')
  const [description, setDescription] = useState(milestone?.description ?? '')
  const [visibility, setVisibility] = useState<Visibility>(milestone?.visibility ?? 'family')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const pending = create.isPending || update.isPending || uploadCover.isPending

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (!title.trim() || !date) {
      setErr('标题和日期必填')
      return
    }
    const payload: MilestoneInput = {
      title: title.trim(),
      date,
      milestone_type: type,
      description: description.trim(),
      visibility,
    }
    try {
      if (editing) {
        await update.mutateAsync(payload)
        if (coverFile) await uploadCover.mutateAsync(coverFile)
      } else {
        const created = await create.mutateAsync(payload)
        if (coverFile) {
          // 新建后单独上传封面
          const fd = new FormData()
          fd.append('cover', coverFile)
          await api.post(`/milestones/${created.id}/cover/`, fd, {
            headers: { 'Content-Type': undefined } as never,
          })
        }
      }
      onDone()
    } catch (e) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setErr(msg ?? '保存失败')
    }
  }

  const onDelete = () => {
    if (!milestone) return
    if (!confirm(`删除「${milestone.title}」?`)) return
    del.mutate(milestone.id, { onSuccess: onDone })
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl p-4 space-y-3 border border-slate-200">
      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="发生了什么大事？"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {MILESTONE_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`text-sm px-2.5 py-1 rounded-full border ${
              type === t.value
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="多说两句（可选）"
        rows={2}
        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="text-sm text-slate-600 flex items-center gap-2">
          封面
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
        </label>
        <label className="text-sm text-slate-600 flex items-center gap-2">
          <input
            type="checkbox"
            checked={visibility === 'private'}
            onChange={(e) => setVisibility(e.target.checked ? 'private' : 'family')}
          />
          仅自己可见
        </label>
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <div className="flex items-center justify-between">
        {editing ? (
          <button
            type="button"
            onClick={onDelete}
            className="text-sm text-slate-400 hover:text-rose-600"
          ><Trash2 className="w-3.5 h-3.5" /></button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
          >
            {pending ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </form>
  )
}