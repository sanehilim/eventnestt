"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ImageIcon, ImagePlus, Loader2, Upload, X } from "lucide-react"

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

type EventImageUploadProps = {
  disabled?: boolean
  label?: string
  onChange: (url: string) => void
  value?: string
}

type UploadResponse = {
  error?: string
  imageUrl?: string
  storage?: "cloudinary" | "pinata"
}

function readableFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function EventImageUpload({ disabled = false, label = "Event Image", onChange, value }: EventImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [storage, setStorage] = useState<UploadResponse["storage"]>()

  const uploadFile = async (file?: File) => {
    if (!file || disabled || isUploading) {
      return
    }

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.")
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be 8 MB or smaller.")
      return
    }

    const body = new FormData()
    body.set("file", file)
    setError("")
    setIsUploading(true)

    try {
      const response = await fetch("/api/event-image", {
        method: "POST",
        body,
      })
      const result = (await response.json()) as UploadResponse

      if (!response.ok || !result.imageUrl) {
        throw new Error(result.error || "Image upload failed.")
      }

      setStorage(result.storage)
      onChange(result.imageUrl)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.")
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="block text-sm font-medium text-[#1a1a1a]">{label}</span>
        {storage && value && (
          <span className="rounded-full bg-[#0f766e]/10 px-2 py-1 text-xs text-[#0f766e]">
            Stored on {storage === "cloudinary" ? "Cloudinary" : "IPFS"}
          </span>
        )}
      </div>

      <div
        className={`overflow-hidden rounded-xl border border-dashed bg-white transition ${
          isDragging ? "border-[#0f766e] ring-2 ring-[#0f766e]/20" : "border-[#d4d4d4]"
        } ${disabled ? "opacity-60" : ""}`}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) {
            setIsDragging(true)
          }
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          void uploadFile(event.dataTransfer.files[0])
        }}
      >
        {value ? (
          <div className="grid gap-4 p-4 sm:grid-cols-[180px_1fr] sm:items-center">
            <div className="aspect-video overflow-hidden rounded-lg bg-[#f5f5f5]">
              <Image src={value} alt="Event cover preview" width={360} height={203} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="mb-3 truncate text-sm text-[#666666]">{value}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={disabled || isUploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-4 py-3 text-sm font-medium text-white boty-transition hover:bg-[#333] disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Replace Image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStorage(undefined)
                    onChange("")
                  }}
                  disabled={disabled || isUploading}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-sm font-medium text-[#1a1a1a] boty-transition hover:bg-[#f5f5f5] disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || isUploading}
            className="flex w-full flex-col items-center justify-center px-6 py-10 text-center text-[#666666] boty-transition hover:bg-[#f8f8f8] disabled:opacity-50"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0f766e]/10 text-[#0f766e]">
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            </span>
            <span className="font-medium text-[#1a1a1a]">{isUploading ? "Uploading image..." : "Upload event image"}</span>
            <span className="mt-1 text-sm">JPG, PNG, WebP, or GIF up to {readableFileSize(MAX_IMAGE_BYTES)}</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={disabled || isUploading}
          onChange={(event) => void uploadFile(event.target.files?.[0])}
        />
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
          <ImageIcon className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  )
}
