export type AuthErrorCode =
  | 'MINIKIT_NOT_INSTALLED'
  | 'WALLET_AUTH_FAILED'
  | 'WORLD_ID_VERIFICATION_FAILED'
  | 'WORLD_ID_VERIFICATION_ERROR'
  | 'API_ERROR'
  | 'PROOF_VERIFICATION_FAILED'
  | 'PROOF_VERIFICATION_ERROR'
  | 'NONCE_VERIFICATION_FAILED'
  | 'SERVER_VERIFICATION_FAILED'
  | 'PAYLOAD_VERIFICATION_ERROR'
  | 'NONCE_ERROR'
  | 'WALLET_AUTH_ERROR'
  | 'LOGIN_FAILED'
  | 'CONNECTION_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR'

export const AUTH_ERRORS: Record<AuthErrorCode, string> = {
  MINIKIT_NOT_INSTALLED: 'World App is not installed on your device',
  WALLET_AUTH_FAILED: 'Failed to authenticate with your World App wallet',
  WORLD_ID_VERIFICATION_FAILED: 'World ID verification process failed',
  WORLD_ID_VERIFICATION_ERROR: 'Error during World ID verification',
  API_ERROR: 'Server communication error',
  PROOF_VERIFICATION_FAILED: 'Failed to verify your World ID proof',
  PROOF_VERIFICATION_ERROR: 'Error while verifying your World ID proof',
  NONCE_VERIFICATION_FAILED: 'Security verification failed',
  SERVER_VERIFICATION_FAILED: 'Server verification failed',
  PAYLOAD_VERIFICATION_ERROR: 'Error during authentication verification',
  NONCE_ERROR: 'Failed to establish secure connection',
  WALLET_AUTH_ERROR: 'Error during wallet authentication',
  LOGIN_FAILED: 'Login process failed',
  CONNECTION_ERROR: 'Connection to server failed',
  TIMEOUT_ERROR: 'Request timed out',
  UNKNOWN_ERROR: 'An unknown error occurred',
}
