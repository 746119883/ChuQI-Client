import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { HealthProfile, MemberHealthProfile } from '@/lib/types'

export function useHealthProfiles() {
  return useQuery({
    queryKey: ['health', 'profiles'],
    queryFn: async () => {
      const { data } = await api.get<MemberHealthProfile[]>('/health/profiles/')
      return data
    },
  })
}

export function useHealthProfile(userId: number) {
  return useQuery({
    queryKey: ['health', 'profiles', userId],
    queryFn: async () => {
      const { data } = await api.get<HealthProfile>(`/health/profiles/${userId}/`)
      return data
    },
    enabled: !!userId,
  })
}

export function useUpdateHealthProfile(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<HealthProfile>) => {
      const { data } = await api.patch<HealthProfile>(`/health/profiles/${userId}/`, body)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health', 'profiles', userId] })
      qc.invalidateQueries({ queryKey: ['health', 'profiles'] })
    },
  })
}
