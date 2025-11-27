'use server'

import { nanoid } from 'nanoid'
import { cookies } from 'next/headers'

export async function getNonce() {
  try {
    const nonce = nanoid(32)

    cookies().set('siwe_nonce', nonce, {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 600,
    })

    return { nonce, success: true }
  } catch (error) {
    console.error('Error generating nonce:', error)
    return { error: 'Failed to generate nonce', success: false }
  }
}

export async function verifyNonceCookie(submittedNonce: string) {
  try {
    const storedNonce = cookies().get('siwe_nonce')?.value

    if (!storedNonce) {
      return { isValid: false, error: 'No nonce found in cookies' }
    }

    const isValid = storedNonce === submittedNonce

    if (isValid) {
      cookies().delete('siwe_nonce')
    }

    return { isValid }
  } catch (error) {
    console.error('Error verifying nonce:', error)
    return { isValid: false, error: 'Nonce verification failed' }
  }
}
