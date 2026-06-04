import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { VaccineOverview, VaccinePlan, VaccinationRecord } from '@/lib/types'

export function useVaccines(userId: number) {
  return useQuery({
    queryKey: ['health', 'vaccines', userId],
    queryFn: async () => {
      const { data } = await api.get<VaccinePlan[]>('/health/vaccines/', {
        params: { user_id: userId },
      })
      return data
    },
    enabled: !!userId,
  })
}

export function useVaccineOverview(userId: number) {
  return useQuery({
    queryKey: ['health', 'vaccines', 'overview', userId],
    queryFn: async () => {
      const { data } = await api.get<VaccineOverview>('/health/vaccines/overview/', {
        params: { user_id: userId },
      })
      return data
    },
    enabled: !!userId,
  })
}

export function useCreateVaccine(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<VaccinePlan>) => {
      const { data } = await api.post<VaccinePlan>('/health/vaccines/', body)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health', 'vaccines', userId] })
      qc.invalidateQueries({ queryKey: ['health', 'vaccines', 'overview', userId] })
    },
  })
}

export function useUpdateVaccine(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: Partial<VaccinePlan> & { id: number }) => {
      const { data } = await api.patch<VaccinePlan>(`/health/vaccines/${id}/`, body)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health', 'vaccines', userId] })
      qc.invalidateQueries({ queryKey: ['health', 'vaccines', 'overview', userId] })
    },
  })
}

export function useDeleteVaccine(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/health/vaccines/${id}/`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health', 'vaccines', userId] })
      qc.invalidateQueries({ queryKey: ['health', 'vaccines', 'overview', userId] })
    },
  })
}

export function useVaccineRecord(planId: number) {
  return useQuery({
    queryKey: ['health', 'vaccine-record', planId],
    queryFn: async () => {
      try {
        const { data } = await api.get<VaccinationRecord>(`/health/vaccines/${planId}/record/`)
        return data
      } catch {
        return null
      }
    },
    enabled: !!planId,
  })
}

export function useSaveVaccineRecord(userId: number, planId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<VaccinationRecord>) => {
      const { data } = await api.put<VaccinationRecord>(`/health/vaccines/${planId}/record/`, body)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health', 'vaccine-record', planId] })
      qc.invalidateQueries({ queryKey: ['health', 'vaccines', userId] })
    },
  })
}

export function useLoadChildVaccineSchedule(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ created: number; skipped: number }>(
        '/health/vaccines/load-child-schedule/',
        { user_id: userId },
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health', 'vaccines', userId] })
      qc.invalidateQueries({ queryKey: ['health', 'vaccines', 'overview', userId] })
    },
  })
}
