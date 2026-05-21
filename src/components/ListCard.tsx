import { Link } from 'react-router-dom'
import type { TaskList } from '@/lib/types'

interface Props {
  list: TaskList
}

export default function ListCard({ list }: Props) {
  const pct = list.total > 0 ? Math.round((list.done / list.total) * 100) : 0

  return (
    <Link
      to={`/lists/${list.id}`}
      className="block bg-white rounded-xl p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-slate-900 truncate">{list.name}</h3>
        {!list.is_shared && (
          <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded shrink-0">
            私密
          </span>
        )}
      </div>

      <div className="text-xs text-slate-400 mb-3">
        {list.owner.username} · {list.done} / {list.total} 完成
      </div>

      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  )
}
