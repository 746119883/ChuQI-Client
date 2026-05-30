import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStories, useDeleteStory } from '@/hooks/useStories'
import { useMe } from '@/hooks/useAuth'
import type { StoryListItem } from '@/lib/types'

export default function Stories() {
  const { data: me } = useMe()
  const [q, setQ] = useState('')
  const { data, isLoading } = useStories({ q })
  const stories = data?.results ?? []
  const delStory = useDeleteStory()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">家庭故事</h1>
        <Link
          to="/stories/new"
          className="px-4 py-1.5 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700"
        >
          + 写故事
        </Link>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜标题或简介…"
        className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
      />

      {isLoading && <p className="text-sm text-slate-400 text-center py-10">加载中…</p>}

      {!isLoading && stories.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <div className="text-4xl mb-3">📖</div>
          <p className="text-sm">还没有故事，把家庭的美好瞬间记录下来吧</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {stories.map((s) => (
          <StoryCard
            key={s.id}
            story={s}
            canDelete={me?.id === s.author.id}
            onDelete={() => {
              if (confirm(`删除「${s.title}」？`)) delStory.mutate(s.id)
            }}
          />
        ))}
      </div>
    </div>
  )
}

function StoryCard({
  story,
  canDelete,
  onDelete,
}: {
  story: StoryListItem
  canDelete: boolean
  onDelete: () => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/stories/${story.id}`}>
        {story.cover_url ? (
          <img src={story.cover_url} alt="" className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center text-5xl">
            📖
          </div>
        )}
      </Link>
      <div className="p-4 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/stories/${story.id}`} className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-900 truncate">{story.title}</h2>
          </Link>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="text-slate-300 hover:text-red-500 text-xs shrink-0"
            >
              删除
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400">{story.date} · {story.author.display_name}</p>
        {story.summary && (
          <p className="text-sm text-slate-600 line-clamp-2">{story.summary}</p>
        )}
        <p className="text-xs text-slate-400">{story.block_count} 个内容块</p>
      </div>
    </div>
  )
}
