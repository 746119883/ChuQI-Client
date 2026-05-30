import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  Milestone,
  MilestoneType,
  PaginatedResponse,
  TimelineEntry,
  Visibility,
} from '@/lib/types'

export function useTimeline() {
  return useQuery({
    queryKey: ['timeline'],
    queryFn: async () => {
      const { data } = await api.get<TimelineEntry[]>('/timeline/')
      return data
    },
  })
}

export function useMilestones() {
  return useQuery({
    queryKey: ['milestones'],
    queryFn: async () => {
      const { data } = await api.get<
        PaginatedResponse<Milestone> | Milestone[]
      >('/milestones/')
      return Array.isArray(data) ? data : data.results
    },
  })
}

export interface MilestoneInput {
  title: string
  date: string
  milestone_type: MilestoneType
  description?: string
  visibility?: Visibility
  cover_immich_asset_id?: string
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['milestones'] })
  qc.invalidateQueries({ queryKey: ['timeline'] })
}

export function useCreateMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: MilestoneInput) => {
      const { data } = await api.post<Milestone>('/milestones/', vars)
      return data
    },
    onSuccess: () => invalidate(qc),
  })
}

export function useUpdateMilestone(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<MilestoneInput>) => {
      const { data } = await api.patch<Milestone>(`/milestones/${id}/`, patch)
      return data
    },
    onSuccess: () => invalidate(qc),
  })
}

export function useDeleteMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/milestones/${id}/`)
      return id
    },
    onSuccess: () => invalidate(qc),
  })
}

export function useUploadMilestoneCover(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('cover', file)
      const { data } = await api.post<Milestone>(`/milestones/${id}/cover/`, fd, {
        headers: { 'Content-Type': undefined } as never,
      })
      return data
    },
    onSuccess: () => invalidate(qc),
  })
}
