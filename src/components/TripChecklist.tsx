import { useState, type KeyboardEvent } from 'react'
import {
  useAddChecklistItem,
  useDeleteChecklistItem,
  useToggleChecklistItem,
} from '@/hooks/useTrips'
import type { ChecklistKind, TripChecklistItem } from '@/lib/types'

interface Props {
  tripId: number
  items: TripChecklistItem[]
  canEdit: boolean
}

const GROUPS: { kind: ChecklistKind; title: string; icon: string; placeholder: string }[] = [
  { kind: 'bring', title: '要带的', icon: '🎒', placeholder: '加一项要带的东西' },
  { kind: 'buy', title: '要买的', icon: '🛍', placeholder: '加一项要买的东西' },
]

export default function TripChecklist({ tripId, items, canEdit }: Props) {
  return (
    <section className="grid sm:grid-cols-2 gap-3">
      {GROUPS.map((g) => (
        <ChecklistGroup
          key={g.kind}
          tripId={tripId}
          kind={g.kind}
          title={g.title}
          icon={g.icon}
          placeholder={g.placeholder}
          items={items.filter((it) => it.kind === g.kind)}
          canEdit={canEdit}
        />
      ))}
    </section>
  )
}

function ChecklistGroup({
  tripId,
  kind,
  title,
  icon,
  placeholder,
  items,
  canEdit,
}: {
  tripId: number
  kind: ChecklistKind
  title: string
  icon: string
  placeholder: string
  items: TripChecklistItem[]
  canEdit: boolean
}) {
  const add = useAddChecklistItem(tripId)
  const toggle = useToggleChecklistItem(tripId)
  const del = useDeleteChecklistItem(tripId)
  const [text, setText] = useState('')

  const doneCount = items.filter((i) => i.checked).length

  const submit = () => {
    const t = text.trim()
    if (!t) return
    add.mutate({ kind, text: t })
    setText('')
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">
          {icon} {title}
        </h3>
        <span className="text-xs text-slate-400">
          {doneCount}/{items.length}
        </span>
      </div>

      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-2 group">
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => toggle.mutate({ id: it.id, checked: !it.checked })}
              className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 text-xs ${
                it.checked
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'border-slate-300 text-transparent'
              }`}
            >
              ✓
            </button>
            <span
              className={`flex-1 text-sm ${
                it.checked ? 'line-through text-slate-400' : 'text-slate-800'
              }`}
            >
              {it.text}
            </span>
            {canEdit && (
              <button
                type="button"
                onClick={() => del.mutate(it.id)}
                className="text-slate-300 hover:text-rose-600 text-xs opacity-0 group-hover:opacity-100 shrink-0"
              >
                ×
              </button>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-slate-400 py-1">还没有</li>
        )}
      </ul>

      {canEdit && (
        <div className="flex gap-2 mt-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder={placeholder}
            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim() || add.isPending}
            className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40"
          >
            加
          </button>
        </div>
      )}
    </div>
  )
}
