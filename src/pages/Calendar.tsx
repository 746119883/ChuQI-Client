import { useState } from 'react'
import { useUpcoming } from '@/hooks/useEvents'
import EventForm from '@/components/EventForm'
import UpcomingList from '@/components/UpcomingList'
import MonthCalendar from '@/components/MonthCalendar'

type Tab = 'upcoming' | 'month'

export default function Calendar() {
  const [tab, setTab] = useState<Tab>('upcoming')
  const [creating, setCreating] = useState(false)
  const { data: upcoming, isLoading } = useUpcoming(365)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setTab('upcoming')}
            className={`text-base font-semibold transition-colors ${
              tab === 'upcoming' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            即将到来
          </button>
          <button
            type="button"
            onClick={() => setTab('month')}
            className={`text-base font-semibold transition-colors ${
              tab === 'month' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            月历
          </button>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700"
        >
          {creating ? '取消' : '新建事件'}
        </button>
      </div>

      {creating && <EventForm onDone={() => setCreating(false)} />}

      {tab === 'upcoming' && (
        <>
          {isLoading && <p className="text-slate-500">加载中...</p>}
          {upcoming && <UpcomingList items={upcoming} />}
        </>
      )}

      {tab === 'month' && <MonthCalendar />}
    </div>
  )
}
