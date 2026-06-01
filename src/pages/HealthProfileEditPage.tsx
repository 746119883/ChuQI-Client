import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useHealthProfile, useUpdateHealthProfile } from '@/hooks/useHealth'
import type {
  Allergy,
  AllergyType,
  BloodType,
  ChronicCondition,
  Medication,
} from '@/lib/types'

const BLOOD_TYPES: { value: BloodType; label: string }[] = [
  { value: '', label: '未填写' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'AB', label: 'AB' },
  { value: 'O', label: 'O' },
  { value: 'unknown', label: '不确定' },
]

const ALLERGY_TYPES: { value: AllergyType; label: string }[] = [
  { value: '', label: '未分类' },
  { value: 'drug', label: '药物' },
  { value: 'food', label: '食物' },
  { value: 'environment', label: '环境' },
]

export default function HealthProfileEditPage() {
  const { userId } = useParams<{ userId: string }>()
  const uid = Number(userId)
  const navigate = useNavigate()

  const { data: existing } = useHealthProfile(uid)
  const update = useUpdateHealthProfile(uid)

  const [bloodType, setBloodType] = useState<BloodType>('')
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [conditions, setConditions] = useState<ChronicCondition[]>([])
  const [medications, setMedications] = useState<Medication[]>([])

  useEffect(() => {
    if (existing) {
      setBloodType(existing.blood_type)
      setAllergies(existing.allergies ?? [])
      setConditions(existing.chronic_conditions ?? [])
      setMedications(existing.medications ?? [])
    }
  }, [existing])

  // 过敏
  const setAllergy = (i: number, patch: Partial<Allergy>) =>
    setAllergies((p) => p.map((a, idx) => (idx === i ? { ...a, ...patch } : a)))
  const addAllergy = () =>
    setAllergies((p) => [...p, { name: '', type: '', note: '' }])
  const removeAllergy = (i: number) =>
    setAllergies((p) => p.filter((_, idx) => idx !== i))

  // 慢性病
  const setCondition = (i: number, patch: Partial<ChronicCondition>) =>
    setConditions((p) => p.map((c, idx) => (idx === i ? { ...c, ...patch } : c)))
  const addCondition = () =>
    setConditions((p) => [...p, { name: '', diagnosed_date: '', note: '' }])
  const removeCondition = (i: number) =>
    setConditions((p) => p.filter((_, idx) => idx !== i))

  // 长期用药
  const setMedication = (i: number, patch: Partial<Medication>) =>
    setMedications((p) => p.map((m, idx) => (idx === i ? { ...m, ...patch } : m)))
  const addMedication = () =>
    setMedications((p) => [...p, { name: '', dosage: '', note: '' }])
  const removeMedication = (i: number) =>
    setMedications((p) => p.filter((_, idx) => idx !== i))

  const submit = async () => {
    await update.mutateAsync({
      blood_type: bloodType,
      allergies: allergies
        .map((a) => ({ ...a, name: a.name.trim() }))
        .filter((a) => a.name),
      chronic_conditions: conditions
        .map((c) => ({ ...c, name: c.name.trim() }))
        .filter((c) => c.name),
      medications: medications
        .map((m) => ({ ...m, name: m.name.trim() }))
        .filter((m) => m.name),
    })
    navigate(`/health/${uid}`, { replace: true })
  }

  const pending = update.isPending

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold text-slate-900">编辑健康档案</h1>

      {/* 血型 */}
      <div className="bg-white rounded-xl p-5 space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">血型</label>
          <select
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value as BloodType)}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {BLOOD_TYPES.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 过敏史 */}
      <div className="bg-white rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">过敏史</h2>
          <button type="button" onClick={addAllergy} className="text-sm text-blue-600 hover:underline">
            + 添加过敏记录
          </button>
        </div>
        {allergies.length === 0 && (
          <p className="text-sm text-slate-400">暂无，点击右上角添加</p>
        )}
        <div className="space-y-2">
          {allergies.map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={a.name}
                onChange={(e) => setAllergy(i, { name: e.target.value })}
                placeholder="过敏原"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
              <select
                value={a.type}
                onChange={(e) => setAllergy(i, { type: e.target.value as AllergyType })}
                className="w-24 px-2 py-2 border border-slate-200 rounded-md text-sm shrink-0"
              >
                {ALLERGY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input
                value={a.note}
                onChange={(e) => setAllergy(i, { note: e.target.value })}
                placeholder="备注"
                className="w-28 px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
              <button
                type="button"
                onClick={() => removeAllergy(i)}
                className="text-slate-300 hover:text-rose-600 w-6 shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 慢性病 */}
      <div className="bg-white rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">慢性病</h2>
          <button type="button" onClick={addCondition} className="text-sm text-blue-600 hover:underline">
            + 添加慢性病
          </button>
        </div>
        {conditions.length === 0 && (
          <p className="text-sm text-slate-400">暂无，点击右上角添加</p>
        )}
        <div className="space-y-2">
          {conditions.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={c.name}
                onChange={(e) => setCondition(i, { name: e.target.value })}
                placeholder="病名"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
              <input
                type="date"
                value={c.diagnosed_date}
                onChange={(e) => setCondition(i, { diagnosed_date: e.target.value })}
                className="w-36 px-2 py-2 border border-slate-200 rounded-md text-sm shrink-0"
              />
              <input
                value={c.note}
                onChange={(e) => setCondition(i, { note: e.target.value })}
                placeholder="备注"
                className="w-28 px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
              <button
                type="button"
                onClick={() => removeCondition(i)}
                className="text-slate-300 hover:text-rose-600 w-6 shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 长期用药 */}
      <div className="bg-white rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">长期用药</h2>
          <button type="button" onClick={addMedication} className="text-sm text-blue-600 hover:underline">
            + 添加长期用药
          </button>
        </div>
        {medications.length === 0 && (
          <p className="text-sm text-slate-400">暂无，点击右上角添加</p>
        )}
        <div className="space-y-2">
          {medications.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={m.name}
                onChange={(e) => setMedication(i, { name: e.target.value })}
                placeholder="药物名称"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
              <input
                value={m.dosage}
                onChange={(e) => setMedication(i, { dosage: e.target.value })}
                placeholder="剂量"
                className="w-28 px-3 py-2 border border-slate-200 rounded-md text-sm shrink-0"
              />
              <input
                value={m.note}
                onChange={(e) => setMedication(i, { note: e.target.value })}
                placeholder="备注"
                className="w-28 px-3 py-2 border border-slate-200 rounded-md text-sm"
              />
              <button
                type="button"
                onClick={() => removeMedication(i)}
                className="text-slate-300 hover:text-rose-600 w-6 shrink-0"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
        >
          取消
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="px-5 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40"
        >
          {pending ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  )
}
