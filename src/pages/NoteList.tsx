import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotes } from '@/hooks/useNotes'

export default function NoteList() {
  const [q, setQ] = useState('')
  const { data, isLoading, error } = useNotes(q)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">家里的笔记</h1>
        <Link
          to="/notes/new"
          className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700"
        >
          写笔记
        </Link>
      </div>

      <input
        type="text"
        placeholder="搜索标题..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
      />

      {isLoading && <p className="text-slate-500">加载中...</p>}

      {error && (
        <p className="text-rose-600">
          加载失败:{(error as Error).message}
        </p>
      )}

      {data && data.results.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          还没有笔记。
          <Link to="/notes/new" className="text-blue-600 hover:underline">
            去写第一条
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {data?.results.map((note) => (
          <Link
            key={note.id}
            to={`/notes/${note.id}`}
            className="block bg-white rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <h2 className="font-semibold text-lg text-slate-900">{note.title}</h2>
            {note.content && (
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {note.content}
              </p>
            )}
            <div className="text-xs text-slate-400 mt-2">
              {note.author.username} ·{' '}
              {new Date(note.created_at).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </Link>
        ))}
      </div>

      {data && data.count > 0 && (
        <p className="text-center text-xs text-slate-400">
          共 {data.count} 条
        </p>
      )}
    </div>
  )
}
