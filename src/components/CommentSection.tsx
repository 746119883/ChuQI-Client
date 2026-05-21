import { useState, type FormEvent } from 'react'
import { useComments, useAddComment, useDeleteComment } from '@/hooks/useMoments'
import { useMe } from '@/hooks/useAuth'

interface Props {
  momentId: number
}

export default function CommentSection({ momentId }: Props) {
  const { data: comments } = useComments(momentId)
  const { data: me } = useMe()
  const add = useAddComment(momentId)
  const del = useDeleteComment(momentId)
  const [text, setText] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    await add.mutateAsync(text.trim())
    setText('')
  }

  return (
    <div className="space-y-2 pt-3 border-t border-slate-100">
      {comments?.map((c) => (
        <div
          key={c.id}
          className="text-sm bg-slate-50 rounded-md px-3 py-2 flex items-start gap-2"
        >
          <span className="font-medium text-slate-700">{c.author.username}:</span>
          <span className="text-slate-800 flex-1 whitespace-pre-wrap">
            {c.content}
          </span>
          {me?.id === c.author.id && (
            <button
              type="button"
              onClick={() => del.mutate(c.id)}
              className="text-xs text-slate-400 hover:text-rose-600"
              title="删除"
            >
              删
            </button>
          )}
        </div>
      ))}

      <form onSubmit={submit} className="flex gap-2 pt-1">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="写评论..."
          maxLength={500}
          className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-transparent focus:bg-white focus:border-slate-300 rounded-md focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || add.isPending}
          className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40"
        >
          发送
        </button>
      </form>
    </div>
  )
}
