import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { CalendarEvent, EventOccurrence } from '@/lib/types'

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await api.get<CalendarEvent[]>('/events/')
      return data
    },
  })
}

export function useUpcoming(days = 60) {
  return useQuery({
    queryKey: ['events-upcoming', days],
    queryFn: async () => {
      const { data } = await api.get<EventOccurrence[]>('/events/upcoming/', {
        params: { days },
      })
      return data
    },
  })
}

export function useOccurrences(start: string, end: string) {
  return useQuery({
    queryKey: ['events-occurrences', start, end],
    queryFn: async () => {
      const { data } = await api.get<EventOccurrence[]>('/events/occurrences/', {
        params: { start, end },
      })
      return data
    },
    enabled: !!start && !!end,
  })
}

type EventInput = Partial<Omit<CalendarEvent, 'id' | 'owner' | 'created_at' | 'updated_at'>>

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: EventInput) => {
      const { data } = await api.post<CalendarEvent>('/events/', vars)
      return data
    },
    onSuccess: invalidateAll(qc),
  })
}

export function useUpdateEvent(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: EventInput) => {
      const { data } = await api.patch<CalendarEvent>(`/events/${id}/`, patch)
      return data
    },
    onSuccess: invalidateAll(qc),
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/events/${id}/`)
      return id
    },
    onSuccess: invalidateAll(qc),
  })
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  return () => {
    qc.invalidateQueries({ queryKey: ['events'] })
    qc.invalidateQueries({ queryKey: ['events-upcoming'] })
    qc.invalidateQueries({ queryKey: ['events-occurrences'] })
  }
}
