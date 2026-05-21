import { Link, useNavigate, useParams } from 'react-router-dom'
import { useNote, useDeleteNote } from '@/hooks/useNotes'
import { useMe } from '@/hooks/useAuth'

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: note, isLoading, error } = useNote(id)
  const { data: me } = useMe()
  const del = useDeleteNote()

  if (isLoading) return <p className="text-slate-500">加载中...</p>
  if (error) return <p className="text-rose-600">加载失败</p>
  if (!note) return null

  const isAuthor = me?.id === note.author.id

  const onDelete = async () => {
    if (!confirm('确定删除这条笔记?')) return
    await del.mutateAsync(note.id)
    navigate('/', { replace: true })
  }

  return (
    <div className="space-y-4">
      <Link to="/" className="text-sm text-blue-600 hover:underline">
        ← 返回列表
      </Link>

      <article className="bg-white rounded-xl p-8 space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900 leading-tight">
          {note.title}
        </h1>

        <div className="text-sm text-slate-400 pb-4 border-b border-slate-100">
          {note.author.username} · 创建于{' '}
          {new Date(note.created_at).toLocaleString('zh-CN')}
          {note.updated_at !== note.created_at && (
            <span> · 更新于 {new Date(note.updated_at).toLocaleString('zh-CN')}</span>
          )}
        </div>

        <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">
          {note.content || <span className="text-slate-400">(无内容)</span>}
        </div>

        {isAuthor && (
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Link
              to={`/notes/${note.id}/edit`}
              className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700"
            >
              编辑
            </Link>
            <button
              type="button"
              onClick={onDelete}
              disabled={del.isPending}
              className="px-4 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-md disabled:opacity-50"
            >
              {del.isPending ? '删除中...' : '删除'}
            </button>
          </div>
        )}
      </article>
    </div>
  )
}
