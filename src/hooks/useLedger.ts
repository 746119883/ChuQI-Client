import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  LedgerCategory,
  LedgerEntry,
  LedgerSummary,
  LedgerType,
  PaginatedResponse,
  Visibility,
} from '@/lib/types'

export interface LedgerFilters {
  year?: number
  month?: string // YYYY-MM
  type?: LedgerType
  category?: LedgerCategory
}

export function useLedgerEntries(filters: LedgerFilters = {}) {
  return useQuery({
    queryKey: ['ledger', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<LedgerEntry>>('/ledger/', {
        params: {
          year: filters.year || undefined,
          month: filters.month || undefined,
          type: filters.type || undefined,
          category: filters.category || undefined,
        },
      })
      return data
    },
  })
}

export function useLedgerSummary(year: number) {
  return useQuery({
    queryKey: ['ledger-summary', year],
    queryFn: async () => {
      const { data } = await api.get<LedgerSummary>('/ledger/summary/', {
        params: { year },
      })
      return data
    },
  })
}

export function useLedgerYears() {
  return useQuery({
    queryKey: ['ledger-years'],
    queryFn: async () => {
      const { data } = await api.get<number[]>('/ledger/years/')
      return data
    },
  })
}

export interface LedgerInput {
  entry_type: LedgerType
  amount: string
  category: LedgerCategory
  title: string
  note?: string
  date: string
  visibility?: Visibility
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['ledger'] })
  qc.invalidateQueries({ queryKey: ['ledger-summary'] })
  qc.invalidateQueries({ queryKey: ['ledger-years'] })
}

export function useCreateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: LedgerInput) => {
      const { data } = await api.post<LedgerEntry>('/ledger/', vars)
      return data
    },
    onSuccess: () => invalidate(qc),
  })
}

export function useUpdateEntry(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<LedgerInput>) => {
      const { data } = await api.patch<LedgerEntry>(`/ledger/${id}/`, patch)
      return data
    },
    onSuccess: () => invalidate(qc),
  })
}

export function useDeleteEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/ledger/${id}/`)
      return id
    },
    onSuccess: () => invalidate(qc),
  })
}
