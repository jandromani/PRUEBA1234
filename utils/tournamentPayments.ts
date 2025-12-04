export type Currency = 'WLD' | 'USDC'

export type JoinStatus = 'pending_payment' | 'paid' | 'refunded'

export type GatewayStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'unknown'

export interface TournamentPot {
  tournamentId: string
  total: number
  currency: Currency
}

export interface PlayerTournament {
  tournamentId: string
  worldId: string
  walletAddress: string
  joinStatus: JoinStatus
  amount: number
  currency: Currency
  destination: string
  transactionId?: string
  transactionHash?: string
  auditLog: string[]
}

export interface TransactionVerification {
  transactionId: string
  status: GatewayStatus
  amount: number
  currency: Currency
  destination: string
  hash?: string
}

const playerTournamentIndex = new Map<string, PlayerTournament>()
const tournamentPots = new Map<string, TournamentPot>()

const buildPlayerKey = (tournamentId: string, worldId: string) =>
  `${tournamentId}:${worldId}`

const now = () => new Date().toISOString()

export const getPot = (tournamentId: string) => tournamentPots.get(tournamentId)

export const setPendingJoin = (
  tournamentId: string,
  worldId: string,
  walletAddress: string,
  amount: number,
  currency: Currency,
  destination: string,
) => {
  const key = buildPlayerKey(tournamentId, worldId)
  const existing = playerTournamentIndex.get(key)

  if (existing && existing.joinStatus !== 'refunded') {
    throw new Error('Player already joined or payment in progress')
  }

  const record: PlayerTournament = {
    tournamentId,
    worldId,
    walletAddress,
    amount,
    currency,
    destination,
    joinStatus: 'pending_payment',
    auditLog: [`${now()} - join initialized`],
  }

  playerTournamentIndex.set(key, record)
  return record
}

const applyPotDelta = (tournamentId: string, amount: number, currency: Currency) => {
  const existing = tournamentPots.get(tournamentId)

  if (!existing) {
    tournamentPots.set(tournamentId, {
      tournamentId,
      currency,
      total: amount,
    })
    return
  }

  if (existing.currency !== currency) {
    throw new Error('Currency mismatch for tournament pot')
  }

  existing.total = Math.max(0, existing.total + amount)
}

const gatewayToJoinStatus = (status: GatewayStatus): JoinStatus => {
  switch (status) {
    case 'completed':
    case 'succeeded':
      return 'paid'
    case 'refunded':
      return 'refunded'
    default:
      return 'pending_payment'
  }
}

export const reconcileTransaction = (
  verification: TransactionVerification,
  tournamentId: string,
  worldId: string,
  walletAddress: string,
) => {
  const key = buildPlayerKey(tournamentId, worldId)
  const record = playerTournamentIndex.get(key)

  if (!record) {
    throw new Error('Join not found for player')
  }

  if (record.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error('Wallet mismatch for player')
  }

  if (record.destination.toLowerCase() !== verification.destination.toLowerCase()) {
    throw new Error('Destination address mismatch')
  }

  if (record.currency !== verification.currency) {
    throw new Error('Currency mismatch between request and transaction')
  }

  if (record.amount !== verification.amount) {
    throw new Error('Paid amount does not match requested amount')
  }

  const joinStatus = gatewayToJoinStatus(verification.status)

  const previousStatus = record.joinStatus
  record.joinStatus = joinStatus
  record.transactionId = verification.transactionId
  record.transactionHash = verification.hash ?? record.transactionHash
  record.auditLog.push(
    `${now()} - status updated from ${previousStatus} to ${joinStatus} (tx: ${verification.transactionId})`,
  )

  if (joinStatus === 'paid' && previousStatus !== 'paid') {
    applyPotDelta(tournamentId, record.amount, record.currency)
  }

  if (joinStatus === 'refunded' && previousStatus === 'paid') {
    applyPotDelta(tournamentId, -record.amount, record.currency)
  }

  return record
}

export const mapGatewayPayload = (
  payload: Record<string, unknown>,
  transactionId: string,
): TransactionVerification => {
  const status = (payload['status'] as GatewayStatus | undefined) ?? 'unknown'
  const amount = Number(payload['amount'] ?? payload['value'] ?? 0)
  const currencyValue = String(payload['currency'] ?? payload['token'] ?? '')
  const currency = ['WLD', 'USDC'].includes(currencyValue)
    ? (currencyValue as Currency)
    : undefined
  const destination = String(payload['destination'] ?? payload['receiver'] ?? '')
  const hash = (payload['hash'] ?? payload['tx_hash'] ?? payload['txHash']) as string | undefined

  if (!amount || !currency || !destination) {
    throw new Error('Incomplete transaction payload from gateway')
  }

  return {
    transactionId,
    status,
    amount,
    currency,
    destination,
    hash,
  }
}

export const fetchTransactionFromGateway = async (
  transactionId: string,
  signal?: AbortSignal,
) => {
  const baseUrl =
    process.env.WORLD_APP_API_BASE ?? 'https://developer.worldcoin.org/mini-app/transactions'
  const apiKey = process.env.WORLD_APP_API_KEY

  const response = await fetch(`${baseUrl}/${transactionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`Gateway responded with status ${response.status}`)
  }

  const payload = (await response.json()) as Record<string, unknown>
  return mapGatewayPayload(payload, transactionId)
}
