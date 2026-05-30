import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { setTokens, clearTokens, isAuthenticated } from '@/lib/auth'
import type {
  Invitation,
  InvitationLookup,
  Member,
  Role,
  User,
} from '@/lib/types'

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

export interface RegisterPayload {
  code: string
  username: string
  password: string
  nickname?: string
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: RegisterPayload) => {
      const { data } = await api.post<{
        access: string
        refresh: string
        user: User
      }>('/auth/register/', vars)
      return data
    },
    onSuccess: (data) => {
      setTokens(data.access, data.refresh)
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useInvitationLookup(code: string | undefined) {
  return useQuery({
    queryKey: ['invitation-lookup', code],
    queryFn: async () => {
      const { data } = await api.get<InvitationLookup>(
        `/family/invitations/lookup/${code}/`,
      )
      return data
    },
    enabled: !!code && code.length === 6,
    retry: false,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: FormData | Record<string, unknown>) => {
      // FormData 时让 axios 自己生成带 boundary 的 multipart Content-Type
      const headers = vars instanceof FormData ? { 'Content-Type': undefined } : undefined
      const { data } = await api.patch<User>('/auth/me/', vars, {
        headers: headers as never,
      })
      return data
    },
    onSuccess: (data) => {
      qc.setQueryData(['me'], data)
      qc.invalidateQueries({ queryKey: ['members'] })
    },
  })
}

export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const { data } = await api.get<Member[]>('/family/members/')
      return data
    },
  })
}

export function useUpdateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: {
      id: number
      role?: Role
      is_active?: boolean
    }) => {
      const { id, ...body } = vars
      const { data } = await api.patch<Member>(`/family/members/${id}/`, body)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] })
    },
  })
}

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const { data } = await api.get<
        { count: number; results: Invitation[] } | Invitation[]
      >('/family/invitations/')
      return Array.isArray(data) ? data : data.results
    },
  })
}

export function useCreateInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: {
      role: Role
      default_nickname?: string
      note?: string
    }) => {
      const { data } = await api.post<Invitation>('/family/invitations/', vars)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] })
    },
  })
}

export function useRevokeInvitation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/family/invitations/${id}/`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invitations'] })
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
