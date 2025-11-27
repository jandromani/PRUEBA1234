import { jwtDecode } from 'jwt-decode'

export type TokenPayload = {
  address: string
  worldID: string
  exp: number
}

export const setToken = (token: string) => {
  if (typeof window === 'undefined') return

  localStorage.setItem('authToken', token)
}

export const getToken = () => {
  return typeof window !== 'undefined'
    ? localStorage.getItem('authToken')
    : null
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token)
    const now = Math.floor(Date.now() / 1000)
    return decoded.exp < now
  } catch {
    return true
  }
}

export const clearToken = () => {
  localStorage.removeItem('authToken')
}

export const scheduleAutoLogout = (token: string, logout: () => void) => {
  try {
    const decoded = jwtDecode<TokenPayload>(token)
    const timeout = decoded.exp * 1000 - Date.now()

    if (timeout > 0) {
      setTimeout(logout, timeout)
    }
  } catch {
    logout()
  }
}

export const getWorldID = () => {
  const token = getToken()
  if (!token) return null
  try {
    const decoded = jwtDecode<TokenPayload>(token)
    return decoded.worldID
  } catch {
    return null
  }
}
