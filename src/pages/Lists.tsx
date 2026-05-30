import { useState, type FormEvent } from 'react'
import { useLists, useCreateList } from '@/hooks/useTasks'
import ListCard from '@/components/ListCard'
import { Loading } from '@/components/StateView'

export default function Lists() {
  const { data, isLoading } = useLists()
  const create = useCreateList()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [isShared, setIsShared] = useState(true)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await create.mutateAsync({ name: name.trim(), is_shared: isShared })
    setName('')
    setIsShared(true)
    setCreating(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">家庭清单</h1>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700"
        >
          {creating ? '取消' : '新建清单'}
        </button>
      </div>

      {creating && (
        <form onSubmit={submit} className="bg-white rounded-xl p-4 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="清单名,比如 周末购物 / 出行打包"
            autoFocus
            required
            maxLength={100}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
            />
            家人共享(取消勾选则仅自己可见)
          </label>
          <button
            type="submit"
            disabled={create.isPending}
            className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
          >
            创建
          </button>
        </form>
      )}

      {isLoading && <Loading />}

      {data && data.results.length === 0 && (
        <p className="text-center text-slate-500 py-16">
          还没有清单。点上方"新建清单"开始。
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data?.results.map((l) => (
          <ListCard key={l.id} list={l} />
        ))}
      </div>
    </div>
  )
}