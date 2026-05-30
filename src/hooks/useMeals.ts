import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  DiningOption,
  MealLog,
  MealType,
  OptionKind,
  PaginatedResponse,
  RollResult,
} from '@/lib/types'

// ---- 摇一摇 ----
export interface RollParams {
  source?: 'all' | 'recipe' | 'option'
  kind?: OptionKind
  exclude_days?: number
  count?: number
}

export function useRoll() {
  return useMutation({
    mutationFn: async (params: RollParams = {}) => {
      const { data } = await api.get<RollResult>('/meal-logs/roll/', {
        params: {
          source: params.source || undefined,
          kind: params.kind || undefined,
          exclude_days: params.exclude_days,
          count: params.count,
        },
      })
      return data
    },
  })
}

// ---- 就餐选项 ----
export interface DiningOptionFilters {
  kind?: OptionKind
  active?: boolean
}

export function useDiningOptions(filters: DiningOptionFilters = {}) {
  return useQuery({
    queryKey: ['dining-options', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<DiningOption>>('/dining-options/', {
        params: {
          kind: filters.kind || undefined,
          active: filters.active ? 1 : undefined,
        },
      })
      return data
    },
  })
}

export interface DiningOptionInput {
  name: string
  kind?: OptionKind
  note?: string
  weight?: number
  is_active?: boolean
}

export function useCreateDiningOption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: DiningOptionInput) => {
      const { data } = await api.post<DiningOption>('/dining-options/', vars)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dining-options'] }),
  })
}

export function useUpdateDiningOption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: Partial<DiningOptionInput> }) => {
      const { data } = await api.patch<DiningOption>(`/dining-options/${id}/`, patch)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dining-options'] }),
  })
}

export function useDeleteDiningOption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/dining-options/${id}/`)
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dining-options'] }),
  })
}

// ---- 用餐记录 ----
export interface MealLogFilters {
  meal_type?: MealType
  from?: string
  to?: string
  mine?: boolean
}

export function useMealLogs(filters: MealLogFilters = {}) {
  return useQuery({
    queryKey: ['meal-logs', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<MealLog>>('/meal-logs/', {
        params: {
          meal_type: filters.meal_type || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          mine: filters.mine ? 1 : undefined,
        },
      })
      return data
    },
  })
}

export interface MealLogInput {
  date: string
  meal_type: MealType
  recipe?: number | null
  option?: number | null
  custom_name?: string
  note?: string
}

export function useCreateMealLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: MealLogInput) => {
      const { data } = await api.post<MealLog>('/meal-logs/', vars)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal-logs'] }),
  })
}

export function useDeleteMealLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/meal-logs/${id}/`)
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meal-logs'] }),
  })
}
