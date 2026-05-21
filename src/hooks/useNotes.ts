import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Note, PaginatedResponse } from '@/lib/types'

export function useNotes(search?: string) {
  return useQuery({
    queryKey: ['notes', { search: search || '' }],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Note>>('/notes/', {
        params: search ? { q: search } : undefined,
      })
      return data
    },
  })
}

export function useNote(id: number | string | undefined) {
  return useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      const { data } = await api.get<Note>(`/notes/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { title: string; content: string }) => {
      const { data } = await api.post<Note>('/notes/', vars)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useUpdateNote(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<{ title: string; content: string }>) => {
      const { data } = await api.patch<Note>(`/notes/${id}/`, patch)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
      qc.invalidateQueries({ queryKey: ['note', id] })
    },
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/notes/${id}/`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}
