import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Moment, Comment, PaginatedResponse, Visibility } from '@/lib/types'

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
    }) => {
      const fd = new FormData()
      fd.append('content', vars.content)
      fd.append('visibility', vars.visibility)
      vars.images.forEach((f) => fd.append('images', f))
      const { data } = await api.post<Moment>('/moments/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
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

export function useToggleLike() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (momentId: number) => {
      const { data } = await api.post<{ liked: boolean; count: number }>(
        `/moments/${momentId}/like/`,
      )
      return { momentId, ...data }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['moments'] })
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
    mutationFn: async (content: string) => {
      const { data } = await api.post<Comment>(
        `/moments/${momentId}/comments/`,
        { content },
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
