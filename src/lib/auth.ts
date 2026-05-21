const ACCESS_TOKEN_KEY = 'chuqi.accessToken'
const REFRESH_TOKEN_KEY = 'chuqi.refreshToken'

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access)
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

export const setAccessToken = (access: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access)
}

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export const isAuthenticated = () => !!getAccessToken()
