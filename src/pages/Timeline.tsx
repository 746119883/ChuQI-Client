import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMilestones, useTimeline } from '@/hooks/useMilestones'
import { useMe } from '@/hooks/useAuth'
import MilestoneForm from '@/components/MilestoneForm'
import type { Milestone, TimelineEntry } from '@/lib/types'

function dayLabel(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export default function Timeline() {
  const { data: entries, isLoading } = useTimeline()
  const { data: milestones } = useMilestones()
  const { data: me } = useMe()

  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Milestone | null>(null)

  // 我能编辑的大事记（用于点击 timeline 条目时打开编辑）
  const myMilestones = useMemo(() => {
    const map = new Map<number, Milestone>()
    for (const m of milestones ?? []) {
      if (m.created_by.id === me?.id) map.set(m.id, m)
    }
    return map
  }, [milestones, me])

  // 按年份分组
  const byYear = useMemo(() => {
    const map = new Map<string, TimelineEntry[]>()
    for (const e of entries ?? []) {
      const y = e.date.slice(0, 4)
      if (!map.has(y)) map.set(y, [])
      map.get(y)!.push(e)
    }
    return Array.from(map.entries())
  }, [entries])

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">家庭大事记</h1>
          <p className="text-sm text-slate-500 mt-0.5">把值得记住的大日子串成一条线</p>
        </div>
        {!adding && !editing && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="px-3 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700"
          >
            + 记一笔大事
          </button>
        )}
      </div>

      {adding && (
        <MilestoneForm onDone={() => setAdding(false)} onCancel={() => setAdding(false)} />
      )}
      {editing && (
        <MilestoneForm
          milestone={editing}
          onDone={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      )}

      {isLoading && <p className="text-slate-500">加载中...</p>}

      {entries && entries.length === 0 && !adding && (
        <p className="text-sm text-slate-400 py-8 text-center">
          还没有大事记。旅行会自动出现在这里，点「+ 记一笔大事」添加宝宝出生、买房、纪念日等。
        </p>
      )}

      {byYear.map(([year, items]) => (
        <section key={year} className="space-y-3">
          <div className="text-lg font-semibold text-slate-400">{year}</div>
          <div className="space-y-3 border-l-2 border-slate-200 ml-3 pl-5">
            {items.map((e) => {
              const editable = e.kind === 'milestone' && myMilestones.has(e.id)
              const inner = (
                <div className="flex gap-3">
                  {e.cover_url && (
                    <img
                      src={e.cover_url}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0 bg-slate-100"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{e.title}</span>
                      {e.kind === 'trip' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-600">
                          旅行
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {dayLabel(e.date)}
                      {e.end_date && ` – ${dayLabel(e.end_date)}`}
                      {e.subtitle && ` · ${e.subtitle}`}
                    </div>
                    {e.description && (
                      <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap line-clamp-3">
                        {e.description}
                      </p>
                    )}
                  </div>
                </div>
              )

              return (
                <div key={`${e.kind}-${e.id}`} className="relative">
                  <span className="absolute -left-[26px] top-3 w-7 h-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-sm">
                    {e.icon}
                  </span>
                  {e.kind === 'trip' ? (
                    <Link to={`/trips/${e.id}`} className="block bg-white rounded-xl p-3 hover:bg-slate-50">
                      {inner}
                    </Link>
                  ) : editable ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(myMilestones.get(e.id)!)
                        setAdding(false)
                      }}
                      className="block w-full text-left bg-white rounded-xl p-3 hover:bg-slate-50"
                    >
                      {inner}
                    </button>
                  ) : (
                    <div className="bg-white rounded-xl p-3">{inner}</div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
