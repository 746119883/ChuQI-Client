import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useHealthProfiles } from '@/hooks/useHealth'
import {
  useCheckups,
  useCreateCheckup,
  useUpdateCheckup,
  useDeleteCheckup,
  useLoadChildCheckupSchedule,
} from '@/hooks/useCheckups'
import HealthTabs from '@/components/HealthTabs'
import { ageInYears } from '@/lib/age'
import type { CheckupFrequency, CheckupStatus } from '@/lib/types'

const FREQ_LABEL: Record<CheckupFrequency, string> = {
  once: '一次性', yearly: '每年', every_n_months: '每N个月',
}
const STATUS_LABEL: Record<CheckupStatus, string> = {
  pending: '待完成', done: '已完成', skipped: '跳过',
}
const STATUS_CLASS: Record<CheckupStatus, string> = {
  pending: 'bg-amber-50 text-amber-600',
  done: 'bg-emerald-50 text-emerald-600',
  skipped: 'bg-slate-100 text-slate-400',
}

export default function CheckupsPage() {
  const { userId } = useParams<{ userId: string }>()
  const uid = Number(userId)
  const { data: members = [] } = useHealthProfiles()
  const member = members.find((m) => m.id === uid)
  const { data: plans = [] } = useCheckups(uid)
  const create = useCreateCheckup(uid)
  const update = useUpdateCheckup(uid)
  const del = useDeleteCheckup(uid)
  const loadSchedule = useLoadChildCheckupSchedule(uid)

  const age = ageInYears(member?.birthday)
  const isChild = age !== null && age < 7

  const onLoadSchedule = async () => {
    if (plans.length > 0 && !window.confirm('已有计划，确认后将追加缺失的国标体检条目？')) return
    const r = await loadSchedule.mutateAsync()
    window.alert(`已添加 ${r.created} 条，跳过 ${r.skipped} 条已存在`)
  }

  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [frequency, setFrequency] = useState<CheckupFrequency>('once')
  const [intervalMonths, setIntervalMonths] = useState('')

  const resetForm = () => {
    setName(''); setScheduledDate(''); setFrequency('once'); setIntervalMonths('')
    setShowForm(false)
  }

  const submit = async () => {
    if (!name.trim() || !scheduledDate) return
    await create.mutateAsync({
      user: uid,
      name: name.trim(),
      scheduled_date: scheduledDate,
      frequency,
      interval_months: frequency === 'every_n_months' ? Number(intervalMonths) || null : null,
    })
    resetForm()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/health" className="text-slate-400 hover:text-slate-600 text-sm">← 返回</Link>
        <h1 className="text-xl font-semibold text-slate-900">{member?.display_name ?? ''} 的健康档案</h1>
      </div>

      <HealthTabs userId={uid} active="checkups" />

      <div className="flex justify-between items-center">
        <Link to={`/health/${uid}/metrics`} className="text-sm text-blue-600 hover:underline">
          指标历史 →
        </Link>
      </div>

      <div className="flex justify-end gap-2">
        {isChild && (
          <button
            onClick={onLoadSchedule}
            disabled={loadSchedule.isPending}
            className="px-4 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-sm hover:bg-blue-100 disabled:opacity-40"
          >
            加载国家标准时间表
          </button>
        )}
        <button
          onClick={() => setShowForm((s) => !s)}
          className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-700"
        >
          {showForm ? '取消' : '+ 新建计划'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="计划名称，如「年度体检」"
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm"
            />
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as CheckupFrequency)}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm"
            >
              <option value="once">一次性</option>
              <option value="yearly">每年</option>
              <option value="every_n_months">每N个月</option>
            </select>
          </div>
          {frequency === 'every_n_months' && (
            <input
              type="number"
              value={intervalMonths}
              onChange={(e) => setIntervalMonths(e.target.value)}
              placeholder="间隔月数，如 6"
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm"
            />
          )}
          <div className="flex justify-end">
            <button
              onClick={submit}
              disabled={!name.trim() || !scheduledDate || create.isPending}
              className="px-5 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40"
            >
              {create.isPending ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <p className="text-center py-12 text-slate-400">暂无体检计划</p>
      ) : (
        <div className="space-y-2">
          {plans.map((p) => (
            <div key={p.id} className="bg-white rounded-xl p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 truncate">{p.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_CLASS[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">
                  {p.scheduled_date} · {FREQ_LABEL[p.frequency]}
                  {p.frequency === 'every_n_months' && p.interval_months ? `（${p.interval_months}月）` : ''}
                </p>
                {p.result_summary && (
                  <p className="text-xs text-slate-500 mt-1">
                    结果：{p.result_summary.visit_date} {p.result_summary.hospital}
                    {p.result_summary.abnormal_count > 0 && (
                      <span className="text-rose-600"> · 异常 {p.result_summary.abnormal_count} 项</span>
                    )}
                  </p>
                )}
              </div>
              <Link
                to={`/health/${uid}/checkups/${p.id}/result`}
                className="text-sm text-blue-600 hover:underline shrink-0"
              >
                {p.result_summary ? '查看结果' : '录入结果'}
              </Link>
              {p.status === 'pending' && (
                <button
                  onClick={() => update.mutate({ id: p.id, status: 'skipped' })}
                  className="text-sm text-slate-400 hover:underline shrink-0"
                >
                  跳过
                </button>
              )}
              <button
                onClick={() => del.mutate(p.id)}
                className="text-slate-300 hover:text-rose-600 shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
