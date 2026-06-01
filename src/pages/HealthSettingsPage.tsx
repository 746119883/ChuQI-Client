import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReminderSettings, useUpdateReminderSettings } from '@/hooks/useReminderSettings'

const LEAD_OPTIONS = [
  { value: 0, label: '关闭' },
  { value: 1, label: '1天' },
  { value: 3, label: '3天' },
  { value: 7, label: '7天' },
  { value: 14, label: '14天' },
]

export default function HealthSettingsPage() {
  const { data } = useReminderSettings()
  const update = useUpdateReminderSettings()

  const [vaccine, setVaccine] = useState(3)
  const [checkup, setCheckup] = useState(7)
  const [followup, setFollowup] = useState(3)

  useEffect(() => {
    if (data) {
      setVaccine(data.vaccine_lead_days)
      setCheckup(data.checkup_lead_days)
      setFollowup(data.followup_lead_days)
    }
  }, [data])

  const save = async () => {
    await update.mutateAsync({
      vaccine_lead_days: vaccine,
      checkup_lead_days: checkup,
      followup_lead_days: followup,
    })
    window.alert('已保存')
  }

  const Row = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-slate-800">{label}</span>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="px-3 py-1.5 border border-slate-200 rounded-md text-sm">
        {LEAD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/health" className="text-slate-400 hover:text-slate-600 text-sm">← 返回</Link>
        <h1 className="text-xl font-semibold text-slate-900">提醒设置</h1>
      </div>

      <div className="bg-white rounded-xl p-5">
        <p className="text-sm text-slate-400 mb-2">提前多少天提醒（关闭则不提醒）</p>
        <Row label="疫苗接种提醒" value={vaccine} onChange={setVaccine} />
        <Row label="体检计划提醒" value={checkup} onChange={setCheckup} />
        <Row label="复诊日期提醒" value={followup} onChange={setFollowup} />
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={update.isPending}
          className="px-5 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40">
          {update.isPending ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
