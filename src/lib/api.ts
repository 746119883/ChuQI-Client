import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  clearTokens,
} from './auth'

const baseURL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器:自动带 access token
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器:401 自动用 refresh token 换新 access token,重放原请求
let refreshPromise: Promise<string> | null = null

async function doRefresh(): Promise<string> {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error('no refresh token')
  const res = await axios.post(`${baseURL}/auth/refresh/`, { refresh })
  const newAccess = res.data.access as string
  setAccessToken(newAccess)
  return newAccess
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    const isAuthEndpoint = original?.url?.includes('/auth/')

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint
    ) {
      original._retry = true
      try {
        // 同一时刻多个并发 401 请求,只刷一次 token
        if (!refreshPromise) {
          refreshPromise = doRefresh().finally(() => {
            refreshPromise = null
          })
        }
        const newAccess = await refreshPromise
        original.headers.Authorization = `Bearer ${newAccess}`
        return api(original)
      } catch {
        clearTokens()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api
