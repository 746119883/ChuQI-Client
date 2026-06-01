import { Link, useParams } from 'react-router-dom'
import { useHealthProfiles } from '@/hooks/useHealth'
import { useVisits } from '@/hooks/useVisits'
import HealthTabs from '@/components/HealthTabs'
import type { VisitType } from '@/lib/types'

export const VISIT_TYPE_LABEL: Record<VisitType, string> = {
  outpatient: '门诊', emergency: '急诊', inpatient: '住院',
}

export default function VisitsPage() {
  const { userId } = useParams<{ userId: string }>()
  const uid = Number(userId)
  const { data: members = [] } = useHealthProfiles()
  const member = members.find((m) => m.id === uid)
  const { data: visits = [] } = useVisits(uid)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/health" className="text-slate-400 hover:text-slate-600 text-sm">← 返回</Link>
        <h1 className="text-xl font-semibold text-slate-900">{member?.display_name ?? ''} 的健康档案</h1>
      </div>

      <HealthTabs userId={uid} active="visits" />

      <div className="flex justify-end">
        <Link to={`/health/${uid}/visits/new`}
          className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-700">
          + 新建就医记录
        </Link>
      </div>

      {visits.length === 0 ? (
        <p className="text-center py-12 text-slate-400">暂无就医记录</p>
      ) : (
        <div className="space-y-2">
          {visits.map((v) => (
            <Link key={v.id} to={`/health/${uid}/visits/${v.id}`}
              className="block bg-white rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">{v.hospital || '未填医院'}</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-500">
                  {VISIT_TYPE_LABEL[v.visit_type]}
                </span>
                {v.department && <span className="text-sm text-slate-400">{v.department}</span>}
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{v.visit_date}</p>
              {v.diagnosis && <p className="text-sm text-slate-600 mt-1 line-clamp-1">{v.diagnosis}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
