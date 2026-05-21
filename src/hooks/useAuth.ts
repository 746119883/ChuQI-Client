import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { setTokens, clearTokens, isAuthenticated } from '@/lib/auth'
import type { User } from '@/lib/types'

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get<User>('/auth/me/')
      return data
    },
    enabled: isAuthenticated(),
    retry: false,
    staleTime: Infinity,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { username: string; password: string }) => {
      const { data } = await api.post<{ access: string; refresh: string }>(
        '/auth/login/',
        vars,
      )
      return data
    },
    onSuccess: (data) => {
      setTokens(data.access, data.refresh)
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: async (vars: { username: string; password: string }) => {
      const { data } = await api.post<User>('/auth/register/', vars)
      return data
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return () => {
    clearTokens()
    qc.clear()
    window.location.href = '/login'
  }
}
