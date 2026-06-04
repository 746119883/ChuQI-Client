import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CheckupPlan, CheckupResult, MetricHistoryPoint } from '@/lib/types'

export function useCheckups(userId: number) {
  return useQuery({
    queryKey: ['health', 'checkups', userId],
    queryFn: async () => {
      const { data } = await api.get<CheckupPlan[]>('/health/checkups/', {
        params: { user_id: userId },
      })
      return data
    },
    enabled: !!userId,
  })
}

export function useCreateCheckup(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<CheckupPlan>) => {
      const { data } = await api.post<CheckupPlan>('/health/checkups/', body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health', 'checkups', userId] }),
  })
}

export function useUpdateCheckup(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<CheckupPlan> & { id: number }) => {
      const { data } = await api.patch<CheckupPlan>(`/health/checkups/${id}/`, body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health', 'checkups', userId] }),
  })
}

export function useDeleteCheckup(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/health/checkups/${id}/`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health', 'checkups', userId] }),
  })
}

export function useCheckupResult(planId: number) {
  return useQuery({
    queryKey: ['health', 'checkup-result', planId],
    queryFn: async () => {
      try {
        const { data } = await api.get<CheckupResult>(`/health/checkups/${planId}/result/`)
        return data
      } catch {
        return null
      }
    },
    enabled: !!planId,
  })
}

export function useSaveCheckupResult(userId: number, planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<CheckupResult>) => {
      const { data } = await api.put<CheckupResult>(`/health/checkups/${planId}/result/`, body)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health', 'checkup-result', planId] })
      qc.invalidateQueries({ queryKey: ['health', 'checkups', userId] })
    },
  })
}

export function useMetricsHistory(userId: number, name: string) {
  return useQuery({
    queryKey: ['health', 'metrics-history', userId, name],
    queryFn: async () => {
      const { data } = await api.get<MetricHistoryPoint[]>('/health/metrics-history/', {
        params: { user_id: userId, name },
      })
      return data
    },
    enabled: !!userId && !!name,
  })
}

export function useLoadChildCheckupSchedule(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ created: number; skipped: number }>(
        '/health/checkups/load-child-schedule/',
        { user_id: userId },
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health', 'checkups', userId] }),
  })
}
