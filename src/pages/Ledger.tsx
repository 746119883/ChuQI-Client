import { useMemo, useState } from 'react'
import {
  useDeleteEntry,
  useLedgerEntries,
  useLedgerSummary,
  useLedgerYears,
} from '@/hooks/useLedger'
import { useMe } from '@/hooks/useAuth'
import { CATEGORY_COLOR, yuan } from '@/lib/ledgerMeta'
import LedgerEntryForm from '@/components/LedgerEntryForm'
import type { LedgerEntry } from '@/lib/types'

const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

export default function Ledger() {
  const thisYear = new Date().getFullYear()
  const [year, setYear] = useState(thisYear)
  const [editing, setEditing] = useState<LedgerEntry | null>(null)
  const [creating, setCreating] = useState(false)

  const { data: years } = useLedgerYears()
  const { data: summary } = useLedgerSummary(year)
  const { data: entries } = useLedgerEntries({ year })
  const { data: me } = useMe()
  const del = useDeleteEntry()

  const yearOptions = useMemo(() => {
    const set = new Set<number>([thisYear, ...(years ?? [])])
    return Array.from(set).sort((a, b) => b - a)
  }, [years, thisYear])

  const maxMonthly = useMemo(() => {
    if (!summary) return 1
    return Math.max(
      1,
      ...summary.monthly.map((m) => Math.max(parseFloat(m.expense), parseFloat(m.income))),
    )
  }, [summary])

  const list = entries?.results ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-slate-900">家庭账本</h1>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-sm border border-slate-200 rounded-md px-2 py-1"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y} 年</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => { setCreating(true); setEditing(null) }}
          className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700"
        >
          + 记一笔
        </button>
      </div>

      {creating && (
        <LedgerEntryForm onDone={() => setCreating(false)} onCancel={() => setCreating(false)} />
      )}

      {/* 汇总卡片 */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <Card label="年支出" value={summary.total_expense} color="text-rose-600" />
          <Card label="年收入" value={summary.total_income} color="text-emerald-600" />
          <Card
            label="结余"
            value={String(parseFloat(summary.total_income) - parseFloat(summary.total_expense))}
            color="text-slate-900"
          />
        </div>
      )}

      {/* 月度柱状图 */}
      {summary && (
        <div className="bg-white rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-4">月度收支</h2>
          <div className="flex items-end justify-between gap-1 h-40">
            {summary.monthly.map((m) => {
              const exp = parseFloat(m.expense)
              const inc = parseFloat(m.income)
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="flex items-end gap-0.5 h-full w-full justify-center">
                    <div
                      className="w-1/2 max-w-3 bg-rose-400 rounded-t"
                      style={{ height: `${(exp / maxMonthly) * 100}%` }}
                      title={`支出 ${yuan(m.expense)}`}
                    />
                    <div
                      className="w-1/2 max-w-3 bg-emerald-400 rounded-t"
                      style={{ height: `${(inc / maxMonthly) * 100}%` }}
                      title={`收入 ${yuan(m.income)}`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">{MONTHS[m.month - 1]}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><i className="w-3 h-3 bg-rose-400 rounded-sm inline-block" /> 支出</span>
            <span className="flex items-center gap-1"><i className="w-3 h-3 bg-emerald-400 rounded-sm inline-block" /> 收入</span>
          </div>
        </div>
      )}

      {/* 分类占比 */}
      {summary && summary.by_category.length > 0 && (
        <div className="bg-white rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-4">支出分类</h2>
          <div className="space-y-2.5">
            {summary.by_category.map((c) => {
              const total = parseFloat(summary.total_expense) || 1
              const pct = (parseFloat(c.total) / total) * 100
              return (
                <div key={c.category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-700">{c.category_display}</span>
                    <span className="text-slate-500">
                      ¥{yuan(c.total)} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLOR[c.category] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 流水 */}
      <div className="space-y-2">
        <h2 className="font-semibold text-slate-900">流水</h2>
        {list.length === 0 && (
          <p className="text-center text-slate-500 py-8">这一年还没有记录。</p>
        )}
        {list.map((e) =>
          editing?.id === e.id ? (
            <LedgerEntryForm
              key={e.id}
              entry={e}
              onDone={() => setEditing(null)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <article key={e.id} className="bg-white rounded-xl p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs shrink-0"
                style={{ backgroundColor: CATEGORY_COLOR[e.category] }}
              >
                {e.category_display.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 truncate">{e.title}</div>
                <div className="text-xs text-slate-400">
                  {e.date} · {e.category_display}
                  {e.visibility === 'private' && ' · 私密'}
                  {' · '}{e.recorder.display_name || e.recorder.username}
                </div>
              </div>
              <div
                className={`font-semibold shrink-0 ${
                  e.entry_type === 'expense' ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {e.entry_type === 'expense' ? '-' : '+'}¥{yuan(e.amount)}
              </div>
              {me?.id === e.recorder.id && (
                <div className="flex flex-col gap-1 text-xs shrink-0">
                  <button onClick={() => { setEditing(e); setCreating(false) }} className="text-slate-400 hover:text-slate-900">
                    改
                  </button>
                  <button
                    onClick={() => { if (confirm(`删除「${e.title}」?`)) del.mutate(e.id) }}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    删
                  </button>
                </div>
              )}
            </article>
          ),
        )}
      </div>
    </div>
  )
}

function Card({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`text-lg font-semibold mt-1 ${color}`}>¥{yuan(value)}</div>
    </div>
  )
}
