import { keccak256, stringToHex } from "viem"
import { arbitrumSepolia, mainnet, sepolia, type Chain } from "wagmi/chains"

export const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const

const knownChains: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [sepolia.id]: sepolia,
  [arbitrumSepolia.id]: arbitrumSepolia,
}

const defaultRpcUrls: Record<number, string> = {
  [mainnet.id]: "https://ethereum.publicnode.com",
  [sepolia.id]: "https://ethereum-sepolia.publicnode.com",
  [arbitrumSepolia.id]: "https://sepolia-rollup.arbitrum.io/rpc",
}

export const APP_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? sepolia.id)
const baseChain = knownChains[APP_CHAIN_ID] ?? sepolia

export const APP_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
  defaultRpcUrls[baseChain.id]

export const APP_CHAIN: Chain = {
  ...baseChain,
  rpcUrls: {
    default: { http: [APP_RPC_URL] },
    public: { http: [APP_RPC_URL] },
  },
}

export type EventMetadata = {
  category?: string
  image?: string
  location?: string
  ticketPrice?: string
}

export function encodeEventMetadata(metadata: EventMetadata) {
  return JSON.stringify(metadata)
}

export function decodeEventMetadata(metadataURI: string): EventMetadata {
  if (!metadataURI) {
    return {}
  }

  try {
    const parsed = JSON.parse(metadataURI)
    return parsed && typeof parsed === "object" ? (parsed as EventMetadata) : {}
  } catch {
    return {}
  }
}

export function hashSecret(secret: string) {
  return keccak256(stringToHex(secret.trim()))
}
