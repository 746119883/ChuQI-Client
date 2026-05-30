import { useState, useEffect, useRef } from 'react'
import {
  useRoll,
  useDiningOptions,
  useCreateDiningOption,
  useDeleteDiningOption,
  useMealLogs,
  useCreateMealLog,
  useDeleteMealLog,
  type RollParams,
} from '@/hooks/useMeals'
import {
  MEAL_TYPES,
  OPTION_KINDS,
  OPTION_KIND_EMOJI,
} from '@/lib/mealMeta'
import type {
  MealType,
  OptionKind,
  RollCandidate,
} from '@/lib/types'

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

// 摇号范围 -> roll 参数
const SCOPES: { key: string; label: string; params: RollParams }[] = [
  { key: 'all', label: '随便', params: { source: 'all' } },
  { key: 'recipe', label: '在家做', params: { source: 'recipe' } },
  { key: 'takeout', label: '点外卖', params: { source: 'option', kind: 'takeout' } },
  { key: 'dineout', label: '出去吃', params: { source: 'option', kind: 'dineout' } },
]

const FOODS = ['🍜', '🍚', '🍲', '🍱', '🥟', '🍗', '🍤', '🥗', '🍛', '🍣', '🌮', '🍕', '🥘', '🍔', '🍝']
const ANIM_MS = 1300
const ROLL_INTERVAL_MS = 220

