import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { HealthAttachment } from '@/lib/types'

/** params 例如 { checkup_result: 5 } / { vaccination_record: 3 } / { medical_visit: 8 } */
export function useHealthAttachments(params: Record<string, number>) {
  const key = ['health', 'attachments', params]
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<HealthAttachment[]>('/health/attachments/', { params })
      return data
    },
    enabled: Object.values(params).every((v) => !!v),
  })
}

export function useUploadHealthAttachment(params: Record<string, number>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('file', file)
      Object.entries(params).forEach(([k, v]) => fd.append(k, String(v)))
      const { data } = await api.post<HealthAttachment>('/health/attachments/', fd, {
        headers: { 'Content-Type': undefined } as never,
      })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health', 'attachments', params] }),
  })
}

export function useDeleteHealthAttachment(params: Record<string, number>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/health/attachments/${id}/`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health', 'attachments', params] }),
  })
}
