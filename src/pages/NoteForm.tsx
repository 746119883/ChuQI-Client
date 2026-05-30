import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useNote, useCreateNote, useUpdateNote } from '@/hooks/useNotes'
import { Loading } from '@/components/StateView'

export default function NoteForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const { data: existing, isLoading } = useNote(isEdit ? id : undefined)
  const create = useCreateNote()
  const update = useUpdateNote(id ?? 0)

  useEffect(() => {
    if (existing) {
      setTitle(existing.title)
      setContent(existing.content)
    }
  }, [existing])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isEdit) {
      await update.mutateAsync({ title, content })
      navigate(`/notes/${id}`, { replace: true })
    } else {
      const created = await create.mutateAsync({ title, content })
      navigate(`/notes/${created.id}`, { replace: true })
    }
  }

  if (isEdit && isLoading) {
    return <Loading />
  }

  const submitting = create.isPending || update.isPending

  return (
    <div className="space-y-4">
      <Link
        to={isEdit ? `/notes/${id}` : '/'}
        className="text-sm text-blue-600 hover:underline"
      >
        ← 取消
      </Link>

      <form onSubmit={onSubmit} className="bg-white rounded-xl p-8 space-y-5">
        <h1 className="text-2xl font-semibold text-slate-900">
          {isEdit ? '编辑笔记' : '写笔记'}
        </h1>

        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={200}
            autoFocus
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-700 block">内容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 resize-y"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
          >
            {submitting ? '保存中...' : '保存'}
          </button>
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/notes/${id}` : '/')}
            className="px-5 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}