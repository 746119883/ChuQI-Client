import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { VaultFolder, VaultFile, Visibility } from '@/lib/types'

// ---------- Folders ----------

export function useFolders(parentId?: number | null, shared = false) {
  const key = parentId === null || parentId === undefined ? 'null' : parentId
  return useQuery({
    queryKey: ['vault-folders', key, shared],
    queryFn: async () => {
      const params: Record<string, string> = { parent: key === 'null' ? 'null' : String(key) }
      if (shared) params.shared = '1'
      const { data } = await api.get<VaultFolder[]>('/vault/folders/', { params })
      return data
    },
  })
}

export function useFolder(id: number | undefined) {
  return useQuery({
    queryKey: ['vault-folder', id],
    queryFn: async () => {
      const { data } = await api.get<VaultFolder>(`/vault/folders/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: {
      name: string
      parent: number | null
      visibility: Visibility
      description?: string
    }) => {
      const { data } = await api.post<VaultFolder>('/vault/folders/', vars)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vault-folders'] })
    },
  })
}

export function useDeleteFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/vault/folders/${id}/`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vault-folders'] })
      qc.invalidateQueries({ queryKey: ['vault-files'] })
    },
  })
}

// ---------- Files ----------

export function useFiles(
  folderId?: number | null,
  opts: { q?: string; sort?: string; shared?: boolean } = {},
) {
  const key = folderId === null || folderId === undefined ? 'null' : folderId
  return useQuery({
    queryKey: ['vault-files', key, opts],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (opts.q) {
        params.q = opts.q
      } else {
        params.folder = key === 'null' ? 'null' : String(key)
      }
      if (opts.sort) params.sort = opts.sort
      if (opts.shared) params.shared = '1'
      const { data } = await api.get<VaultFile[]>('/vault/files/', { params })
      return data
    },
  })
}

export function useMoveFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, folderId }: { id: number; folderId: number | null }) => {
      const { data } = await api.post<VaultFile>(`/vault/files/${id}/move/`, {
        folder_id: folderId,
      })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vault-files'] }),
  })
}

export function useUploadFiles() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: {
      files: File[]
      folderId: number | null
      isImportant: boolean
      visibility: Visibility
    }) => {
      const fd = new FormData()
      vars.files.forEach((f) => fd.append('files', f))
      if (vars.folderId) fd.append('folder', String(vars.folderId))
      fd.append('is_important', vars.isImportant ? 'true' : 'false')
      fd.append('visibility', vars.visibility)
      const { data } = await api.post<{ created: VaultFile[] }>(
        '/vault/files/upload/',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vault-files'] })
      qc.invalidateQueries({ queryKey: ['vault-folders'] })
    },
  })
}

export function useUpdateFile(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<VaultFile>) => {
      const { data } = await api.patch<VaultFile>(`/vault/files/${id}/`, patch)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vault-files'] })
    },
  })
}

export function useDeleteFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/vault/files/${id}/`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vault-files'] })
      qc.invalidateQueries({ queryKey: ['vault-folders'] })
    },
  })
}
