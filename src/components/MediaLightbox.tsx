import { useEffect } from 'react'
import type { MediaItem } from '@/lib/types'

interface Props {
  items: MediaItem[]
  index: number
  onClose: () => void
  onChange: (newIndex: number) => void
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function MediaLightbox({ items, index, onClose, onChange }: Props) {
  const item = items[index]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && index > 0) onChange(index - 1)
      if (e.key === 'ArrowRight' && index < items.length - 1) onChange(index + 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [index, items.length, onClose, onChange])

  if (!item) return null

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute top-4 right-5 text-white/80 hover:text-white text-3xl z-10"
      >
        ×
      </button>

      {index > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onChange(index - 1)
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white text-xl z-10"
        >
          ‹
        </button>
      )}

      {index < items.length - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onChange(index + 1)
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white text-xl z-10"
        >
          ›
        </button>
      )}

      <div
        className="max-w-full max-h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'photo' ? (
          <img
            src={item.image}
            alt={item.caption}
            className="max-w-[95vw] max-h-[90vh] object-contain"
          />
        ) : (
          <video
            src={item.file}
            poster={item.poster}
            controls
            autoPlay
            className="max-w-[95vw] max-h-[90vh]"
          />
        )}
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm space-y-1 pointer-events-none">
        <div>{item.uploader.username}</div>
        <div>
          {item.taken_at
            ? `拍摄 ${new Date(item.taken_at).toLocaleString('zh-CN')}`
            : `上传 ${new Date(item.uploaded_at).toLocaleString('zh-CN')}`}
          {' · '}
          {item.width}×{item.height}
          {item.type === 'video' && (
            <> · 时长 {formatDuration(item.duration)}</>
          )}
        </div>
        <div>
          {index + 1} / {items.length}
        </div>
      </div>
    </div>
  )
}
