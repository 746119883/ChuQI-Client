import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  Comment,
  Moment,
  OnThisDayResponse,
  PaginatedResponse,
  ReactionKey,
  Visibility,
} from '@/lib/types'

export function useOnThisDay() {
  return useQuery({
    queryKey: ['onThisDay'],
    queryFn: async () => {
      const { data } = await api.get<OnThisDayResponse>('/feed/on-this-day/')
      return data
    },
    staleTime: 1000 * 60 * 30,
  })
}

export function useMoments() {
  return useQuery({
    queryKey: ['moments'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Moment>>('/moments/')
      return data
    },
  })
}

export function useCreateMoment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: {
      content: string
      visibility: Visibility
      images: File[]
      immichAssetIds?: string[]
    }) => {
      const fd = new FormData()
      fd.append('content', vars.content)
      fd.append('visibility', vars.visibility)
      vars.images.forEach((f) => fd.append('images', f))
      ;(vars.immichAssetIds ?? []).forEach((id) =>
        fd.append('immich_asset_ids', id),
      )
      const { data } = await api.post<Moment>('/moments/', fd, {
        // 让 axios 自己生成带 boundary 的 multipart Content-Type
        headers: { 'Content-Type': undefined } as never,
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['moments'] })
    },
  })
}

export function useDeleteMoment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/moments/${id}/`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['moments'] })
    },
  })
}

export function useReact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { momentId: number; emoji: ReactionKey }) => {
      const { data } = await api.post<{
        my_reaction: ReactionKey | null
        reactions_count: number
      }>(`/moments/${vars.momentId}/react/`, { emoji: vars.emoji })
      return { momentId: vars.momentId, ...data }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['moments'] })
      qc.invalidateQueries({ queryKey: ['onThisDay'] })
    },
  })
}

export function useComments(momentId: number) {
  return useQuery({
    queryKey: ['comments', momentId],
    queryFn: async () => {
      const { data } = await api.get<Comment[]>(`/moments/${momentId}/comments/`)
      return data
    },
    enabled: !!momentId,
  })
}

export function useAddComment(momentId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { content: string; mentionedUserIds?: number[] }) => {
      const { data } = await api.post<Comment>(
        `/moments/${momentId}/comments/`,
        { content: vars.content, mentioned_user_ids: vars.mentionedUserIds ?? [] },
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', momentId] })
      qc.invalidateQueries({ queryKey: ['moments'] })
    },
  })
}

export function useDeleteComment(momentId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (commentId: number) => {
      await api.delete(`/comments/${commentId}/`)
      return commentId
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', momentId] })
      qc.invalidateQueries({ queryKey: ['moments'] })
    },
  })
}
