import { useState, type FormEvent } from 'react'
import { useCreateEvent } from '@/hooks/useEvents'
import type { EventType, Visibility } from '@/lib/types'

const EVENT_TYPE_OPTIONS: { value: EventType; label: string; color: string }[] = [
  { value: 'general', label: '一般事件', color: '#3b82f6' },
  { value: 'birthday', label: '生日', color: '#ec4899' },
  { value: 'anniversary', label: '纪念日', color: '#8b5cf6' },
  { value: 'memorial', label: '忌日', color: '#64748b' },
  { value: 'holiday', label: '节日', color: '#f59e0b' },
]

interface Props {
  onDone?: () => void
}

export default function EventForm({ onDone }: Props) {
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState<EventType>('general')
  const [isLunar, setIsLunar] = useState(false)
  const [year, setYear] = useState<number | ''>('')
  const [month, setMonth] = useState<number | ''>('')
  const [day, setDay] = useState<number | ''>('')
  const [yearly, setYearly] = useState(false)
  const [visibility, setVisibility] = useState<Visibility>('family')
  const [description, setDescription] = useState('')

  const create = useCreateEvent()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !month || !day) return
    const color = EVENT_TYPE_OPTIONS.find((o) => o.value === eventType)?.color
    await create.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      event_type: eventType,
      color,
      visibility,
      is_lunar: isLunar,
      date_year: year === '' ? null : Number(year),
      date_month: Number(month),
      date_day: Number(day),
      yearly_recurring: yearly,
    })
    setTitle('')
    setDescription('')
    setYear('')
    setMonth('')
    setDay('')
    setYearly(false)
    setIsLunar(false)
    onDone?.()
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-xl p-5 space-y-4"
    >
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="事件标题,比如 妈妈生日"
          required
          maxLength={100}
          autoFocus
          className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {EVENT_TYPE_OPTIONS.map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => setEventType(opt.value)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              eventType === opt.value
                ? 'border-transparent text-white'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            style={
              eventType === opt.value ? { backgroundColor: opt.color } : undefined
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => setIsLunar(false)}
          className={`px-3 py-1 rounded border transition-colors ${
            !isLunar
              ? 'bg-slate-900 text-white border-slate-900'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          公历
        </button>
        <button
          type="button"
          onClick={() => setIsLunar(true)}
          className={`px-3 py-1 rounded border transition-colors ${
            isLunar
              ? 'bg-slate-900 text-white border-slate-900'
              : 'border-slate-200 text-slate-600'
          }`}
        >
          农历
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-slate-500">年(可选)</label>
          <input
            type="number"
            value={year}
            onChange={(e) =>
              setYear(e.target.value === '' ? '' : Number(e.target.value))
            }
            min={1900}
            max={2100}
            placeholder={yearly ? '不需要' : '比如 1960'}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">月 *</label>
          <input
            type="number"
            value={month}
            onChange={(e) =>
              setMonth(e.target.value === '' ? '' : Number(e.target.value))
            }
            min={1}
            max={12}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">日 *</label>
          <input
            type="number"
            value={day}
            onChange={(e) =>
              setDay(e.target.value === '' ? '' : Number(e.target.value))
            }
            min={1}
            max={isLunar ? 30 : 31}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={yearly}
            onChange={(e) => setYearly(e.target.checked)}
          />
          每年重复(生日、纪念日勾上)
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={visibility === 'private'}
            onChange={(e) =>
              setVisibility(e.target.checked ? 'private' : 'family')
            }
          />
          仅自己可见
        </label>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="备注(可选)"
        rows={2}
        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={create.isPending}
          className="px-5 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
        >
          {create.isPending ? '保存中...' : '保存'}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-5 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
        >
          取消
        </button>
      </div>
    </form>
  )
}
