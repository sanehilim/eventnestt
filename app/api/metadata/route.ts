import { NextResponse, type NextRequest } from "next/server"
import { normalizeEventImageUrl } from "@/lib/onchain"

export const runtime = "nodejs"

const PINATA_PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
const MAX_METADATA_BYTES = 25_000

type MetadataBody = Record<string, unknown>

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, maxLength) : undefined
}

function cleanMetadata(body: MetadataBody) {
  return {
    app: "EventNest",
    schema: "eventnest.event.metadata.v1",
    name: cleanString(body.name, 120),
    description: cleanString(body.description, 2_000),
    image: normalizeEventImageUrl(cleanString(body.image, 600)),
    location: cleanString(body.location, 180),
    category: cleanString(body.category, 80),
    ticketPrice: cleanString(body.ticketPrice, 80),
    external_url: cleanString(body.external_url, 600),
  }
}

function metadataFileName(name?: string) {
  const slug = (name || "event")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)

  return `${slug || "event"}-metadata.json`
}

function pinataAuthHeaders(): Record<string, string> | null {
  const apiKey = process.env.PINATA_API_KEY
  const apiSecret = process.env.PINATA_API_SECRET
  if (apiKey && apiSecret) {
    return {
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
    }
  }

  const pinataJwt = process.env.PINATA_JWT
  return pinataJwt ? { Authorization: `Bearer ${pinataJwt}` } : null
}

export async function POST(request: NextRequest) {
  const authHeaders = pinataAuthHeaders()
  if (!authHeaders) {
    return NextResponse.json({ error: "Pinata metadata pinning is not configured." }, { status: 503 })
  }

  let body: MetadataBody
  try {
    body = (await request.json()) as MetadataBody
  } catch {
    return NextResponse.json({ error: "Invalid metadata JSON." }, { status: 400 })
  }

  const metadata = cleanMetadata(body)
  if (!metadata.name) {
    return NextResponse.json({ error: "Event name is required." }, { status: 400 })
  }

  const serializedMetadata = JSON.stringify(metadata)
  if (new TextEncoder().encode(serializedMetadata).length > MAX_METADATA_BYTES) {
    return NextResponse.json({ error: "Metadata is too large." }, { status: 413 })
  }

  const pinataResponse = await fetch(PINATA_PIN_JSON_URL, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataOptions: { cidVersion: 1 },
      pinataMetadata: { name: metadataFileName(metadata.name) },
      pinataContent: metadata,
    }),
  })

  if (!pinataResponse.ok) {
    return NextResponse.json({ error: "Pinata metadata upload failed." }, { status: 502 })
  }

  const result = (await pinataResponse.json()) as { IpfsHash?: unknown }
  if (typeof result.IpfsHash !== "string" || !result.IpfsHash) {
    return NextResponse.json({ error: "Pinata did not return an IPFS CID." }, { status: 502 })
  }

  const metadataURI = `ipfs://${result.IpfsHash}`
  const gatewayBase = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs").replace(/\/+$/, "")

  return NextResponse.json({
    cid: result.IpfsHash,
    metadataURI,
    gatewayURL: `${gatewayBase}/${result.IpfsHash}`,
  })
}
