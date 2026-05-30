import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  PaginatedResponse,
  Recipe,
  RecipeCategory,
  RecipeDifficulty,
  RecipeListItem,
  Visibility,
} from '@/lib/types'

export interface RecipeFilters {
  category?: RecipeCategory | ''
  q?: string
  mine?: boolean
}

export function useRecipes(filters: RecipeFilters = {}) {
  return useQuery({
    queryKey: ['recipes', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<RecipeListItem>>('/recipes/', {
        params: {
          category: filters.category || undefined,
          q: filters.q || undefined,
          mine: filters.mine ? 1 : undefined,
        },
      })
      return data
    },
  })
}

export function useRecipe(id: number | undefined) {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const { data } = await api.get<Recipe>(`/recipes/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export interface RecipeInput {
  title: string
  description?: string
  category?: RecipeCategory
  tags?: string[]
  servings?: string
  total_time_min?: number | null
  difficulty?: RecipeDifficulty
  ingredients?: { name: string; amount: string }[]
  steps?: { text: string }[]
  cover_immich_asset_id?: string
  visibility?: Visibility
}

export function useCreateRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: RecipeInput) => {
      const { data } = await api.post<Recipe>('/recipes/', vars)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  })
}

export function useUpdateRecipe(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: Partial<RecipeInput>) => {
      const { data } = await api.patch<Recipe>(`/recipes/${id}/`, patch)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
      qc.invalidateQueries({ queryKey: ['recipe', id] })
    },
  })
}

export function useDeleteRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/recipes/${id}/`)
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipes'] }),
  })
}

export function useUploadRecipeCover(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append('cover', file)
      const { data } = await api.post<Recipe>(`/recipes/${id}/cover/`, fd, {
        headers: { 'Content-Type': undefined } as never,
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipes'] })
      qc.invalidateQueries({ queryKey: ['recipe', id] })
    },
  })
}

export function useRecipeToShoppingList(id: number) {
  return useMutation({
    mutationFn: async (listId?: number) => {
      const { data } = await api.post<{
        list_id: number
        list_name: string
        added: number
      }>(`/recipes/${id}/to-shopping-list/`, listId ? { list_id: listId } : {})
      return data
    },
  })
}
