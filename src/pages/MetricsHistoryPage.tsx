import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMetricsHistory } from '@/hooks/useCheckups'
import { useHealthProfiles } from '@/hooks/useHealth'
import HealthTabs from '@/components/HealthTabs'

export default function MetricsHistoryPage() {
  const { userId } = useParams<{ userId: string }>()
  const uid = Number(userId)
  const { data: members = [] } = useHealthProfiles()
  const member = members.find((m) => m.id === uid)

  const [query, setQuery] = useState('')
  const [name, setName] = useState('')
  const { data: history = [] } = useMetricsHistory(uid, name)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/health" className="text-slate-400 hover:text-slate-600 text-sm">← 返回</Link>
        <h1 className="text-xl font-semibold text-slate-900">{member?.display_name ?? ''} 的指标历史</h1>
      </div>

      <HealthTabs userId={uid} active="checkups" />

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入指标名，如「血压-收缩压」"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
        />
        <button
          onClick={() => setName(query.trim())}
          className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm hover:bg-slate-700"
        >
          查询
        </button>
      </div>

      {name && (
        history.length === 0 ? (
          <p className="text-center py-12 text-slate-400">「{name}」暂无历史记录</p>
        ) : (
          <div className="bg-white rounded-xl divide-y divide-slate-100">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <span className="text-sm text-slate-400">{h.date}</span>
                <span className={`text-sm font-medium ${h.abnormal ? 'text-rose-600' : 'text-slate-900'}`}>
                  {h.value ?? '—'} {h.unit}
                  {h.reference && <span className="ml-2 text-xs text-slate-400">参考 {h.reference}</span>}
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
