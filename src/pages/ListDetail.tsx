import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useList,
  useTasks,
  useCreateTask,
  useDeleteList,
} from '@/hooks/useTasks'
import { useMe } from '@/hooks/useAuth'
import TaskRow from '@/components/TaskRow'

export default function ListDetail() {
  const { id } = useParams<{ id: string }>()
  const listId = id ? Number(id) : undefined
  const navigate = useNavigate()
  const { data: me } = useMe()

  const { data: list, isLoading: listLoading, error } = useList(listId)
  const { data: tasksData, isLoading: tasksLoading } = useTasks(listId)
  const create = useCreateTask(listId ?? 0)
  const del = useDeleteList()

  const [newTitle, setNewTitle] = useState('')

  if (listLoading) return <p className="text-slate-500">加载中...</p>
  if (error || !list) return <p className="text-rose-600">清单不存在</p>

  const isOwner = me?.id === list.owner.id

  const addTask = async (e: FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    await create.mutateAsync(newTitle.trim())
    setNewTitle('')
  }

  const onDeleteList = async () => {
    if (!confirm(`删除清单"${list.name}"?里面所有任务也会一起删除。`)) return
    await del.mutateAsync(list.id)
    navigate('/lists', { replace: true })
  }

  const tasks = tasksData?.results ?? []
  const open = tasks.filter((t) => !t.completed)
  const done = tasks.filter((t) => t.completed)

  return (
    <div className="space-y-5">
      <Link to="/lists" className="text-sm text-blue-600 hover:underline">
        ← 返回清单列表
      </Link>

      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{list.name}</h1>
          <div className="text-xs text-slate-400 mt-1">
            {list.owner.username} · {list.done} / {list.total} 完成
            {!list.is_shared && (
              <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded">私密</span>
            )}
          </div>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={onDeleteList}
            className="text-sm text-slate-400 hover:text-rose-600"
          >
            删除清单
          </button>
        )}
      </header>

      <div className="bg-white rounded-xl p-5 space-y-1">
        {tasksLoading && <p className="text-slate-500 text-sm">加载中...</p>}

        {open.length === 0 && done.length === 0 && (
          <p className="text-slate-400 text-sm py-4 text-center">
            还没有任务。在下方输入框添加。
          </p>
        )}

        {open.map((t) => <TaskRow key={t.id} task={t} />)}

        {done.length > 0 && (
          <>
            <div className="text-xs text-slate-400 pt-3 pb-1 px-3 -mx-3">
              已完成 {done.length}
            </div>
            {done.map((t) => <TaskRow key={t.id} task={t} />)}
          </>
        )}

        <form onSubmit={addTask} className="pt-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="+ 添加新项目,按回车"
            maxLength={300}
            className="w-full bg-slate-50 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400"
          />
        </form>
      </div>
    </div>
  )
}