export default function Meals() {
  const [scope, setScope] = useState('all')
  const roll = useRoll()

  // 动画控制：isRolling 期间不展示结果
  const [isRolling, setIsRolling] = useState(false)
  const [foodIdx, setFoodIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 老虎机式食物滚动
  useEffect(() => {
    if (isRolling) {
      intervalRef.current = setInterval(
        () => setFoodIdx((i) => (i + 1) % FOODS.length),
        ROLL_INTERVAL_MS,
      )
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRolling])

  const showResult = !isRolling && !roll.isPending && !!roll.data

  const createLog = useCreateMealLog()
  const [savedMsg, setSavedMsg] = useState('')

  function doRoll(key: string) {
    setScope(key)
    setSavedMsg('')
    setIsRolling(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setIsRolling(false), ANIM_MS)
    const s = SCOPES.find((x) => x.key === key) ?? SCOPES[0]
    roll.mutate({ ...s.params, exclude_days: 3, count: 4 })
  }

  function recordPick(c: RollCandidate, mealType: MealType) {
    createLog.mutate(
      {
        date: todayStr(),
        meal_type: mealType,
        recipe: c.type === 'recipe' ? c.id : null,
        option: c.type === 'option' ? c.id : null,
      },
      { onSuccess: () => setSavedMsg(`已记录今天的${c.name}`) },
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-900">今天吃什么</h1>

      {/* 摇一摇 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap text-sm">
          {SCOPES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => doRoll(s.key)}
              className={`px-3 py-1 rounded-full border ${
                scope === s.key
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => doRoll(scope)}
          disabled={isRolling || roll.isPending}
          className="w-full py-4 text-lg font-medium bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-60 transition-colors"
        >
          {isRolling || roll.isPending ? '摇号中…' : '🎲 摇一摇'}
        </button>

        {(isRolling || roll.isPending) ? (
          <div className="relative overflow-hidden p-5 bg-gradient-to-b from-amber-50 to-white border border-amber-200 rounded-xl shadow-sm flex flex-col items-center justify-center h-28 gap-2">
            <span
              key={foodIdx}
              className="text-6xl leading-none animate-in slide-in-from-bottom-4 fade-in duration-200"
              style={{ display: 'inline-block' }}
            >
              {FOODS[foodIdx]}
            </span>
            <span className="text-xs text-amber-600 tracking-widest">挑选中…</span>
          </div>
        ) : showResult ? (
          <ResultCard result={roll.data!} onRecord={recordPick} saving={createLog.isPending} />
        ) : null}
        {savedMsg && <p className="text-sm text-green-600">{savedMsg}</p>}
      </section>

      <OptionsSection />
      <RecentLogsSection />
    </div>
  )
}

function ResultCard({
  result,
  onRecord,
  saving,
}: {
  result: { main: RollCandidate | null; alternatives: RollCandidate[]; pool_size: number }
  onRecord: (c: RollCandidate, mealType: MealType) => void
  saving: boolean
}) {
  const [mealType, setMealType] = useState<MealType>('dinner')

  if (!result.main) {
    return (
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-sm">
        没有可摇的内容。去下面加几个就餐选项，或在菜谱里多记几道菜吧。
        <br />
        （已自动排除最近 3 天吃过的）
      </div>
    )
  }

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        {result.main.cover_url ? (
          <img
            src={result.main.cover_url}
            alt=""
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-lg bg-amber-50 flex items-center justify-center text-3xl flex-shrink-0">
            {result.main.kind ? OPTION_KIND_EMOJI[result.main.kind] : '🍽️'}
          </div>
        )}
        <div>
          <div className="text-xs text-slate-400">就决定是你了</div>
          <div className="text-2xl font-semibold text-slate-900">{result.main.name}</div>
          {result.main.kind_display && (
            <div className="text-sm text-slate-500">{result.main.kind_display}</div>
          )}
        </div>
      </div>

      {result.alternatives.length > 0 && (
        <div className="text-sm text-slate-500">
          备选：{result.alternatives.map((a) => a.name).join('、')}
        </div>
      )}

      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className="px-2 py-1.5 text-sm border border-slate-200 rounded-md"
        >
          {MEAL_TYPES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onRecord(result.main!, mealType)}
          disabled={saving}
          className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-60"
        >
          就吃这个，记一笔
        </button>
      </div>
    </div>
  )
}

function OptionsSection() {
  const { data } = useDiningOptions()
  const options = data?.results ?? []
  const createOpt = useCreateDiningOption()
  const delOpt = useDeleteDiningOption()

  const [name, setName] = useState('')
  const [kind, setKind] = useState<OptionKind>('home')
  const [weight, setWeight] = useState(1)

  function add() {
    const n = name.trim()
    if (!n) return
    createOpt.mutate(
      { name: n, kind, weight },
      {
        onSuccess: () => {
          setName('')
          setWeight(1)
        },
      },
    )
  }

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-slate-900">就餐选项</h2>
      <p className="text-xs text-slate-400">
        在家做的家常菜、爱点的外卖、常去的馆子，按类别加进来一起摇。
        「在家做」也会和菜谱一起进摇号池。权重越高摇中概率越大。
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="如：楼下沙县"
          className="flex-1 min-w-[140px] px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as OptionKind)}
          className="px-2 py-2 text-sm border border-slate-200 rounded-md"
        >
          {OPTION_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <select
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="px-2 py-2 text-sm border border-slate-200 rounded-md"
          title="权重"
        >
          {[1, 2, 3, 5, 8, 10].map((w) => (
            <option key={w} value={w}>
              权重 {w}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          disabled={createOpt.isPending}
          className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-60"
        >
          添加
        </button>
      </div>

      {options.length > 0 && (
        <ul className="divide-y divide-slate-100 border border-slate-200 rounded-md">
          {options.map((o) => (
            <li key={o.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span>{OPTION_KIND_EMOJI[o.kind]}</span>
              <span className="text-slate-800">{o.name}</span>
              <span className="text-slate-400 text-xs">
                {o.kind_display} · 权重 {o.weight}
              </span>
              <button
                type="button"
                onClick={() => delOpt.mutate(o.id)}
                className="ml-auto text-slate-300 hover:text-red-500"
                title="删除"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function RecentLogsSection() {
  const { data } = useMealLogs()
  const logs = data?.results ?? []
  const delLog = useDeleteMealLog()

  if (logs.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-slate-900">最近吃了啥</h2>
      <ul className="divide-y divide-slate-100 border border-slate-200 rounded-md">
        {logs.slice(0, 15).map((log) => (
          <li key={log.id} className="flex items-center gap-3 px-3 py-2 text-sm">
            <span className="text-slate-400 text-xs w-20 flex-shrink-0">{log.date}</span>
            <span className="text-slate-400 text-xs w-8 flex-shrink-0">
              {log.meal_type_display}
            </span>
            <span className="text-slate-800">{log.display_name}</span>
            <span className="text-slate-400 text-xs ml-auto">{log.recorder.display_name}</span>
            <button
              type="button"
              onClick={() => delLog.mutate(log.id)}
              className="text-slate-300 hover:text-red-500"
              title="删除"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
