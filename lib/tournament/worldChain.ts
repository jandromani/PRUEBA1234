import {
  createWalletClient,
  http,
  Hex,
  PublicClient,
  encodeFunctionData,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

export interface WorldChainConfig {
  rpcUrl: string
  contractAddress: `0x${string}`
  privateKey: Hex
}

const settleAbi = [
  {
    type: 'function',
    name: 'settleTournament',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tournamentId', type: 'string' },
      { name: 'merkleRoot', type: 'bytes32' },
    ],
    outputs: [],
  },
] as const

export async function buildSettleCallData(
  tournamentId: string,
  merkleRoot: Hex,
): Promise<Hex> {
  return encodeFunctionData({
    abi: settleAbi,
    functionName: 'settleTournament',
    args: [tournamentId, merkleRoot],
  })
}

export async function settleTournamentOnChain(
  client: PublicClient,
  config: WorldChainConfig,
  tournamentId: string,
  merkleRoot: Hex,
): Promise<Hex> {
  const account = privateKeyToAccount(config.privateKey)
  const walletClient = createWalletClient({
    chain: client.chain,
    transport: http(config.rpcUrl),
    account,
  })

  return walletClient.writeContract({
    abi: settleAbi,
    address: config.contractAddress,
    functionName: 'settleTournament',
    args: [tournamentId, merkleRoot],
  })
}
