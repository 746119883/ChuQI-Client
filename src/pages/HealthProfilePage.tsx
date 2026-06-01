import { useParams, Link, useNavigate } from 'react-router-dom'
import { useHealthProfile, useHealthProfiles } from '@/hooks/useHealth'
import HealthTabs from '@/components/HealthTabs'
import type { AllergyType } from '@/lib/types'

const BLOOD_LABEL: Record<string, string> = {
  A: 'A', B: 'B', AB: 'AB', O: 'O', unknown: '不确定',
}

const ALLERGY_TYPE_LABEL: Record<AllergyType, string> = {
  '': '',
  drug: '药物',
  food: '食物',
  environment: '环境',
}

export default function HealthProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const uid = Number(userId)
  const navigate = useNavigate()
  const { data: members = [], isLoading } = useHealthProfiles()
  const { data: profile } = useHealthProfile(uid)
  const member = members.find((m) => m.id === uid)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        加载中…
      </div>
    )
  }

  if (!member) {
    return (
      <div className="text-center py-20 text-slate-400">
        找不到该成员
      </div>
    )
  }

  const allergies = profile?.allergies ?? []
  const conditions = profile?.chronic_conditions ?? []
  const medications = profile?.medications ?? []
  const hasData =
    !!profile?.blood_type ||
    allergies.length > 0 ||
    conditions.length > 0 ||
    medications.length > 0

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center gap-3">
        <Link to="/health" className="text-slate-400 hover:text-slate-600 text-sm">
          ← 返回
        </Link>
        <h1 className="text-xl font-semibold text-slate-900">{member.display_name} 的健康档案</h1>
        <button
          onClick={() => navigate(`/health/${uid}/edit`)}
          className="ml-auto px-4 py-1.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-700"
        >
          编辑
        </button>
      </div>

      {/* 标签栏 */}
      <HealthTabs userId={uid} active="profile" />

      {/* 档案内容 */}
      {!hasData ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-slate-400 space-y-2">
          <p className="text-4xl">🏥</p>
          <p className="font-medium text-slate-600">暂无信息</p>
          <p className="text-sm">点击「编辑」填写健康基础信息</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* 血型 */}
          <Section title="血型">
            <p className="text-slate-900">
              {profile?.blood_type ? (BLOOD_LABEL[profile.blood_type] ?? profile.blood_type) : '未填写'}
            </p>
          </Section>

          {/* 过敏史 */}
          <Section title="过敏史">
            {allergies.length === 0 ? (
              <p className="text-sm text-slate-400">无</p>
            ) : (
              <ul className="space-y-1.5">
                {allergies.map((a, i) => (
                  <li key={i} className="text-sm text-slate-700">
                    <span className="font-medium text-rose-600">{a.name}</span>
                    {a.type && ALLERGY_TYPE_LABEL[a.type] && (
                      <span className="ml-2 text-xs text-slate-400">{ALLERGY_TYPE_LABEL[a.type]}</span>
                    )}
                    {a.note && <span className="ml-2 text-slate-500">— {a.note}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* 慢性病 */}
          <Section title="慢性病">
            {conditions.length === 0 ? (
              <p className="text-sm text-slate-400">无</p>
            ) : (
              <ul className="space-y-1.5">
                {conditions.map((c, i) => (
                  <li key={i} className="text-sm text-slate-700">
                    <span className="font-medium">{c.name}</span>
                    {c.diagnosed_date && <span className="ml-2 text-xs text-slate-400">{c.diagnosed_date}</span>}
                    {c.note && <span className="ml-2 text-slate-500">— {c.note}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* 长期用药 */}
          <Section title="长期用药">
            {medications.length === 0 ? (
              <p className="text-sm text-slate-400">无</p>
            ) : (
              <ul className="space-y-1.5">
                {medications.map((m, i) => (
                  <li key={i} className="text-sm text-slate-700">
                    <span className="font-medium">{m.name}</span>
                    {m.dosage && <span className="ml-2 text-xs text-slate-400">{m.dosage}</span>}
                    {m.note && <span className="ml-2 text-slate-500">— {m.note}</span>}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}

      {/* 就医快照入口 */}
      <button
        onClick={() => navigate(`/health/${uid}/snapshot`)}
        className="w-full bg-white rounded-2xl shadow-sm p-4 text-left flex items-center justify-between text-slate-700 hover:shadow-md transition-shadow"
      >
        <span className="font-medium">就医快照</span>
        <span className="text-slate-300">›</span>
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-1.5">
      <h3 className="text-xs font-medium text-slate-400">{title}</h3>
      {children}
    </div>
  )
}
