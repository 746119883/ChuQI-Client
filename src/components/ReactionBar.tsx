import { useState } from 'react'
import { useReact } from '@/hooks/useMoments'
import type { Moment, ReactionKey } from '@/lib/types'

export const REACTIONS: { key: ReactionKey; char: string; label: string }[] = [
  { key: 'like', char: '👍', label: '赞' },
  { key: 'love', char: '❤️', label: '爱了' },
  { key: 'haha', char: '😂', label: '哈哈' },
  { key: 'wow', char: '😮', label: '哇' },
  { key: 'sad', char: '😢', label: '难过' },
  { key: 'celebrate', char: '🎉', label: '庆祝' },
]

interface Props {
  moment: Moment
}

export default function ReactionBar({ moment }: Props) {
  const react = useReact()
  const [open, setOpen] = useState(false)

  const mine = moment.my_reaction
  const mineChar = mine ? REACTIONS.find((r) => r.key === mine)?.char : null

  const pick = (emoji: ReactionKey) => {
    setOpen(false)
    react.mutate({ momentId: moment.id, emoji })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1 transition-colors ${
            mine ? 'text-rose-500' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span className="text-base leading-none">{mineChar ?? '🙂'}</span>
          <span>{mine ? '已回应' : '回应'}</span>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute bottom-7 left-0 z-20 flex gap-1 bg-white border border-slate-200 rounded-full shadow-md px-2 py-1.5">
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  title={r.label}
                  onClick={() => pick(r.key)}
                  className={`text-xl leading-none w-8 h-8 rounded-full hover:bg-slate-100 transition-transform hover:scale-125 ${
                    mine === r.key ? 'bg-rose-50' : ''
                  }`}
                >
                  {r.char}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 已有的表情聚合 */}
      {moment.reactions_summary.length > 0 && (
        <div className="flex items-center gap-1">
          {moment.reactions_summary.map((s) => (
            <button
              key={s.emoji}
              type="button"
              onClick={() => pick(s.emoji)}
              className={`flex items-center gap-0.5 text-xs rounded-full px-2 py-0.5 border ${
                s.mine
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <span className="text-sm leading-none">{s.char}</span>
              <span>{s.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
