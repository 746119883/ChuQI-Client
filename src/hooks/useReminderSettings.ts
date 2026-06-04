import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { HealthReminderSettings } from '@/lib/types'

export function useReminderSettings() {
  return useQuery({
    queryKey: ['health', 'reminder-settings'],
    queryFn: async () => {
      const { data } = await api.get<HealthReminderSettings>('/health/reminder-settings/')
      return data
    },
  })
}

export function useUpdateReminderSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<HealthReminderSettings>) => {
      const { data } = await api.put<HealthReminderSettings>('/health/reminder-settings/', body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health', 'reminder-settings'] }),
  })
}
