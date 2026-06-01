import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useHealthProfiles } from '@/hooks/useHealth'
import {
  useVaccines,
  useCreateVaccine,
  useUpdateVaccine,
  useDeleteVaccine,
  useLoadChildVaccineSchedule,
} from '@/hooks/useVaccines'
import HealthTabs from '@/components/HealthTabs'
import { ageInYears } from '@/lib/age'
import type { VaccinePlan } from '@/lib/types'

export default function VaccinesPage() {
  const { userId } = useParams<{ userId: string }>()
  const uid = Number(userId)
  const { data: members = [] } = useHealthProfiles()
  const member = members.find((m) => m.id === uid)
  const { data: plans = [] } = useVaccines(uid)
  const create = useCreateVaccine(uid)
  const update = useUpdateVaccine(uid)
  const del = useDeleteVaccine(uid)
  const loadSchedule = useLoadChildVaccineSchedule(uid)

  const age = ageInYears(member?.birthday)
  const isChild = age !== null && age < 7

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [dose, setDose] = useState('1')
  const [scheduledDate, setScheduledDate] = useState('')

  const pending = plans.filter((p) => p.status === 'pending' && !p.is_overdue)
  const overdue = plans.filter((p) => p.is_overdue)
  const done = plans.filter((p) => p.status === 'done')
  const skipped = plans.filter((p) => p.status === 'skipped')

  const submit = async () => {
    if (!name.trim() || !scheduledDate) return
    await create.mutateAsync({
      user: uid, vaccine_name: name.trim(),
      dose_number: Number(dose) || 1, scheduled_date: scheduledDate,
    })
    setName(''); setDose('1'); setScheduledDate(''); setShowForm(false)
  }

  const onLoadSchedule = async () => {
    if (plans.length > 0 && !window.confirm('已有计划，确认后将追加缺失的国家免疫规划剂次？')) return
    const r = await loadSchedule.mutateAsync()
    window.alert(`已添加 ${r.created} 条，跳过 ${r.skipped} 条已存在`)
  }

  const Row = ({ p }: { p: VaccinePlan }) => (
    <div className={`rounded-xl p-4 flex items-center gap-3 ${p.is_overdue ? 'bg-rose-50' : 'bg-white'}`}>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-slate-900">{p.vaccine_name}</span>
        <span className="ml-2 text-sm text-slate-400">第{p.dose_number}剂</span>
        <p className={`text-sm mt-0.5 ${p.is_overdue ? 'text-rose-600' : 'text-slate-400'}`}>
          {p.scheduled_date}{p.is_overdue ? ' · 已逾期' : ''}
        </p>
      </div>
      {p.status === 'pending' && (
        <>
          <Link to={`/health/${uid}/vaccines/${p.id}/record`} className="text-sm text-emerald-600 hover:underline shrink-0">
            标记已接种
          </Link>
          <button onClick={() => update.mutate({ id: p.id, status: 'skipped' })}
            className="text-sm text-slate-400 hover:underline shrink-0">跳过</button>
        </>
      )}
      {p.status === 'done' && (
        <Link to={`/health/${uid}/vaccines/${p.id}/record`} className="text-sm text-blue-600 hover:underline shrink-0">
          查看记录
        </Link>
      )}
      <button onClick={() => del.mutate(p.id)} className="text-slate-300 hover:text-rose-600 shrink-0">×</button>
    </div>
  )

  const Group = ({ title, items, tone }: { title: string; items: VaccinePlan[]; tone?: string }) =>
    items.length === 0 ? null : (
      <div className="space-y-2">
        <h2 className={`text-xs font-medium ${tone ?? 'text-slate-400'}`}>{title}（{items.length}）</h2>
        {items.map((p) => <Row key={p.id} p={p} />)}
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/health" className="text-slate-400 hover:text-slate-600 text-sm">← 返回</Link>
        <h1 className="text-xl font-semibold text-slate-900">{member?.display_name ?? ''} 的健康档案</h1>
      </div>

      <HealthTabs userId={uid} active="vaccines" />

      <div className="flex justify-end gap-2">
        {isChild && (
          <button onClick={onLoadSchedule} disabled={loadSchedule.isPending}
            className="px-4 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm hover:bg-blue-100 disabled:opacity-40">
            加载国家免疫规划时间表
          </button>
        )}
        <button onClick={() => setShowForm((s) => !s)}
          className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-700">
          {showForm ? '取消' : '+ 手动添加疫苗'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="疫苗名称，如「乙肝疫苗」"
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={dose} onChange={(e) => setDose(e.target.value)}
              placeholder="剂次" className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
            <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm" />
          </div>
          <div className="flex justify-end">
            <button onClick={submit} disabled={!name.trim() || !scheduledDate || create.isPending}
              className="px-5 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40">
              {create.isPending ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <p className="text-center py-12 text-slate-400">暂无疫苗计划</p>
      ) : (
        <div className="space-y-4">
          <Group title="逾期" items={overdue} tone="text-rose-500" />
          <Group title="待接种" items={pending} />
          <Group title="已接种" items={done} tone="text-emerald-500" />
          <Group title="跳过" items={skipped} />
        </div>
      )}
    </div>
  )
}
