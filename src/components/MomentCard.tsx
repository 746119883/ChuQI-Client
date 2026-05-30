import { useState } from 'react'
import { useDeleteMoment } from '@/hooks/useMoments'
import { useMe } from '@/hooks/useAuth'
import CommentSection from './CommentSection'
import ReactionBar from './ReactionBar'
import type { Moment } from '@/lib/types'
import { Trash2 } from 'lucide-react'

interface Props {
  moment: Moment
}

export default function MomentCard({ moment }: Props) {
  const { data: me } = useMe()
  const del = useDeleteMoment()
  const [showComments, setShowComments] = useState(false)
  const [zoom, setZoom] = useState<string | null>(null)

  const isAuthor = me?.id === moment.author.id

  const time = new Date(moment.created_at).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  const onDelete = () => {
    if (!confirm('删除这条动态?')) return
    del.mutate(moment.id)
  }

  // 根据图片数量决定网格布局
  const gridCols =
    moment.images.length === 1
      ? 'grid-cols-1 max-w-md'
      : moment.images.length <= 4
        ? 'grid-cols-2 max-w-md'
        : 'grid-cols-3 max-w-lg'

  return (
    <article className="bg-white rounded-xl p-5 space-y-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500 text-xs shrink-0">
            {moment.author.avatar_url ? (
              <img src={moment.author.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (moment.author.display_name || moment.author.username).slice(0, 1)
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-900 truncate">
              {moment.author.display_name || moment.author.username}
            </div>
            <div className="text-xs text-slate-400">
              {time}
              {moment.visibility === 'private' && (
                <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded">仅自己</span>
              )}
            </div>
          </div>
        </div>
        {isAuthor && (
          <button
            type="button"
            onClick={onDelete}
            className="text-xs text-slate-400 hover:text-rose-600"
          ><Trash2 className="w-3.5 h-3.5" /></button>
        )}
      </header>

      {moment.content && (
        <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
          {moment.content}
        </p>
      )}

      {moment.images.length > 0 && (
        <div className={`grid gap-1 ${gridCols}`}>
          {moment.images.map((img) => (
            <div
              key={img.id}
              className="aspect-square cursor-pointer overflow-hidden rounded-md bg-slate-100 relative"
              onClick={() => setZoom(img.preview_url)}
            >
              <img
                src={img.thumbnail_url}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
              {img.source === 'immich' && (
                <span className="absolute bottom-1 right-1 text-[10px] px-1 bg-black/50 text-white rounded">
                  Immich
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 text-sm text-slate-500 pt-2">
        <ReactionBar moment={moment} />
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1 hover:text-slate-900 shrink-0"
        >
          <span>💬</span>
          <span>{moment.comments_count}</span>
        </button>
      </div>

      {showComments && <CommentSection momentId={moment.id} />}

      {zoom && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setZoom(null)}
        >
          <img src={zoom} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </article>
  )
}