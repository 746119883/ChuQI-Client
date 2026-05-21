import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  Album,
  Photo,
  Video,
  MediaItem,
  PaginatedResponse,
} from '@/lib/types'

// ---------- Album ----------

export function useAlbums() {
  return useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Album>>('/albums/')
      return data
    },
  })
}

export function useAlbum(id: number | string | undefined) {
  return useQuery({
    queryKey: ['album', id],
    queryFn: async () => {
      const { data } = await api.get<Album>(`/albums/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateAlbum() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { name: string; description?: string }) => {
      const { data } = await api.post<Album>('/albums/', vars)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['albums'] })
    },
  })
}

export function useDeleteAlbum() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/albums/${id}/`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['albums'] })
      qc.invalidateQueries({ queryKey: ['photos'] })
    },
  })
}

// ---------- Photo ----------

export function usePhotos(albumId?: number | 'null') {
  return useQuery({
    queryKey: ['photos', albumId ?? 'all'],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (albumId !== undefined) params.album = String(albumId)
      const { data } = await api.get<PaginatedResponse<Photo>>('/photos/', {
        params,
      })
      return data
    },
  })
}

export function useUploadPhotos() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { files: File[]; albumId?: number | null }) => {
      const fd = new FormData()
      vars.files.forEach((f) => fd.append('files', f))
      if (vars.albumId) fd.append('album', String(vars.albumId))
      const { data } = await api.post<{
        photos: Photo[]
        videos: Video[]
        errors: { name: string; error: string }[]
      }>('/photos/upload/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['photos'] })
      qc.invalidateQueries({ queryKey: ['videos'] })
      qc.invalidateQueries({ queryKey: ['media'] })
      qc.invalidateQueries({ queryKey: ['albums'] })
    },
  })
}

export function useDeletePhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/photos/${id}/`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['photos'] })
      qc.invalidateQueries({ queryKey: ['media'] })
      qc.invalidateQueries({ queryKey: ['albums'] })
    },
  })
}

// ---------- Media (统一时间线:照片 + 视频) ----------

export function useMedia(albumId?: number | 'null') {
  return useQuery({
    queryKey: ['media', albumId ?? 'all'],
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (albumId !== undefined) params.album = String(albumId)
      const { data } = await api.get<{ results: MediaItem[]; count: number }>(
        '/media/',
        { params },
      )
      return data
    },
  })
}

export function useDeleteVideo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/videos/${id}/`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['videos'] })
      qc.invalidateQueries({ queryKey: ['media'] })
      qc.invalidateQueries({ queryKey: ['albums'] })
    },
  })
}
