"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Check, DollarSign, Loader2, ScanLine, Shield, Ticket, Trash2 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import {
  useEvent,
  useEventPendingRevenue,
  useEventWhitelist,
  useManageEventAccess,
  useTicketActions,
  type TicketValidation,
} from "@/hooks/use-events"
import { dateInputToEventTimestamp, eventTimestampToDateInput } from "@/lib/onchain"
import { useAccount } from "wagmi"

function parseWallets(value: string) {
  return value
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean) as `0x${string}`[]
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
  const { address, isConnected } = useAccount()
  const { event, loading } = useEvent(eventId)
  const {
    pendingRevenue,
    pendingWei,
    refetch: refetchPendingRevenue,
  } = useEventPendingRevenue(eventId)
  const {
    entries: whitelistEntries,
    loading: whitelistLoading,
    refetch: refetchWhitelist,
  } = useEventWhitelist(eventId)
  const {
    addWhitelist,
    removeWhitelist,
    updateEvent,
    updateInviteCode,
    updateTicketTier,
    updateTierCondition,
    withdrawEventRevenue,
  } = useManageEventAccess()
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
  const [isWithdrawingRevenue, setIsWithdrawingRevenue] = useState(false)
  const [savingTierId, setSavingTierId] = useState<number | null>(null)
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
  const [tierForms, setTierForms] = useState<
    Array<{ id: number; name: string; capacity: number; price: string; transferable: boolean; active: boolean }>
  >([])
  const [tierConditionDrafts, setTierConditionDrafts] = useState<Record<number, string>>({})
  const [savingTierConditionId, setSavingTierConditionId] = useState<number | null>(null)
  const privateEventMissingAccessRule =
    eventForm.isPrivate && !eventForm.requiresInviteCode && !eventForm.requiresWhitelist && !event?.requiresConfidentialAccess
  const isOrganizer =
    Boolean(event?.organizer && address && event.organizer.toLowerCase() === address.toLowerCase())

  const wallets = useMemo(() => parseWallets(walletList), [walletList])

  useEffect(() => {
    if (!event) {
      return
    }

    const timer = window.setTimeout(() => {
        setEventForm({
          name: event.name,
          description: event.description,
          date: eventTimestampToDateInput(event.eventDate),
        location: event.location,
        category: event.category,
        maxAttendees: event.maxAttendees,
        ticketPrice: event.ticketPrice === "Free" ? "" : event.ticketPrice.replace(/\s*ETH$/i, ""),
        isPrivate: event.isPrivate,
        requiresInviteCode: event.requiresInviteCode,
        requiresWhitelist: event.requiresWhitelist,
        image: event.image,
      })
      setTierForms(
        event.tiers.map((tier) => ({
          id: tier.id,
          name: tier.name,
          capacity: tier.capacity,
          price: tier.price === "Free" ? "" : tier.price.replace(/\s*ETH$/i, ""),
          transferable: tier.transferable,
          active: tier.active,
        })),
      )
    }, 0)

    return () => window.clearTimeout(timer)
  }, [event])

  const handleSaveEvent = async () => {
    if (!eventForm.name.trim() || !eventForm.date) {
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
        eventDate: dateInputToEventTimestamp(eventForm.date),
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
      setStatusMessage("Encrypted invite credential updated on-chain.")
    } catch (error) {
      console.error(error)
      setStatusMessage(error instanceof Error ? error.message : "Failed to update invite code.")
    } finally {
      setIsSavingInvite(false)
    }
  }

  const handleSaveTier = async (tierId: number) => {
    const tier = tierForms.find((entry) => entry.id === tierId)
    if (!tier) return

    setSavingTierId(tierId)
    setStatusMessage("")
    try {
      await updateTicketTier(eventId, tier)
      setStatusMessage("Ticket tier updated on-chain.")
    } catch (error) {
      console.error(error)
      setStatusMessage(error instanceof Error ? error.message : "Failed to update ticket tier.")
    } finally {
      setSavingTierId(null)
    }
  }

  const handleSaveTierCondition = async (tierId: number) => {
    const conditionCode = tierConditionDrafts[tierId]?.trim()
    if (!conditionCode) return

    setSavingTierConditionId(tierId)
    setStatusMessage("")
    try {
      await updateTierCondition(eventId, tierId, conditionCode)
      setTierConditionDrafts((current) => ({ ...current, [tierId]: "" }))
      setStatusMessage("Tier-specific encrypted access condition updated on-chain.")
    } catch (error) {
      console.error(error)
      setStatusMessage(error instanceof Error ? error.message : "Failed to update tier access condition.")
    } finally {
      setSavingTierConditionId(null)
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
      await refetchWhitelist()
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
      await refetchWhitelist()
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

  const handleWithdrawRevenue = async () => {
    setIsWithdrawingRevenue(true)
    setStatusMessage("")
    try {
      await withdrawEventRevenue(eventId)
      await refetchPendingRevenue()
      setStatusMessage("Event revenue withdrawn to the organizer wallet.")
    } catch (error) {
      console.error(error)
      setStatusMessage(error instanceof Error ? error.message : "Revenue withdrawal failed.")
    } finally {
      setIsWithdrawingRevenue(false)
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
          ) : !isConnected || !isOrganizer ? (
            <div className="bg-[#f5f5f5] rounded-xl p-10 border border-[#e5e5e5] text-center">
              <h1 className="text-3xl text-[#1a1a1a] mb-2">Organizer Wallet Required</h1>
              <p className="text-[#666666] mb-6">
                Connect the wallet that created this event to edit access rules or check in tickets.
              </p>
              <WalletConnectButton />
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
                  <DollarSign className="w-5 h-5 text-[#0f766e]" />
                  <h2 className="text-2xl text-[#1a1a1a]">Revenue</h2>
                </div>
                <div className="flex flex-col gap-4 rounded-lg border border-[#e5e5e5] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-[#666666]">Available to withdraw</p>
                    <p className="text-3xl font-semibold text-[#1a1a1a]">{pendingRevenue}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleWithdrawRevenue}
                    disabled={isWithdrawingRevenue || pendingWei === 0n}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0f766e] px-6 py-3 text-sm font-medium text-white boty-transition hover:bg-[#0d6b63] disabled:opacity-50"
                  >
                    {isWithdrawingRevenue ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                    Withdraw Revenue
                  </button>
                </div>
              </section>

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
                  <h2 className="text-2xl text-[#1a1a1a]">Ticket Tiers</h2>
                </div>

                <div className="space-y-4">
                  {tierForms.map((tier) => (
                    <div key={tier.id} className="rounded-lg border border-[#e5e5e5] bg-white p-4">
                      <div className="grid gap-4 md:grid-cols-[1fr_120px_140px_130px_auto]">
                        <label className="block">
                          <span className="block text-sm font-medium text-[#1a1a1a] mb-2">Name</span>
                          <input
                            value={tier.name}
                            onChange={(value) =>
                              setTierForms((current) =>
                                current.map((entry) =>
                                  entry.id === tier.id ? { ...entry, name: value.target.value } : entry,
                                ),
                              )
                            }
                            className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-sm font-medium text-[#1a1a1a] mb-2">Capacity</span>
                          <input
                            type="number"
                            min="1"
                            value={tier.capacity}
                            onChange={(value) =>
                              setTierForms((current) =>
                                current.map((entry) =>
                                  entry.id === tier.id ? { ...entry, capacity: Number(value.target.value) || 0 } : entry,
                                ),
                              )
                            }
                            className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-sm font-medium text-[#1a1a1a] mb-2">Price ETH</span>
                          <input
                            value={tier.price}
                            onChange={(value) =>
                              setTierForms((current) =>
                                current.map((entry) =>
                                  entry.id === tier.id ? { ...entry, price: value.target.value } : entry,
                                ),
                              )
                            }
                            placeholder="Free"
                            className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                          />
                        </label>
                        <div className="flex flex-col justify-end gap-3 pb-2 text-sm text-[#1a1a1a]">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={tier.active}
                              onChange={(value) =>
                                setTierForms((current) =>
                                  current.map((entry) =>
                                    entry.id === tier.id ? { ...entry, active: value.target.checked } : entry,
                                  ),
                                )
                              }
                              className="h-4 w-4 accent-[#0f766e]"
                            />
                            Active
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={tier.transferable}
                              onChange={(value) =>
                                setTierForms((current) =>
                                  current.map((entry) =>
                                    entry.id === tier.id ? { ...entry, transferable: value.target.checked } : entry,
                                  ),
                                )
                              }
                              className="h-4 w-4 accent-[#0f766e]"
                            />
                            Transferable
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSaveTier(tier.id)}
                          disabled={savingTierId === tier.id || !tier.name.trim() || tier.capacity < 1}
                          className="inline-flex items-center justify-center gap-2 self-end bg-[#1a1a1a] text-white px-5 py-3 rounded-lg text-sm font-medium boty-transition hover:bg-[#333] disabled:opacity-50"
                        >
                          {savingTierId === tier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          Save
                        </button>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                        <input
                          type="text"
                          value={tierConditionDrafts[tier.id] || ""}
                          onChange={(value) =>
                            setTierConditionDrafts((current) => ({ ...current, [tier.id]: value.target.value }))
                          }
                          placeholder="Optional tier-specific invite code"
                          className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveTierCondition(tier.id)}
                          disabled={savingTierConditionId === tier.id || !tierConditionDrafts[tier.id]?.trim()}
                          className="inline-flex items-center justify-center gap-2 bg-[#0f766e] text-white px-5 py-3 rounded-lg text-sm font-medium boty-transition hover:bg-[#0d6b63] disabled:opacity-50"
                        >
                          {savingTierConditionId === tier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                          Set Tier Code
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-[#f5f5f5] rounded-xl p-8 border border-[#e5e5e5]">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-[#0f766e]" />
                  <h2 className="text-2xl text-[#1a1a1a]">Manage Access</h2>
                </div>

                <div className="grid gap-6">
                  <div>
                      <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                      Confidential Invite Code
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

                  <div className="rounded-lg border border-[#e5e5e5] bg-white p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-[#1a1a1a]">Whitelist Status</h3>
                        <p className="text-sm text-[#666666]">Latest allowlist state reconstructed from on-chain events.</p>
                      </div>
                      <button
                        type="button"
                        onClick={refetchWhitelist}
                        className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-sm text-[#1a1a1a] hover:bg-[#f5f5f5]"
                      >
                        Refresh
                      </button>
                    </div>
                    {whitelistLoading ? (
                      <div className="flex items-center gap-2 text-sm text-[#666666]">
                        <Loader2 className="h-4 w-4 animate-spin text-[#0f766e]" />
                        Loading whitelist...
                      </div>
                    ) : whitelistEntries.length === 0 ? (
                      <p className="text-sm text-[#666666]">No whitelist updates have been recorded for this event yet.</p>
                    ) : (
                      <div className="max-h-64 overflow-y-auto rounded-lg border border-[#e5e5e5]">
                        {whitelistEntries.map((entry) => (
                          <div
                            key={entry.wallet}
                            className="flex flex-col gap-2 border-b border-[#e5e5e5] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <span className="font-mono text-sm text-[#1a1a1a] break-all">{entry.wallet}</span>
                            <span className={`text-sm ${entry.isWhitelisted ? "text-[#0f766e]" : "text-[#ef4444]"}`}>
                              {entry.isWhitelisted ? "Approved" : "Removed"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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
                      <p className="text-[#666666]">
                        Type: <span className="text-[#1a1a1a]">
                          {ticketValidation.event.tiers.find((tier) => tier.id === ticketValidation.ticket.tierId)?.name ||
                            (ticketValidation.ticket.isVIP ? "VIP" : "General")}
                        </span>
                      </p>
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
