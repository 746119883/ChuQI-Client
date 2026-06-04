import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { MedicalVisit } from '@/lib/types'

export function useVisits(userId: number) {
  return useQuery({
    queryKey: ['health', 'visits', userId],
    queryFn: async () => {
      const { data } = await api.get<MedicalVisit[]>('/health/visits/', {
        params: { user_id: userId },
      })
      return data
    },
    enabled: !!userId,
  })
}

export function useVisit(id: number | undefined) {
  return useQuery({
    queryKey: ['health', 'visit', id],
    queryFn: async () => {
      const { data } = await api.get<MedicalVisit>(`/health/visits/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateVisit(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<MedicalVisit>) => {
      const { data } = await api.post<MedicalVisit>('/health/visits/', body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health', 'visits', userId] }),
  })
}

export function useUpdateVisit(userId: number, id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<MedicalVisit>) => {
      const { data } = await api.patch<MedicalVisit>(`/health/visits/${id}/`, body)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health', 'visits', userId] })
      qc.invalidateQueries({ queryKey: ['health', 'visit', id] })
    },
  })
}

export function useDeleteVisit(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/health/visits/${id}/`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health', 'visits', userId] }),
  })
}
