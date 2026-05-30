import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  ChecklistKind,
  PaginatedResponse,
  Trip,
  TripChecklistItem,
  TripItem,
  TripItemType,
  TripListItem,
  Visibility,
} from '@/lib/types'

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<TripListItem>>('/trips/')
      return data
    },
  })
}

export function useTrip(id: number | undefined) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      const { data } = await api.get<Trip>(`/trips/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export interface TripInput {
  title: string
  destination?: string
  start_date: string
  end_date?: string | null
  summary?: string
  cover_immich_asset_id?: string
  visibility?: Visibility
}

export function useCreateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: TripInput) => {
      const { data } = await api.post<Trip>('/trips/', vars)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  })
}

export function useUpdateTrip(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<TripInput>) => {
      const { data } = await api.patch<Trip>(`/trips/${id}/`, patch)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
      qc.invalidateQueries({ queryKey: ['trip', id] })
    },
  })
}

export function useDeleteTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/trips/${id}/`)
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  })
}

export function useUploadTripCover(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('cover', file)
      const { data } = await api.post<Trip>(`/trips/${id}/cover/`, fd, {
        headers: { 'Content-Type': undefined } as never,
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
      qc.invalidateQueries({ queryKey: ['trip', id] })
    },
  })
}

export interface TripItemInput {
  trip: number
  date: string
  time?: string | null
  item_type: TripItemType
  title: string
  detail?: string
  location?: string
}

function invalidateTrip(qc: ReturnType<typeof useQueryClient>, tripId: number) {
  qc.invalidateQueries({ queryKey: ['trip', tripId] })
}

export function useCreateTripItem(tripId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: TripItemInput) => {
      const { data } = await api.post<TripItem>('/trip-items/', vars)
      return data
    },
    onSuccess: () => invalidateTrip(qc, tripId),
  })
}

export function useUpdateTripItem(tripId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: number } & Partial<TripItemInput>) => {
      const { id, ...patch } = vars
      const { data } = await api.patch<TripItem>(`/trip-items/${id}/`, patch)
      return data
    },
    onSuccess: () => invalidateTrip(qc, tripId),
  })
}

export function useDeleteTripItem(tripId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/trip-items/${id}/`)
      return id
    },
    onSuccess: () => invalidateTrip(qc, tripId),
  })
}

export function useAddChecklistItem(tripId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { kind: ChecklistKind; text: string }) => {
      const { data } = await api.post<TripChecklistItem>('/trip-checklist/', {
        trip: tripId,
        kind: vars.kind,
        text: vars.text,
      })
      return data
    },
    onSuccess: () => invalidateTrip(qc, tripId),
  })
}

export function useToggleChecklistItem(tripId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { id: number; checked: boolean }) => {
      const { data } = await api.patch<TripChecklistItem>(`/trip-checklist/${vars.id}/`, {
        checked: vars.checked,
      })
      return data
    },
    onSuccess: () => invalidateTrip(qc, tripId),
  })
}

export function useDeleteChecklistItem(tripId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/trip-checklist/${id}/`)
      return id
    },
    onSuccess: () => invalidateTrip(qc, tripId),
  })
}

export function useTripToMoment(id: number) {
  return useMutation({
    mutationFn: async (withPhotos: boolean) => {
      const { data } = await api.post<{ moment_id: number; photos_attached: number }>(
        `/trips/${id}/to-moment/`,
        { with_photos: withPhotos },
      )
      return data
    },
  })
}

export function useTripToImmichAlbum(id: number) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{
        album_id: string
        album_name: string
        asset_count: number
      }>(`/trips/${id}/to-immich-album/`, {})
      return data
    },
  })
}
