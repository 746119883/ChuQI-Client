import { useParams, useNavigate } from 'react-router-dom'
import { useHealthProfile, useHealthProfiles } from '@/hooks/useHealth'
import { useVisits } from '@/hooks/useVisits'
import { VISIT_TYPE_LABEL } from '@/pages/VisitsPage'
import type { AllergyType } from '@/lib/types'

const BLOOD_LABEL: Record<string, string> = {
  A: 'A', B: 'B', AB: 'AB', O: 'O', unknown: '不确定',
}

const ALLERGY_TYPE_LABEL: Record<AllergyType, string> = {
  '': '', drug: '药物', food: '食物', environment: '环境',
}

export default function HealthSnapshotPage() {
  const { userId } = useParams<{ userId: string }>()
  const uid = Number(userId)
  const navigate = useNavigate()
  const { data: members = [] } = useHealthProfiles()
  const { data: profile } = useHealthProfile(uid)
  const { data: visits = [] } = useVisits(uid)
  const member = members.find((m) => m.id === uid)
  const recentVisits = visits.slice(0, 5)

  const allergies = profile?.allergies ?? []
  const conditions = profile?.chronic_conditions ?? []
  const medications = profile?.medications ?? []

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <div className="max-w-2xl mx-auto p-5 space-y-5 text-lg">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/health/${uid}`)}
            className="text-slate-500 hover:text-slate-900 text-base"
          >
            ← 返回
          </button>
          <span className="text-base text-slate-400">就医快照</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          {member?.display_name ?? '健康档案'}
        </h1>

        {/* 血型大字 */}
        <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between">
          <span className="text-slate-500">血型</span>
          <span className="text-4xl font-bold text-slate-900">
            {profile?.blood_type ? (BLOOD_LABEL[profile.blood_type] ?? profile.blood_type) : '—'}
          </span>
        </div>

        {/* 过敏史（标红） */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-400">过敏史</h2>
          {allergies.length === 0 ? (
            <p className="text-slate-400">无</p>
          ) : (
            <ul className="space-y-2">
              {allergies.map((a, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-2">
                  <span className="text-xl font-bold text-rose-600">{a.name}</span>
                  {a.type && ALLERGY_TYPE_LABEL[a.type] && (
                    <span className="text-sm text-rose-400">{ALLERGY_TYPE_LABEL[a.type]}</span>
                  )}
                  {a.note && <span className="text-slate-500">{a.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 慢性病 */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-400">慢性病</h2>
          {conditions.length === 0 ? (
            <p className="text-slate-400">无</p>
          ) : (
            <ul className="space-y-1.5">
              {conditions.map((c, i) => (
                <li key={i} className="text-slate-900">
                  <span className="font-semibold">{c.name}</span>
                  {c.diagnosed_date && <span className="ml-2 text-sm text-slate-400">{c.diagnosed_date}</span>}
                  {c.note && <span className="ml-2 text-slate-500">{c.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 长期用药 */}
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-slate-400">长期用药</h2>
          {medications.length === 0 ? (
            <p className="text-slate-400">无</p>
          ) : (
            <ul className="space-y-1.5">
              {medications.map((m, i) => (
                <li key={i} className="text-slate-900">
                  <span className="font-semibold">{m.name}</span>
                  {m.dosage && <span className="ml-2 text-sm text-slate-400">{m.dosage}</span>}
                  {m.note && <span className="ml-2 text-slate-500">{m.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 近期就诊 */}
        <section className="space-y-2 border-t border-slate-100 pt-4">
          <h2 className="text-base font-semibold text-slate-400">近期就诊</h2>
          {recentVisits.length === 0 ? (
            <p className="text-slate-400">暂无就诊记录</p>
          ) : (
            <ul className="space-y-1.5">
              {recentVisits.map((v) => (
                <li key={v.id} className="text-slate-900">
                  <span className="text-sm text-slate-400">{v.visit_date}</span>
                  <span className="ml-2 font-medium">{v.hospital || '未填医院'}</span>
                  <span className="ml-2 text-sm text-slate-400">{VISIT_TYPE_LABEL[v.visit_type]}</span>
                  {v.diagnosis && <span className="ml-2 text-slate-600">{v.diagnosis}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
