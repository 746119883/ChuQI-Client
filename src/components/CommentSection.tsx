import { useMemo, useRef, useState, type FormEvent } from 'react'
import { useComments, useAddComment, useDeleteComment } from '@/hooks/useMoments'
import { useMe, useMembers } from '@/hooks/useAuth'

interface Props {
  momentId: number
}

export default function CommentSection({ momentId }: Props) {
  const { data: comments } = useComments(momentId)
  const { data: me } = useMe()
  const { data: members } = useMembers()
  const add = useAddComment(momentId)
  const del = useDeleteComment(momentId)
  const [text, setText] = useState('')
  // 已选中的被 @ 的人
  const [mentioned, setMentioned] = useState<{ id: number; name: string }[]>([])
  const [menuOpen, setMenuOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 当前正在输入的 @ 关键词（锚定在文本末尾）
  const query = useMemo(() => {
    const m = text.match(/@([^\s@]*)$/)
    return m ? m[1] : null
  }, [text])

  const candidates = useMemo(() => {
    if (query === null) return []
    const q = query.toLowerCase()
    return (members ?? [])
      .filter((u) => u.is_active)
      .filter((u) => u.display_name.toLowerCase().includes(q))
      .slice(0, 6)
  }, [members, query])

  const onChange = (v: string) => {
    setText(v)
    setMenuOpen(/@([^\s@]*)$/.test(v))
  }

  const choose = (u: { id: number; display_name: string }) => {
    const next = text.replace(/@([^\s@]*)$/, `@${u.display_name} `)
    setText(next)
    setMenuOpen(false)
    setMentioned((prev) =>
      prev.some((p) => p.id === u.id)
        ? prev
        : [...prev, { id: u.id, name: u.display_name }],
    )
    inputRef.current?.focus()
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    // 只保留文本里仍然出现 @名字 的提及
    const ids = Array.from(
      new Set(
        mentioned
          .filter((m) => content.includes(`@${m.name}`))
          .map((m) => m.id),
      ),
    )
    await add.mutateAsync({ content, mentionedUserIds: ids })
    setText('')
    setMentioned([])
    setMenuOpen(false)
  }

  return (
    <div className="space-y-2 pt-3 border-t border-slate-100">
      {comments?.map((c) => (
        <div
          key={c.id}
          className="text-sm bg-slate-50 rounded-md px-3 py-2 flex items-start gap-2"
        >
          <span className="font-medium text-slate-700">
            {c.author.display_name || c.author.username}:
          </span>
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

      <form onSubmit={submit} className="relative flex gap-2 pt-1">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => onChange(e.target.value)}
            placeholder="写评论... 输入 @ 提到家人"
            maxLength={500}
            className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-transparent focus:bg-white focus:border-slate-300 rounded-md focus:outline-none"
          />
          {menuOpen && candidates.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 w-48 bg-white border border-slate-200 rounded-md shadow-md py-1 z-20">
              {candidates.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(u)
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[10px] text-slate-500 shrink-0">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      u.display_name.slice(0, 1)
                    )}
                  </span>
                  <span className="truncate">{u.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!text.trim() || add.isPending}
          className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700 disabled:opacity-40 shrink-0"
        >
          发送
        </button>
      </form>
    </div>
  )
}
