import { useState, useEffect, type FormEvent } from 'react'
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import type { Task } from '@/lib/types'

interface Props {
  task: Task
}

export default function TaskRow({ task }: Props) {
  const update = useUpdateTask(task.list)
  const del = useDeleteTask(task.list)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)

  useEffect(() => {
    setDraft(task.title)
  }, [task.title])

  const toggle = () => {
    update.mutate({ id: task.id, patch: { completed: !task.completed } })
  }

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault()
    const v = draft.trim()
    if (v && v !== task.title) {
      await update.mutateAsync({ id: task.id, patch: { title: v } })
    } else {
      setDraft(task.title)
    }
    setEditing(false)
  }

  const onDelete = () => {
    if (confirm(`删除"${task.title}"?`)) del.mutate(task.id)
  }

  return (
    <div className="flex items-center gap-3 py-2 px-3 -mx-3 rounded hover:bg-slate-50 group">
      <button
        type="button"
        onClick={toggle}
        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-slate-300 hover:border-slate-500'
        }`}
        aria-label={task.completed ? '取消完成' : '标记完成'}
      >
        {task.completed && (
          <svg viewBox="0 0 16 16" className="w-3 h-3 text-white">
            <path
              d="M3 8 L7 12 L13 4"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {editing ? (
        <form onSubmit={saveEdit} className="flex-1">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={saveEdit}
            autoFocus
            className="w-full bg-transparent border-b border-slate-300 focus:outline-none focus:border-slate-900"
          />
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`flex-1 text-left ${
            task.completed
              ? 'text-slate-400 line-through'
              : 'text-slate-800'
          }`}
        >
          {task.title}
        </button>
      )}

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.completed && task.completed_by && (
          <span className="text-xs text-slate-400">
            {task.completed_by.username}
          </span>
        )}
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-slate-400 hover:text-rose-600 px-1"
          title="删除"
        >
          删
        </button>
      </div>
    </div>
  )
}
