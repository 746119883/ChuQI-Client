import { useMemo, useState } from 'react'
import { useOccurrences } from '@/hooks/useEvents'
import type { EventOccurrence } from '@/lib/types'

function monthRange(year: number, month: number) {
  // month: 1-12; 返回包含整月的 6 周网格起止 (周日为周首)
  const first = new Date(year, month - 1, 1)
  const firstDayOfWeek = first.getDay()
  const gridStart = new Date(year, month - 1, 1 - firstDayOfWeek)
  const gridEnd = new Date(gridStart)
  gridEnd.setDate(gridStart.getDate() + 41)
  return { gridStart, gridEnd }
}

function fmt(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function MonthCalendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)

  const { gridStart, gridEnd } = useMemo(
    () => monthRange(year, month),
    [year, month],
  )

  const { data: occurrences } = useOccurrences(fmt(gridStart), fmt(gridEnd))

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventOccurrence[]>()
    for (const o of occurrences ?? []) {
      if (!map.has(o.date)) map.set(o.date, [])
      map.get(o.date)!.push(o)
    }
    return map
  }, [occurrences])

  const cells: { date: Date; inMonth: boolean }[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    cells.push({ date: d, inMonth: d.getMonth() + 1 === month })
  }

  const goPrev = () => {
    if (month === 1) {
      setYear(year - 1)
      setMonth(12)
    } else setMonth(month - 1)
  }
  const goNext = () => {
    if (month === 12) {
      setYear(year + 1)
      setMonth(1)
    } else setMonth(month + 1)
  }

  return (
    <div className="bg-white rounded-xl p-4">
      <header className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goPrev}
          className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded"
        >
          ‹
        </button>
        <h3 className="text-base font-semibold">
          {year} 年 {month} 月
        </h3>
        <button
          type="button"
          onClick={goNext}
          className="px-3 py-1 text-sm text-slate-600 hover:bg-slate-100 rounded"
        >
          ›
        </button>
      </header>

      <div className="grid grid-cols-7 text-center text-xs text-slate-400 mb-1">
        {['日', '一', '二', '三', '四', '五', '六'].map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ date: d, inMonth }) => {
          const key = fmt(d)
          const items = eventsByDate.get(key) ?? []
          const isToday = key === fmt(today)
          return (
            <div
              key={key}
              className={`aspect-square rounded-md p-1 text-xs flex flex-col ${
                inMonth ? 'bg-slate-50' : 'bg-transparent'
              } ${isToday ? 'ring-2 ring-slate-900' : ''}`}
            >
              <div
                className={`text-right ${
                  inMonth ? 'text-slate-700' : 'text-slate-300'
                } ${isToday ? 'font-semibold' : ''}`}
              >
                {d.getDate()}
              </div>
              <div className="flex-1 mt-0.5 space-y-0.5 overflow-hidden">
                {items.slice(0, 3).map((o) => (
                  <div
                    key={o.event.id}
                    title={o.event.title}
                    className="truncate text-[10px] px-1 rounded text-white"
                    style={{ backgroundColor: o.event.color }}
                  >
                    {o.event.title}
                  </div>
                ))}
                {items.length > 3 && (
                  <div className="text-[10px] text-slate-400">
                    +{items.length - 3}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
