import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { TaskList, Task, PaginatedResponse } from '@/lib/types'

// ---------- TaskList ----------

export function useLists() {
  return useQuery({
    queryKey: ['lists'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<TaskList>>('/lists/')
      return data
    },
  })
}

export function useList(id: number | string | undefined) {
  return useQuery({
    queryKey: ['list', id],
    queryFn: async () => {
      const { data } = await api.get<TaskList>(`/lists/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: {
      name: string
      description?: string
      is_shared: boolean
    }) => {
      const { data } = await api.post<TaskList>('/lists/', vars)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lists'] })
    },
  })
}

export function useUpdateList(id: number | string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<TaskList>) => {
      const { data } = await api.patch<TaskList>(`/lists/${id}/`, patch)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lists'] })
      qc.invalidateQueries({ queryKey: ['list', id] })
    },
  })
}

export function useDeleteList() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/lists/${id}/`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lists'] })
    },
  })
}

// ---------- Task ----------

export function useTasks(listId: number | string | undefined) {
  return useQuery({
    queryKey: ['tasks', listId],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Task>>('/tasks/', {
        params: { list: listId },
      })
      return data
    },
    enabled: !!listId,
  })
}

export function useCreateTask(listId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (title: string) => {
      const { data } = await api.post<Task>('/tasks/', { list: listId, title })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', listId] })
      qc.invalidateQueries({ queryKey: ['lists'] })
    },
  })
}

export function useUpdateTask(listId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: number; patch: Partial<Task> }) => {
      const { data } = await api.patch<Task>(`/tasks/${vars.id}/`, vars.patch)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', listId] })
      qc.invalidateQueries({ queryKey: ['lists'] })
    },
  })
}

export function useDeleteTask(listId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/tasks/${id}/`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', listId] })
      qc.invalidateQueries({ queryKey: ['lists'] })
    },
  })
}
