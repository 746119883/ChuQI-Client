import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { PaginatedResponse, Story, StoryBlock, StoryListItem } from '@/lib/types'

export function useStories(params: { q?: string; year?: number } = {}) {
  return useQuery({
    queryKey: ['stories', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<StoryListItem>>('/stories/', {
        params: { q: params.q || undefined, year: params.year || undefined },
      })
      return data
    },
  })
}

export function useStory(id: number | undefined) {
  return useQuery({
    queryKey: ['story', id],
    queryFn: async () => {
      const { data } = await api.get<Story>(`/stories/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export interface StoryInput {
  title: string
  date: string
  summary?: string
  cover_immich_asset_id?: string
  visibility?: 'family' | 'private'
}

export function useCreateStory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: StoryInput) => {
      const { data } = await api.post<Story>('/stories/', vars)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stories'] }),
  })
}

export function useUpdateStory(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<StoryInput>) => {
      const { data } = await api.patch<Story>(`/stories/${id}/`, patch)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stories'] })
      qc.invalidateQueries({ queryKey: ['story', id] })
    },
  })
}

export function useDeleteStory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/stories/${id}/`)
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stories'] }),
  })
}

// ---- 内容块 ----

export function useAddTextBlock(storyId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { text: string; order?: number }) => {
      const { data } = await api.post<StoryBlock>(`/stories/${storyId}/blocks/`, {
        kind: 'text', ...vars,
      })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['story', storyId] }),
  })
}

export function useAddImmichBlock(storyId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { immich_asset_id: string; immich_filename?: string; caption?: string }) => {
      const { data } = await api.post<StoryBlock>(`/stories/${storyId}/blocks/`, {
        kind: 'immich', ...vars,
      })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['story', storyId] }),
  })
}

export function useAddPhotoBlock(storyId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { file: File; caption?: string }) => {
      const fd = new FormData()
      fd.append('kind', 'photo')
      fd.append('image', vars.file)
      if (vars.caption) fd.append('caption', vars.caption)
      const { data } = await api.post<StoryBlock>(`/stories/${storyId}/blocks/`, fd, {
        headers: { 'Content-Type': undefined } as never,
      })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['story', storyId] }),
  })
}

export function useUpdateBlock(storyId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { blockId: number; text?: string; caption?: string; order?: number }) => {
      const { blockId, ...patch } = vars
      const { data } = await api.patch<StoryBlock>(`/stories/${storyId}/blocks/${blockId}/`, patch)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['story', storyId] }),
  })
}

export function useDeleteBlock(storyId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (blockId: number) => {
      await api.delete(`/stories/${storyId}/blocks/${blockId}/`)
      return blockId
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['story', storyId] }),
  })
}
