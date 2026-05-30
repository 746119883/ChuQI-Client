import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Notification, PaginatedResponse } from '@/lib/types'

// 10 分钟
const REMINDER_INTERVAL_MS = 10 * 60 * 1000

async function checkReminders() {
  await api.post('/notifications/check-reminders/')
}

/** 登录后调一次、并每 10 分钟自动调一次。在 Layout 里挂载即可。 */
export function useReminderChecker(enabled: boolean) {
  const qc = useQueryClient()
  useEffect(() => {
    if (!enabled) return
    // 立即跑一次
    checkReminders().then(() => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    })
    // 之后每 10 分钟
    const id = setInterval(() => {
      checkReminders().then(() => {
        qc.invalidateQueries({ queryKey: ['notifications'] })
      })
    }, REMINDER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [enabled, qc])
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get<
        PaginatedResponse<Notification> | Notification[]
      >('/notifications/')
      return Array.isArray(data) ? data : data.results
    },
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get<{ count: number }>(
        '/notifications/unread-count/',
      )
      return data.count
    },
    // 每分钟轮询一次，家人有互动时能及时看到小红点
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ updated: number }>(
        '/notifications/mark-all-read/',
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/notifications/${id}/read/`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
