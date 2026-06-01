import { Link, useNavigate, useParams } from 'react-router-dom'
import { useVisit, useDeleteVisit } from '@/hooks/useVisits'
import { VISIT_TYPE_LABEL } from '@/pages/VisitsPage'
import HealthAttachments from '@/components/HealthAttachments'

export default function VisitDetailPage() {
  const { userId, visitId } = useParams<{ userId: string; visitId: string }>()
  const uid = Number(userId)
  const vid = Number(visitId)
  const navigate = useNavigate()
  const { data: v } = useVisit(vid)
  const del = useDeleteVisit(uid)

  if (!v) {
    return <div className="text-center py-20 text-slate-400">加载中…</div>
  }

  const Field = ({ label, value }: { label: string; value: string }) =>
    value ? (
      <div className="space-y-0.5">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-slate-800 whitespace-pre-wrap">{value}</p>
      </div>
    ) : null

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Link to={`/health/${uid}/visits`} className="text-slate-400 hover:text-slate-600 text-sm">← 返回</Link>
        <h1 className="text-xl font-semibold text-slate-900">{v.hospital || '就医记录'}</h1>
        <div className="ml-auto flex gap-2">
          <Link to={`/health/${uid}/visits/${vid}/edit`}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-700">编辑</Link>
          <button onClick={() => { if (window.confirm('删除该就医记录？')) { del.mutate(vid); navigate(`/health/${uid}/visits`) } }}
            className="px-3 py-1.5 rounded-lg text-rose-600 text-sm hover:bg-rose-50">删除</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>{v.visit_date}</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100">{VISIT_TYPE_LABEL[v.visit_type]}</span>
          {v.department && <span>{v.department}</span>}
        </div>
        <Field label="诊断/主诉" value={v.diagnosis} />
        <Field label="处置/用药" value={v.treatment} />
        <Field label="医生" value={v.doctor} />
        {v.followup_date && <Field label="复诊日期" value={v.followup_date} />}
      </div>

      <HealthAttachments params={{ medical_visit: vid }} multiple />
    </div>
  )
}
