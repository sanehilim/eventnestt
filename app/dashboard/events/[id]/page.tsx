"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Check, Loader2, ScanLine, Shield, Ticket, Trash2 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useEvent, useManageEventAccess, useTicketActions, type TicketValidation } from "@/hooks/use-events"

function parseWallets(value: string) {
  return value
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean) as `0x${string}`[]
}

function toDateInput(timestamp?: bigint) {
  if (!timestamp) {
    return ""
  }

  try {
    return new Date(Number(timestamp)).toISOString().slice(0, 10)
  } catch {
    return ""
  }
}

function readTicketIdFromQrPayload(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ""
  }

  try {
    const parsed = JSON.parse(trimmed) as { ticketId?: unknown }
    if (typeof parsed.ticketId === "number" && Number.isInteger(parsed.ticketId) && parsed.ticketId >= 0) {
      return String(parsed.ticketId)
    }
  } catch {
    // Fall through to plain numeric payload support.
  }

  return /^\d+$/.test(trimmed) ? trimmed : ""
}

export default function ManageEventAccessPage() {
  const params = useParams()
  const eventId = Number(params.id)
  const { event, loading } = useEvent(eventId)
  const { addWhitelist, removeWhitelist, updateEvent, updateInviteCode } = useManageEventAccess()
  const { checkInTicket, readTicket } = useTicketActions()

  const [inviteCode, setInviteCode] = useState("")
  const [walletList, setWalletList] = useState("")
  const [removeWallet, setRemoveWallet] = useState("")
  const [ticketId, setTicketId] = useState("")
  const [qrPayload, setQrPayload] = useState("")
  const [ticketValidation, setTicketValidation] = useState<TicketValidation | null>(null)
  const [isSavingInvite, setIsSavingInvite] = useState(false)
  const [isSavingWhitelist, setIsSavingWhitelist] = useState(false)
  const [isRemovingWhitelist, setIsRemovingWhitelist] = useState(false)
  const [isSavingEvent, setIsSavingEvent] = useState(false)
  const [isCheckingTicket, setIsCheckingTicket] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [eventForm, setEventForm] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    category: "conference",
    maxAttendees: 100,
    ticketPrice: "",
    isPrivate: true,
    requiresInviteCode: true,
    requiresWhitelist: false,
    image: "",
  })
  const privateEventMissingAccessRule =
    eventForm.isPrivate && !eventForm.requiresInviteCode && !eventForm.requiresWhitelist

  const wallets = useMemo(() => parseWallets(walletList), [walletList])

  useEffect(() => {
    if (!event) {
      return
    }

    const timer = window.setTimeout(() => {
      setEventForm({
        name: event.name,
        description: event.description,
        date: toDateInput(event.eventDate),
        location: event.location,
        category: event.category,
        maxAttendees: event.maxAttendees,
        ticketPrice: event.ticketPrice === "Free" ? "" : event.ticketPrice.replace(/\s*ETH$/i, ""),
        isPrivate: event.isPrivate,
        requiresInviteCode: event.requiresInviteCode,
        requiresWhitelist: event.requiresWhitelist,
        image: event.image,
      })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [event])

  const handleSaveEvent = async () => {
    const eventTimestamp = new Date(eventForm.date).getTime()
    if (!eventForm.name.trim() || !eventForm.date || Number.isNaN(eventTimestamp)) {
      setStatusMessage("Event name and date are required.")
      return
    }
    if (privateEventMissingAccessRule) {
      setStatusMessage("Private events must require an invite code or whitelist.")
      return
    }

    setIsSavingEvent(true)
    setStatusMessage("")
    try {
      await updateEvent(eventId, {
        name: eventForm.name,
        description: eventForm.description,
        eventDate: BigInt(eventTimestamp),
        maxAttendees: eventForm.maxAttendees,
        isPrivate: eventForm.isPrivate,
        requiresInviteCode: eventForm.requiresInviteCode,
        requiresWhitelist: eventForm.requiresWhitelist,
        ticketPrice: eventForm.ticketPrice ? `${eventForm.ticketPrice} ETH` : "Free",
        location: eventForm.location,
        category: eventForm.category,
        image: eventForm.image,
      })
      setStatusMessage("Event details updated on-chain.")
    } catch (error) {
      console.error(error)
      setStatusMessage(error instanceof Error ? error.message : "Failed to update event.")
    } finally {
      setIsSavingEvent(false)
    }
  }

  const handleSaveInvite = async () => {
    if (!inviteCode.trim()) return
    setIsSavingInvite(true)
    setStatusMessage("")
    try {
      await updateInviteCode(eventId, inviteCode)
      setInviteCode("")
      setStatusMessage("Invite code updated on-chain.")
    } catch (error) {
      console.error(error)
      setStatusMessage(error instanceof Error ? error.message : "Failed to update invite code.")
    } finally {
      setIsSavingInvite(false)
    }
  }

  const handleAddWhitelist = async () => {
    if (wallets.length === 0) return
    setIsSavingWhitelist(true)
    setStatusMessage("")
    try {
      await addWhitelist(eventId, wallets)
      setStatusMessage("Whitelist updated on-chain.")
      setWalletList("")
    } catch (error) {
      console.error(error)
      setStatusMessage(error instanceof Error ? error.message : "Failed to update whitelist.")
    } finally {
      setIsSavingWhitelist(false)
    }
  }

  const handleRemoveWhitelist = async () => {
    if (!removeWallet.trim()) return
    setIsRemovingWhitelist(true)
    setStatusMessage("")
    try {
      await removeWhitelist(eventId, removeWallet.trim() as `0x${string}`)
      setRemoveWallet("")
      setStatusMessage("Wallet removed from whitelist.")
    } catch (error) {
      console.error(error)
      setStatusMessage(error instanceof Error ? error.message : "Failed to remove wallet.")
    } finally {
      setIsRemovingWhitelist(false)
    }
  }

  const handleLookupTicket = async () => {
    const numericTicketId = Number(ticketId)
    if (!Number.isInteger(numericTicketId) || numericTicketId < 0) {
      setStatusMessage("Enter a valid ticket ID.")
      return
    }

    setIsCheckingTicket(true)
    setStatusMessage("")
    try {
      const result = await readTicket(numericTicketId)
      setTicketValidation(result)
      setStatusMessage(result.event.id === eventId ? "Ticket loaded for this event." : "Ticket belongs to another event.")
    } catch (error) {
      console.error(error)
      setTicketValidation(null)
      setStatusMessage(error instanceof Error ? error.message : "Ticket lookup failed.")
    } finally {
      setIsCheckingTicket(false)
    }
  }

  const handleQrPayload = (value: string) => {
    setQrPayload(value)
    const parsedTicketId = readTicketIdFromQrPayload(value)
    if (parsedTicketId) {
      setTicketId(parsedTicketId)
      setStatusMessage("QR payload parsed. Review and lookup the ticket.")
    }
  }

  const handleCheckInTicket = async () => {
    if (!ticketValidation || ticketValidation.event.id !== eventId) {
      setStatusMessage("Load a valid ticket for this event first.")
      return
    }

    setIsCheckingTicket(true)
    setStatusMessage("")
    try {
      await checkInTicket(ticketValidation.ticket.id)
      const updated = await readTicket(ticketValidation.ticket.id)
      setTicketValidation(updated)
      setStatusMessage("Ticket checked in on-chain.")
    } catch (error) {
      console.error(error)
      setStatusMessage(error instanceof Error ? error.message : "Ticket check-in failed.")
    } finally {
      setIsCheckingTicket(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-2 text-[#666666] hover:text-[#1a1a1a] boty-transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Events
          </Link>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin" />
            </div>
          ) : !event ? (
            <div className="bg-[#f5f5f5] rounded-xl p-10 border border-[#e5e5e5] text-center">
              <h1 className="text-3xl text-[#1a1a1a] mb-2">Event Not Found</h1>
              <p className="text-[#666666]">This event could not be loaded from the contract.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#f5f5f5] rounded-xl p-8 border border-[#e5e5e5]">
                <p className="text-sm text-[#0f766e] mb-2">Event #{event.id}</p>
                <h1 className="text-4xl text-[#1a1a1a] mb-2">{event.name}</h1>
                <p className="text-[#666666]">{event.description}</p>
              </div>

              <section className="bg-[#f5f5f5] rounded-xl p-8 border border-[#e5e5e5]">
                <div className="flex items-center gap-2 mb-6">
                  <Ticket className="w-5 h-5 text-[#0f766e]" />
                  <h2 className="text-2xl text-[#1a1a1a]">Edit Event Details</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="block text-sm font-medium text-[#1a1a1a] mb-2">Name</span>
                    <input
                      value={eventForm.name}
                      onChange={(value) => setEventForm((current) => ({ ...current, name: value.target.value }))}
                      className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-[#1a1a1a] mb-2">Date</span>
                    <input
                      type="date"
                      value={eventForm.date}
                      onChange={(value) => setEventForm((current) => ({ ...current, date: value.target.value }))}
                      className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-[#1a1a1a] mb-2">Location</span>
                    <input
                      value={eventForm.location}
                      onChange={(value) => setEventForm((current) => ({ ...current, location: value.target.value }))}
                      className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-[#1a1a1a] mb-2">Category</span>
                    <select
                      value={eventForm.category}
                      onChange={(value) => setEventForm((current) => ({ ...current, category: value.target.value }))}
                      className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                    >
                      <option value="hackathon">Hackathon</option>
                      <option value="conference">Conference</option>
                      <option value="workshop">Workshop</option>
                      <option value="vip">VIP</option>
                      <option value="meetup">Meetup</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-[#1a1a1a] mb-2">Max Attendees</span>
                    <input
                      type="number"
                      min={event.totalTicketsSold}
                      value={eventForm.maxAttendees}
                      onChange={(value) =>
                        setEventForm((current) => ({ ...current, maxAttendees: Number(value.target.value) || 0 }))
                      }
                      className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-[#1a1a1a] mb-2">Ticket Price</span>
                    <input
                      value={eventForm.ticketPrice}
                      onChange={(value) => setEventForm((current) => ({ ...current, ticketPrice: value.target.value }))}
                      placeholder="Free or 0.05"
                      className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="block text-sm font-medium text-[#1a1a1a] mb-2">Image URL</span>
                    <input
                      type="url"
                      value={eventForm.image}
                      onChange={(value) => setEventForm((current) => ({ ...current, image: value.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="block text-sm font-medium text-[#1a1a1a] mb-2">Description</span>
                    <textarea
                      value={eventForm.description}
                      onChange={(value) => setEventForm((current) => ({ ...current, description: value.target.value }))}
                      rows={4}
                      className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 resize-none"
                    />
                  </label>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Private event", "isPrivate"],
                    ["Require invite code", "requiresInviteCode"],
                    ["Whitelist only", "requiresWhitelist"],
                  ].map(([label, key]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setEventForm((current) => ({
                          ...current,
                          [key]: !current[key as keyof typeof eventForm],
                        }))
                      }
                      className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                        eventForm[key as keyof typeof eventForm]
                          ? "border-[#0f766e] bg-[#0f766e] text-white"
                          : "border-[#e5e5e5] bg-white text-[#666666]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {privateEventMissingAccessRule && (
                  <p className="mt-4 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm text-[#92400e]">
                    Private events must keep at least one enforced access rule enabled.
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSaveEvent}
                  disabled={isSavingEvent || eventForm.maxAttendees < event.totalTicketsSold || privateEventMissingAccessRule}
                  className="mt-6 inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-lg text-sm font-medium boty-transition hover:bg-[#333] disabled:opacity-50"
                >
                  {isSavingEvent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Save Event Updates
                </button>
              </section>

              <section className="bg-[#f5f5f5] rounded-xl p-8 border border-[#e5e5e5]">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-[#0f766e]" />
                  <h2 className="text-2xl text-[#1a1a1a]">Manage Access</h2>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                      Invite Code
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(eventValue) => setInviteCode(eventValue.target.value)}
                        placeholder="Set or rotate the invite code"
                        className="flex-1 bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                      />
                      <button
                        type="button"
                        onClick={handleSaveInvite}
                        disabled={isSavingInvite || !inviteCode.trim()}
                        className="bg-[#0f766e] text-white px-6 py-3 rounded-lg text-sm font-medium boty-transition hover:bg-[#0d6b63] disabled:opacity-50"
                      >
                        {isSavingInvite ? "Saving..." : "Save Invite Code"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                        Add Whitelist Wallets
                      </label>
                      <textarea
                        value={walletList}
                        onChange={(eventValue) => setWalletList(eventValue.target.value)}
                        placeholder="Paste one wallet per line or separate addresses with commas"
                        rows={5}
                        className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 resize-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddWhitelist}
                        disabled={isSavingWhitelist || wallets.length === 0}
                        className="mt-3 bg-[#1a1a1a] text-white px-6 py-3 rounded-lg text-sm font-medium boty-transition hover:bg-[#333] disabled:opacity-50"
                      >
                        {isSavingWhitelist ? "Saving..." : "Add To Whitelist"}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                        Remove Whitelist Wallet
                      </label>
                      <input
                        type="text"
                        value={removeWallet}
                        onChange={(eventValue) => setRemoveWallet(eventValue.target.value)}
                        placeholder="0x wallet to remove"
                        className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveWhitelist}
                        disabled={isRemovingWhitelist || !removeWallet.trim()}
                        className="mt-3 inline-flex items-center gap-2 bg-white text-[#1a1a1a] border border-[#e5e5e5] px-6 py-3 rounded-lg text-sm font-medium boty-transition hover:bg-[#eeeeee] disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {isRemovingWhitelist ? "Removing..." : "Remove Wallet"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-[#f5f5f5] rounded-xl p-8 border border-[#e5e5e5]">
                <div className="flex items-center gap-2 mb-6">
                  <ScanLine className="w-5 h-5 text-[#0f766e]" />
                  <h2 className="text-2xl text-[#1a1a1a]">Validate Entry</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
                  <input
                    type="number"
                    min="0"
                    value={ticketId}
                    onChange={(eventValue) => setTicketId(eventValue.target.value)}
                    placeholder="Ticket ID from attendee QR"
                    className="bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                  />
                  <button
                    type="button"
                    onClick={handleLookupTicket}
                    disabled={isCheckingTicket || !ticketId}
                    className="inline-flex items-center justify-center gap-2 bg-white text-[#1a1a1a] border border-[#e5e5e5] px-6 py-3 rounded-lg text-sm font-medium boty-transition hover:bg-[#eeeeee] disabled:opacity-50"
                  >
                    {isCheckingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
                    Lookup
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckInTicket}
                    disabled={isCheckingTicket || !ticketValidation || ticketValidation.event.id !== eventId || ticketValidation.ticket.used}
                    className="inline-flex items-center justify-center gap-2 bg-[#0f766e] text-white px-6 py-3 rounded-lg text-sm font-medium boty-transition hover:bg-[#0d6b63] disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Check In
                  </button>
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 block text-sm font-medium text-[#1a1a1a]">QR Payload</span>
                  <textarea
                    value={qrPayload}
                    onChange={(eventValue) => handleQrPayload(eventValue.target.value)}
                    placeholder='Paste the attendee QR payload, for example {"ticketId": 12}'
                    rows={3}
                    className="w-full resize-none rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                  />
                </label>

                {ticketValidation && (
                  <div className="mt-5 rounded-lg bg-white border border-[#e5e5e5] p-4 text-sm">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <p className="text-[#666666]">Event: <span className="text-[#1a1a1a]">{ticketValidation.event.name}</span></p>
                      <p className="text-[#666666]">Holder: <span className="font-mono text-[#1a1a1a]">{ticketValidation.ticket.holder.slice(0, 6)}...{ticketValidation.ticket.holder.slice(-4)}</span></p>
                      <p className="text-[#666666]">Status: <span className={ticketValidation.ticket.used ? "text-[#ef4444]" : "text-[#10b981]"}>{ticketValidation.ticket.used ? "Already used" : "Valid"}</span></p>
                      <p className="text-[#666666]">Type: <span className="text-[#1a1a1a]">{ticketValidation.ticket.isVIP ? "VIP" : "General"}</span></p>
                    </div>
                  </div>
                )}
              </section>

              {statusMessage && (
                <div className="bg-white rounded-lg p-4 border border-[#e5e5e5] flex items-center gap-2 text-sm text-[#1a1a1a]">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  {statusMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
