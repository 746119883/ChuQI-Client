import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from '@/hooks/useNotifications'
import type { Notification } from '@/lib/types'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} 小时前`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} 天前`
  return new Date(iso).toLocaleDateString('zh-CN')
}

function line(n: Notification) {
  // 系统提醒（birthday / event / expiry）直接显示 text
  if (n.verb === 'birthday' || n.verb === 'event' || n.verb === 'expiry') {
    return n.text
  }
  // 互动通知
  const who = n.actor?.display_name || n.actor?.username || '有人'
  if (n.verb === 'reaction') return `${who} ${n.emoji} 回应了你的动态`
  if (n.verb === 'mention') return `${who} 在评论里提到了你`
  return `${who} 评论了你的动态`
}

export default function NotificationBell() {
  const { data: count } = useUnreadCount()
  const { data: list } = useNotifications()
  const markAll = useMarkAllRead()
  const markOne = useMarkRead()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const unread = count ?? 0

  const onItem = (n: Notification) => {
    if (!n.is_read) markOne.mutate(n.id)
    setOpen(false)
    navigate('/')
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600"
        title="通知"
      >
        <span className="text-lg leading-none">🔔</span>
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] leading-4 text-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 w-80 max-w-[90vw] bg-white border border-slate-200 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-900">通知</span>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAll.mutate()}
                  className="text-xs text-blue-600 hover:underline"
                >
                  全部已读
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {(!list || list.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-8">还没有通知</p>
              )}
              {list?.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => onItem(n)}
                  className={`block w-full text-left px-3 py-2.5 border-b border-slate-50 hover:bg-slate-50 ${
                    n.is_read ? '' : 'bg-amber-50/60'
                  }`}
                >
                  <div className="text-sm text-slate-800">{line(n)}</div>
                  {n.moment_preview && (
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      「{n.moment_preview}」
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mt-0.5">{timeAgo(n.created_at)}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
