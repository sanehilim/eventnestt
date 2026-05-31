import { arbitrumSepolia, baseSepolia, mainnet, sepolia, type Chain } from "wagmi/chains"
import { getDeploymentInfo } from "@/lib/deployments"

export const ZERO_HASH =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const

const knownChains: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [sepolia.id]: sepolia,
  [arbitrumSepolia.id]: arbitrumSepolia,
  [baseSepolia.id]: baseSepolia,
}

const defaultRpcUrls: Record<number, string> = {
  [mainnet.id]: "https://ethereum.publicnode.com",
  [sepolia.id]: "https://ethereum-sepolia.publicnode.com",
  [arbitrumSepolia.id]: "https://sepolia-rollup.arbitrum.io/rpc",
  [baseSepolia.id]: "https://sepolia.base.org",
}

export const APP_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? sepolia.id)
const baseChain = knownChains[APP_CHAIN_ID] ?? sepolia
export const APP_DEPLOYMENT = getDeploymentInfo(baseChain.id)

export const APP_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL ||
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
  APP_DEPLOYMENT.rpcUrl ||
  defaultRpcUrls[baseChain.id]

export const APP_CHAIN: Chain = {
  ...baseChain,
  rpcUrls: {
    default: { http: [APP_RPC_URL] },
    public: { http: [APP_RPC_URL] },
  },
}

export type EventMetadata = {
  app?: string
  category?: string
  description?: string
  external_url?: string
  image?: string
  location?: string
  name?: string
  schema?: string
  ticketPrice?: string
}

const MILLISECONDS_TIMESTAMP_THRESHOLD = 1_000_000_000_000

export function eventTimestampToDate(timestamp: bigint) {
  const value = Number(timestamp)
  return new Date(value >= MILLISECONDS_TIMESTAMP_THRESHOLD ? value : value * 1000)
}

export function eventTimestampToDateInput(timestamp?: bigint) {
  if (!timestamp) {
    return ""
  }

  try {
    return eventTimestampToDate(timestamp).toISOString().slice(0, 10)
  } catch {
    return ""
  }
}

export function dateInputToEventTimestamp(value: string) {
  const timestamp = Date.parse(`${value}T12:00:00Z`)
  if (Number.isNaN(timestamp)) {
    throw new Error("Enter a valid event date")
  }

  return BigInt(Math.floor(timestamp / 1000))
}

export function formatEventDate(timestamp: bigint, options: Intl.DateTimeFormatOptions) {
  try {
    return eventTimestampToDate(timestamp).toLocaleDateString("en-US", {
      timeZone: "UTC",
      ...options,
    })
  } catch {
    return "Date TBA"
  }
}

export const IPFS_GATEWAY_URL = (
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs"
).replace(/\/+$/, "")

function base64EncodeUtf8(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ""

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(index, index + 0x8000))
  }

  return btoa(binary)
}

function base64DecodeUtf8(value: string) {
  const binary = atob(value)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function parseMetadataJson(value: string): EventMetadata {
  const parsed = JSON.parse(value)
  return parsed && typeof parsed === "object" ? (parsed as EventMetadata) : {}
}

export function ipfsToGatewayUrl(value?: string) {
  if (!value) {
    return ""
  }

  if (!value.startsWith("ipfs://")) {
    return value
  }

  const path = value.slice("ipfs://".length).replace(/^ipfs\//, "")
  return `${IPFS_GATEWAY_URL}/${path}`
}

export function encodeEventMetadata(metadata: EventMetadata) {
  return `data:application/json;base64,${base64EncodeUtf8(JSON.stringify(metadata))}`
}

export function decodeEventMetadata(metadataURI: string): EventMetadata {
  if (!metadataURI) {
    return {}
  }

  try {
    if (metadataURI.startsWith("data:application/json;base64,")) {
      return parseMetadataJson(base64DecodeUtf8(metadataURI.slice("data:application/json;base64,".length)))
    }

    if (metadataURI.startsWith("data:application/json,")) {
      return parseMetadataJson(decodeURIComponent(metadataURI.slice("data:application/json,".length)))
    }

    return parseMetadataJson(metadataURI)
  } catch {
    return {}
  }
}

export async function resolveEventMetadata(metadataURI: string): Promise<EventMetadata> {
  const inlineMetadata = decodeEventMetadata(metadataURI)
  if (Object.keys(inlineMetadata).length > 0) {
    return inlineMetadata
  }

  const metadataUrl = ipfsToGatewayUrl(metadataURI)
  if (!metadataUrl || metadataUrl === metadataURI && !/^https?:\/\//i.test(metadataURI)) {
    return {}
  }

  try {
    const response = await fetch(metadataUrl, { cache: "force-cache" })
    if (!response.ok) {
      return {}
    }

    const parsed = (await response.json()) as unknown
    return parsed && typeof parsed === "object" ? (parsed as EventMetadata) : {}
  } catch {
    return {}
  }
}

export async function buildEventMetadataURI(metadata: EventMetadata) {
  const normalizedMetadata = {
    app: "EventNest",
    schema: "eventnest.event.metadata.v1",
    ...metadata,
  } satisfies EventMetadata

  try {
    const response = await fetch("/api/metadata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizedMetadata),
    })

    if (response.ok) {
      const result = (await response.json()) as { metadataURI?: unknown }
      if (typeof result.metadataURI === "string" && result.metadataURI) {
        return result.metadataURI
      }
    }
  } catch {
    // Fall back to a standards-compliant on-chain data URI if Pinata is unavailable.
  }

  return encodeEventMetadata(normalizedMetadata)
}
