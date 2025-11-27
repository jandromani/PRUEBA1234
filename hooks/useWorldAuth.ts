import {
  ISuccessResult,
  MiniAppWalletAuthPayload,
  MiniKit,
  VerificationLevel,
} from '@worldcoin/minikit-js'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { getNonce, verifyNonceCookie } from '@/app/actions/verify'
import { useAuth } from '@/context/AuthContext'
import { AUTH_ERRORS } from '@/lib/constants/authErrors'

export type AuthResult = {
  success: boolean
  data?: unknown
  error?: string
}

const getVerificationLevel = () => {
  const configuredLevel =
    process.env.NEXT_PUBLIC_WLD_VERIFICATION_LEVEL || VerificationLevel.Device

  const verificationLevel = String(
    configuredLevel,
  ).toLowerCase() as VerificationLevel

  const verificationLevels = Object.keys(VerificationLevel).map(level =>
    level.toLowerCase(),
  )

  if (!verificationLevels.includes(verificationLevel)) {
    throw new Error(
      `NEXT_PUBLIC_WLD_VERIFICATION_LEVEL is invalid: ${verificationLevel} 
        Allowed levels: ${verificationLevels.join(', ')}`,
    )
  }

  return verificationLevel
}

export const useWorldAuth = () => {
  const router = useRouter()

  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { storeToken, isLoggedIn } = useAuth()

  const performWalletAuth = async (nonce: string) => {
    try {
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        requestId: '0',
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        notBefore: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        statement: 'Sign in to WorldView via World App.',
      })
      return finalPayload
    } catch (err) {
      setError(AUTH_ERRORS.WALLET_AUTH_FAILED)
      throw AUTH_ERRORS.WALLET_AUTH_FAILED
    }
  }

  const startWorldIDVerification = async () => {
    try {
      const verificationLevel = getVerificationLevel()

      const actionId = process.env.NEXT_PUBLIC_WLD_ACTION_ID || 'verify'
      const verifyCommand = {
        action: actionId,
        signal: '',
        verification_level: verificationLevel,
      }

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyCommand)
      if (finalPayload.status === 'error') {
        setError(AUTH_ERRORS.WORLD_ID_VERIFICATION_FAILED)
        throw AUTH_ERRORS.WORLD_ID_VERIFICATION_FAILED
      }
      return finalPayload
    } catch (err) {
      setError(AUTH_ERRORS.WORLD_ID_VERIFICATION_ERROR)
      throw AUTH_ERRORS.WORLD_ID_VERIFICATION_ERROR
    }
  }

  const verifyWorldIDProof = async (proof: ISuccessResult) => {
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: proof,
          action: process.env.NEXT_PUBLIC_WLD_ACTION_ID || 'verify',
          signal: '',
        }),
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) {
        setError(AUTH_ERRORS.API_ERROR)
        throw AUTH_ERRORS.API_ERROR
      }

      const json = await res.json()

      if (json.status !== 200) {
        setError(AUTH_ERRORS.PROOF_VERIFICATION_FAILED)
        throw AUTH_ERRORS.PROOF_VERIFICATION_FAILED
      }

      return json
    } catch (err) {
      setError(AUTH_ERRORS.PROOF_VERIFICATION_ERROR)
      throw AUTH_ERRORS.PROOF_VERIFICATION_ERROR
    }
  }

  const verifyPayload = async (
    walletPayload: MiniAppWalletAuthPayload,
    worldIdProof: ISuccessResult,
    nonce: string,
  ): Promise<AuthResult> => {
    try {
      const result = await verifyNonceCookie(nonce)

      if (!result.isValid) {
        setError(AUTH_ERRORS.LOGIN_FAILED)
        return {
          success: false,
          error: AUTH_ERRORS.NONCE_VERIFICATION_FAILED,
        }
      }

      if (walletPayload.status !== 'success') {
        setError(AUTH_ERRORS.WALLET_AUTH_FAILED)
        return {
          success: false,
          error: AUTH_ERRORS.WALLET_AUTH_FAILED,
        }
      }

      const userDetails = await MiniKit.getUserByAddress(walletPayload.address)

      const res = await fetch('/auth/verifyWorldId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletPayload,
          worldIdProof,
          userDetails,
          nonce,
          verificationLevel: getVerificationLevel(),
        }),
      })

      if (!res.ok) {
        setError(AUTH_ERRORS.SERVER_VERIFICATION_FAILED)
        return {
          success: false,
          error: AUTH_ERRORS.SERVER_VERIFICATION_FAILED,
        }
      }

      const data = await res.json()
      storeToken(data.token)

      return {
        success: true,
        data,
      }
    } catch (err) {
      setError(AUTH_ERRORS.PAYLOAD_VERIFICATION_ERROR)
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  const clearError = () => {
    setError(null)
  }

  const handleLogin = useCallback(async (): Promise<AuthResult> => {
    setError(null)

    if (!MiniKit.isInstalled()) {
      setError(AUTH_ERRORS.MINIKIT_NOT_INSTALLED)
      return { success: false, error: AUTH_ERRORS.MINIKIT_NOT_INSTALLED }
    }

    try {
      setIsLoggingIn(true)

      // Step 1: World ID verification (device level)
      let worldIdProof
      try {
        worldIdProof = await startWorldIDVerification()
        await verifyWorldIDProof(worldIdProof)
      } catch (err) {
        return {
          success: false,
          error: AUTH_ERRORS.WORLD_ID_VERIFICATION_FAILED,
        }
      }

      // Step 2: SIWE auth level
      let nonce
      let walletPayload
      try {
        const nonceResult = await getNonce()
        if (!nonceResult.success || !nonceResult.nonce) {
          setError(AUTH_ERRORS.NONCE_ERROR)
          return { success: false, error: AUTH_ERRORS.NONCE_ERROR }
        }
        nonce = nonceResult.nonce
        walletPayload = await performWalletAuth(nonce)
      } catch (err) {
        return {
          success: false,
          error: AUTH_ERRORS.WALLET_AUTH_ERROR,
        }
      }

      // Step 3: Verify everything with the server
      return await verifyPayload(walletPayload, worldIdProof, nonce)
    } catch (err) {
      setError(AUTH_ERRORS.LOGIN_FAILED)
      return { success: false, error: AUTH_ERRORS.LOGIN_FAILED }
    } finally {
      setIsLoggingIn(false)
    }
  }, [])

  return {
    handleLogin,
    isLoggingIn,
    isLoggedIn,
    error,
    clearError,
  }
}
