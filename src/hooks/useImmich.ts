import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  ImmichAlbumAssets,
  ImmichAlbumList,
  ImmichRecent,
  ImmichStatus,
  ImmichToday,
} from '@/lib/types'

export function useImmichStatus() {
  return useQuery({
    queryKey: ['immich-status'],
    queryFn: async () => {
      const { data } = await api.get<ImmichStatus>('/immich/status/')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useImmichToday() {
  return useQuery({
    queryKey: ['immich-today'],
    queryFn: async () => {
      const { data } = await api.get<ImmichToday>('/immich/today/')
      return data
    },
    staleTime: 60 * 1000,
  })
}

export function useImmichAlbums(enabled = true) {
  return useQuery({
    queryKey: ['immich-albums'],
    queryFn: async () => {
      const { data } = await api.get<ImmichAlbumList>('/immich/albums/')
      return data
    },
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useImmichAlbum(albumId: string | null) {
  return useQuery({
    queryKey: ['immich-album', albumId],
    queryFn: async () => {
      const { data } = await api.get<ImmichAlbumAssets>(`/immich/albums/${albumId}/`)
      return data
    },
    enabled: !!albumId,
  })
}

export function useImmichRecent(days = 30, pageSize = 60) {
  return useInfiniteQuery({
    queryKey: ['immich-recent', days, pageSize],
    queryFn: async ({ pageParam = 1 }) => {
      const { data } = await api.get<ImmichRecent>('/immich/recent/', {
        params: { days, size: pageSize, page: pageParam },
      })
      return data
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.next_page ? Number(last.next_page) : undefined),
  })
}
