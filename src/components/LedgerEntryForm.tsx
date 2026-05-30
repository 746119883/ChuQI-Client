import { useState } from 'react'
import { useCreateEntry, useUpdateEntry } from '@/hooks/useLedger'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/ledgerMeta'
import type { LedgerCategory, LedgerEntry, LedgerType, Visibility } from '@/lib/types'

interface Props {
  entry?: LedgerEntry
  onDone: () => void
  onCancel: () => void
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function LedgerEntryForm({ entry, onDone, onCancel }: Props) {
  const isEdit = !!entry
  const create = useCreateEntry()
  const update = useUpdateEntry(entry?.id ?? 0)

  const [type, setType] = useState<LedgerType>(entry?.entry_type ?? 'expense')
  const [amount, setAmount] = useState(entry?.amount ?? '')
  const [category, setCategory] = useState<LedgerCategory>(entry?.category ?? 'appliance')
  const [title, setTitle] = useState(entry?.title ?? '')
  const [note, setNote] = useState(entry?.note ?? '')
  const [date, setDate] = useState(entry?.date ?? today())
  const [visibility, setVisibility] = useState<Visibility>(entry?.visibility ?? 'family')

  const cats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const switchType = (t: LedgerType) => {
    setType(t)
    const list = t === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
    if (!list.find((c) => c.value === category)) setCategory(list[0].value)
  }

  const submit = async () => {
    if (!amount || !title.trim()) return
    const payload = {
      entry_type: type,
      amount: String(amount),
      category,
      title: title.trim(),
      note: note.trim(),
      date,
      visibility,
    }
    if (isEdit) await update.mutateAsync(payload)
    else await create.mutateAsync(payload)
    onDone()
  }

  const pending = create.isPending || update.isPending

  return (
    <div className="bg-white rounded-xl p-5 space-y-4">
      <div className="flex gap-2">
        {(['expense', 'income'] as LedgerType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchType(t)}
            className={`flex-1 py-2 rounded-md text-sm font-medium ${
              type === t
                ? t === 'expense'
                  ? 'bg-rose-500 text-white'
                  : 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {t === 'expense' ? '支出' : '收入'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-sm text-slate-700">金额 (元)</span>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-slate-700">日期</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-md"
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-sm text-slate-700">分类</span>
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1 rounded-full text-sm border ${
                category === c.value
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </label>

      <label className="space-y-1 block">
        <span className="text-sm text-slate-700">说明</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="海尔冰箱 / 三亚机酒..."
          className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-sm text-slate-700">备注 (可选)</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-md"
        />
      </label>

      <div className="flex items-center justify-between">
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          className="text-sm text-slate-600 bg-transparent focus:outline-none"
        >
          <option value="family">家人可见</option>
          <option value="private">仅自己</option>
        </select>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
            取消
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!amount || !title.trim() || pending}
            className="px-5 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40"
          >
            {pending ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
