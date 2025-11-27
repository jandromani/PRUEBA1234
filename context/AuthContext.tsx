'use client'

import { useRouter } from 'next/navigation'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import {
  getToken,
  isTokenExpired,
  clearToken,
  scheduleAutoLogout,
  setToken as setTokenFromLib,
  getWorldID,
} from '@/lib/auth'

type AuthContextType = {
  token: string | null
  isLoggedIn: boolean
  worldID: string | null
  logout: () => void
  setWorldID: (id: string | null) => void
  storeToken: (token: string) => void
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  isLoggedIn: false,
  logout: () => {},
  storeToken: () => {},
  worldID: null,
  setWorldID: () => {},
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null)
  const [worldID, setWorldID] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    const stored = getToken()
    if (stored && !isTokenExpired(stored)) {
      // set the token state
      setToken(stored)
      scheduleAutoLogout(stored, logout)

      // get the worldID from the token
      const worldID = getWorldID()
      if (worldID) setWorldID(worldID)
    } else {
      // clear the token and redirect to the login page
      clearToken()
      router.push('/login')
    }
  }, [])

  // store the token after successful login
  const storeToken = (token: string) => {
    setTokenFromLib(token)
    setToken(token)
    router.push('/')

    scheduleAutoLogout(token, logout)
  }

  const logout = () => {
    clearToken()
    setToken(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoggedIn: !!token,
        logout,
        storeToken,
        worldID,
        setWorldID,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
