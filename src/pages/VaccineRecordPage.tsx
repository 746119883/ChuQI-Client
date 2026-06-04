import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useVaccineRecord, useSaveVaccineRecord } from '@/hooks/useVaccines'
import HealthAttachments from '@/components/HealthAttachments'

export default function VaccineRecordPage() {
  const { userId, planId } = useParams<{ userId: string; planId: string }>()
  const uid = Number(userId)
  const pid = Number(planId)
  const navigate = useNavigate()

  const { data: existing } = useVaccineRecord(pid)
  const save = useSaveVaccineRecord(uid, pid)

  const [administeredDate, setAdministeredDate] = useState('')
  const [location, setLocation] = useState('')
  const [brandBatch, setBrandBatch] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (existing) {
      setAdministeredDate(existing.administered_date)
      setLocation(existing.location)
      setBrandBatch(existing.brand_batch)
      setNote(existing.note)
    }
  }, [existing])

  const submit = async () => {
    if (!administeredDate) return
    await save.mutateAsync({
      administered_date: administeredDate,
      location: location.trim(),
      brand_batch: brandBatch.trim(),
      note: note.trim(),
    })
    navigate(`/health/${uid}/vaccines`)
  }

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">接种记录</h1>

      <div className="bg-white rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-slate-700">实际接种日期</label>
            <input type="date" value={administeredDate} onChange={(e) => setAdministeredDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-700">接种地点</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-700">疫苗品牌/批次（选填）</label>
          <input value={brandBatch} onChange={(e) => setBrandBatch(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-700">备注</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none" />
        </div>
      </div>

      {existing && (
        <HealthAttachments params={{ vaccination_record: existing.id }} accept="image/jpeg,image/png" />
      )}

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">取消</button>
        <button type="button" onClick={submit} disabled={!administeredDate || save.isPending}
          className="px-5 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40">
          {save.isPending ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
