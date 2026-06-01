import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCheckupResult, useSaveCheckupResult } from '@/hooks/useCheckups'
import HealthAttachments from '@/components/HealthAttachments'
import type { HealthMetric } from '@/lib/types'

export default function CheckupResultPage() {
  const { userId, planId } = useParams<{ userId: string; planId: string }>()
  const uid = Number(userId)
  const pid = Number(planId)
  const navigate = useNavigate()

  const { data: existing } = useCheckupResult(pid)
  const save = useSaveCheckupResult(uid, pid)

  const [visitDate, setVisitDate] = useState('')
  const [hospital, setHospital] = useState('')
  const [items, setItems] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [advice, setAdvice] = useState('')
  const [metrics, setMetrics] = useState<HealthMetric[]>([])

  useEffect(() => {
    if (existing) {
      setVisitDate(existing.visit_date)
      setHospital(existing.hospital)
      setItems(existing.items)
      setConclusion(existing.conclusion)
      setAdvice(existing.advice)
      setMetrics(existing.metrics ?? [])
    }
  }, [existing])

  const setMetric = (i: number, patch: Partial<HealthMetric>) =>
    setMetrics((p) => p.map((m, idx) => (idx === i ? { ...m, ...patch } : m)))
  const addMetric = () =>
    setMetrics((p) => [...p, { name: '', value: null, unit: '', reference: '', abnormal: false }])
  const removeMetric = (i: number) =>
    setMetrics((p) => p.filter((_, idx) => idx !== i))

  const submit = async () => {
    if (!visitDate) return
    await save.mutateAsync({
      visit_date: visitDate,
      hospital: hospital.trim(),
      items: items.trim(),
      conclusion: conclusion.trim(),
      advice: advice.trim(),
      metrics: metrics
        .filter((m) => m.name.trim())
        .map((m) => ({ ...m, name: m.name.trim() })),
    })
    navigate(`/health/${uid}/checkups`)
  }

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">录入体检结果</h1>

      <div className="bg-white rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-slate-700">就诊日期</label>
            <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-700">医院名称</label>
            <input value={hospital} onChange={(e) => setHospital(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-700">项目列表</label>
          <textarea value={items} onChange={(e) => setItems(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-700">结论</label>
          <textarea value={conclusion} onChange={(e) => setConclusion(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-slate-700">医生建议</label>
          <textarea value={advice} onChange={(e) => setAdvice(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">健康指标</h2>
          <button type="button" onClick={addMetric} className="text-sm text-blue-600 hover:underline">
            + 添加健康指标
          </button>
        </div>
        {metrics.length === 0 && <p className="text-sm text-slate-400">暂无</p>}
        <div className="space-y-2">
          {metrics.map((m, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input value={m.name} onChange={(e) => setMetric(i, { name: e.target.value })}
                placeholder="指标名（如血压-收缩压）"
                className="flex-1 min-w-[140px] px-3 py-2 border border-slate-200 rounded-md text-sm" />
              <input type="number" value={m.value ?? ''}
                onChange={(e) => setMetric(i, { value: e.target.value === '' ? null : Number(e.target.value) })}
                placeholder="数值"
                className="w-20 px-2 py-2 border border-slate-200 rounded-md text-sm" />
              <input value={m.unit} onChange={(e) => setMetric(i, { unit: e.target.value })}
                placeholder="单位"
                className="w-20 px-2 py-2 border border-slate-200 rounded-md text-sm" />
              <input value={m.reference} onChange={(e) => setMetric(i, { reference: e.target.value })}
                placeholder="参考范围"
                className="w-24 px-2 py-2 border border-slate-200 rounded-md text-sm" />
              <label className="flex items-center gap-1 text-sm text-slate-600">
                <input type="checkbox" checked={m.abnormal}
                  onChange={(e) => setMetric(i, { abnormal: e.target.checked })} />
                异常
              </label>
              <button type="button" onClick={() => removeMetric(i)}
                className="text-slate-300 hover:text-rose-600 w-6">×</button>
            </div>
          ))}
        </div>
      </div>

      {existing && <HealthAttachments params={{ checkup_result: existing.id }} />}

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">取消</button>
        <button type="button" onClick={submit} disabled={!visitDate || save.isPending}
          className="px-5 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40">
          {save.isPending ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
