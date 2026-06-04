import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateVisit, useUpdateVisit, useVisit } from '@/hooks/useVisits'
import type { VisitType } from '@/lib/types'

export default function VisitFormPage() {
  const { userId, visitId } = useParams<{ userId: string; visitId: string }>()
  const uid = Number(userId)
  const editId = visitId ? Number(visitId) : undefined
  const isEdit = !!editId
  const navigate = useNavigate()

  const { data: existing } = useVisit(editId)
  const create = useCreateVisit(uid)
  const update = useUpdateVisit(uid, editId ?? 0)

  const [visitDate, setVisitDate] = useState('')
  const [hospital, setHospital] = useState('')
  const [department, setDepartment] = useState('')
  const [visitType, setVisitType] = useState<VisitType>('outpatient')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [doctor, setDoctor] = useState('')
  const [followupDate, setFollowupDate] = useState('')

  useEffect(() => {
    if (existing) {
      setVisitDate(existing.visit_date)
      setHospital(existing.hospital)
      setDepartment(existing.department)
      setVisitType(existing.visit_type)
      setDiagnosis(existing.diagnosis)
      setTreatment(existing.treatment)
      setDoctor(existing.doctor)
      setFollowupDate(existing.followup_date ?? '')
    }
  }, [existing])

  const submit = async () => {
    if (!visitDate) return
    const payload = {
      user: uid,
      visit_date: visitDate,
      hospital: hospital.trim(),
      department: department.trim(),
      visit_type: visitType,
      diagnosis: diagnosis.trim(),
      treatment: treatment.trim(),
      doctor: doctor.trim(),
      followup_date: followupDate || null,
    }
    if (isEdit) {
      await update.mutateAsync(payload)
      navigate(`/health/${uid}/visits/${editId}`)
    } else {
      const created = await create.mutateAsync(payload)
      navigate(`/health/${uid}/visits/${created.id}`)
    }
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">{isEdit ? '编辑就医记录' : '新建就医记录'}</h1>

      <div className="bg-white rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-slate-700">就医日期</label>
            <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-700">就诊类型</label>
            <select value={visitType} onChange={(e) => setVisitType(e.target.value as VisitType)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm">
              <option value="outpatient">门诊</option>
              <option value="emergency">急诊</option>
              <option value="inpatient">住院</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-700">医院名称</label>
            <input value={hospital} onChange={(e) => setHospital(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-700">科室</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-700">诊断/主诉</label>
          <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-700">处置/用药</label>
          <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-slate-700">医生姓名（选填）</label>
            <input value={doctor} onChange={(e) => setDoctor(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-700">复诊日期（选填）</label>
            <input type="date" value={followupDate} onChange={(e) => setFollowupDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">取消</button>
        <button type="button" onClick={submit} disabled={!visitDate || pending}
          className="px-5 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40">
          {pending ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
