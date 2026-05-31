import { createHash } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"

export const runtime = "nodejs"

const CLOUDINARY_UPLOAD_FOLDER = "eventnest/events"
const CLOUDINARY_UPLOAD_TAGS = "eventnest,event-image"
const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const PINATA_PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

type CloudinaryResult = {
  asset_id?: unknown
  bytes?: unknown
  format?: unknown
  height?: unknown
  public_id?: unknown
  secure_url?: unknown
  width?: unknown
}

type PinataFileResult = {
  IpfsHash?: unknown
}

function cloudNameFromFallbackUrl() {
  const fallback = process.env.NEXT_PUBLIC_EVENT_IMAGE_FALLBACK || ""
  const match = fallback.match(/res\.cloudinary\.com\/([^/]+)/i)
  return match?.[1]
}

function cloudinaryCloudName() {
  return process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || cloudNameFromFallbackUrl()
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

function signCloudinaryParams(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex")
}

function assertUploadableImage(file: File) {
  if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, or GIF image.")
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 8 MB or smaller.")
  }
}

async function uploadToCloudinary(file: File) {
  const cloudName = cloudinaryCloudName()
  if (!cloudName) {
    return null
  }

  const uploadURL = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const body = new FormData()
  body.set("file", file)

  if (apiKey && apiSecret) {
    const timestamp = Math.floor(Date.now() / 1000)
    const signedParams = {
      folder: CLOUDINARY_UPLOAD_FOLDER,
      tags: CLOUDINARY_UPLOAD_TAGS,
      timestamp,
    }
    body.set("api_key", apiKey)
    body.set("folder", signedParams.folder)
    body.set("tags", signedParams.tags)
    body.set("timestamp", String(timestamp))
    body.set("signature", signCloudinaryParams(signedParams, apiSecret))
  } else if (uploadPreset) {
    body.set("upload_preset", uploadPreset)
  } else {
    return null
  }

  const response = await fetch(uploadURL, { method: "POST", body })
  if (!response.ok) {
    throw new Error("Cloudinary image upload failed.")
  }

  const result = (await response.json()) as CloudinaryResult
  if (typeof result.secure_url !== "string" || !result.secure_url) {
    throw new Error("Cloudinary did not return an image URL.")
  }

  return {
    assetId: typeof result.asset_id === "string" ? result.asset_id : undefined,
    bytes: typeof result.bytes === "number" ? result.bytes : file.size,
    format: typeof result.format === "string" ? result.format : undefined,
    height: typeof result.height === "number" ? result.height : undefined,
    imageUrl: result.secure_url,
    publicId: typeof result.public_id === "string" ? result.public_id : undefined,
    storage: "cloudinary",
    width: typeof result.width === "number" ? result.width : undefined,
  }
}

async function uploadToPinata(file: File) {
  const authHeaders = pinataAuthHeaders()
  if (!authHeaders) {
    return null
  }

  const body = new FormData()
  body.set("file", file, file.name || "event-image")
  body.set(
    "pinataMetadata",
    JSON.stringify({
      name: file.name || "event-image",
      keyvalues: {
        app: "EventNest",
        type: "event-image",
      },
    }),
  )
  body.set("pinataOptions", JSON.stringify({ cidVersion: 1 }))

  const response = await fetch(PINATA_PIN_FILE_URL, {
    method: "POST",
    headers: authHeaders,
    body,
  })
  if (!response.ok) {
    throw new Error("Pinata image upload failed.")
  }

  const result = (await response.json()) as PinataFileResult
  if (typeof result.IpfsHash !== "string" || !result.IpfsHash) {
    throw new Error("Pinata did not return an IPFS CID.")
  }

  const gatewayBase = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs").replace(/\/+$/, "")

  return {
    bytes: file.size,
    imageUrl: `${gatewayBase}/${result.IpfsHash}`,
    metadataURI: `ipfs://${result.IpfsHash}`,
    storage: "pinata",
  }
}

export async function POST(request: NextRequest) {
  let body: FormData
  try {
    body = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid image upload payload." }, { status: 400 })
  }

  const file = body.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 })
  }

  try {
    assertUploadableImage(file)

    const cloudinaryUpload = await uploadToCloudinary(file)
    if (cloudinaryUpload) {
      return NextResponse.json(cloudinaryUpload)
    }

    const pinataUpload = await uploadToPinata(file)
    if (pinataUpload) {
      return NextResponse.json(pinataUpload)
    }

    return NextResponse.json(
      { error: "Image uploads are not configured. Add Cloudinary or Pinata server credentials." },
      { status: 503 },
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image upload failed." },
      { status: 502 },
    )
  }
}
