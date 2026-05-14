"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { CONTRACT_ADDRESS, useEvents, useMyTickets, useTicketActions } from "@/hooks/use-events"
import { Ticket, Calendar, MapPin, ArrowRight, Star, Lock, Loader2, Send, ShieldCheck } from "lucide-react"
import { useAccount } from "wagmi"
import { QRCodeSVG } from "qrcode.react"

function formatDate(timestamp: bigint): string {
  try {
    const date = new Date(Number(timestamp))
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  } catch {
    return "Date TBA"
  }
}

export default function TicketsPage() {
  const { isConnected } = useAccount()
  const { tickets, loading, refetch } = useMyTickets()
  const { events } = useEvents()
  const { transferTicket } = useTicketActions()
  const [transferDrafts, setTransferDrafts] = useState<Record<number, string>>({})
  const [busyTicketId, setBusyTicketId] = useState<number | null>(null)
  const [actionMessage, setActionMessage] = useState<Record<number, string>>({})

  const handleTransfer = async (ticketId: number) => {
    const recipient = transferDrafts[ticketId]?.trim() as `0x${string}` | undefined
    if (!recipient) {
      setActionMessage((current) => ({ ...current, [ticketId]: "Enter a recipient wallet." }))
      return
    }

    setBusyTicketId(ticketId)
    setActionMessage((current) => ({ ...current, [ticketId]: "" }))
    try {
      await transferTicket(ticketId, recipient)
      setTransferDrafts((current) => ({ ...current, [ticketId]: "" }))
      setActionMessage((current) => ({ ...current, [ticketId]: "Ticket transferred on-chain." }))
      await refetch()
    } catch (error) {
      setActionMessage((current) => ({
        ...current,
        [ticketId]: error instanceof Error ? error.message : "Transfer failed.",
      }))
    } finally {
      setBusyTicketId(null)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl text-[#1a1a1a] mb-2">My Tickets</h1>
              <p className="text-[#666666]">Your NFT tickets stored in your wallet</p>
            </div>
            <Link
              href="/events"
              className="bg-[#0f766e] text-white px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-[#0d6b63]"
            >
              Browse Events
            </Link>
          </div>

          {!isConnected ? (
            <div className="bg-[#f5f5f5] rounded-xl p-12 border border-[#e5e5e5] text-center">
              <Ticket className="w-16 h-16 text-[#666666] mx-auto mb-4" />
              <h2 className="text-2xl text-[#1a1a1a] mb-2">Connect Your Wallet</h2>
              <p className="text-[#666666] mb-6">Connect your wallet to see your tickets</p>
              <WalletConnectButton />
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-[#f5f5f5] rounded-xl p-12 border border-[#e5e5e5] text-center">
              <Ticket className="w-16 h-16 text-[#666666] mx-auto mb-4" />
              <h2 className="text-2xl text-[#1a1a1a] mb-2">No Tickets Yet</h2>
              <p className="text-[#666666] mb-6">You haven&apos;t registered for any events yet.</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 bg-[#0f766e] text-white px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-[#0d6b63]"
              >
                Browse Events
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {tickets.map((ticket) => {
                const event = events.find(e => e.id === ticket.eventId)
                const qrPayload = JSON.stringify({
                  app: "EventNest",
                  contract: CONTRACT_ADDRESS,
                  eventId: ticket.eventId,
                  ticketId: ticket.id,
                  holder: ticket.holder,
                })
                return (
                  <div
                    key={ticket.id}
                    className="bg-[#f5f5f5] rounded-xl border border-[#e5e5e5] overflow-hidden boty-shadow"
                  >
                    <div className="grid gap-6 p-6 lg:grid-cols-[180px_1fr]">
                      <div className="rounded-lg bg-white border border-[#e5e5e5] p-4 flex flex-col items-center justify-center">
                        <QRCodeSVG value={qrPayload} size={132} marginSize={2} />
                        <span className="mt-3 inline-flex items-center gap-1 text-xs text-[#666666]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#0f766e]" />
                          Entry QR
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl text-[#1a1a1a] font-medium">
                            {event?.name || `Event #${ticket.eventId}`}
                          </h3>
                          {ticket.isVIP && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#f59e0b]/10 text-[#f59e0b]">
                              <Star className="w-3 h-3" />
                              VIP
                            </span>
                          )}
                          {ticket.used && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#666666]/10 text-[#666666]">
                              <Lock className="w-3 h-3" />
                              Used
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[#666666]">
                          {event && (
                            <>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(event.eventDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
                          <div className="min-w-0">
                            <label className="block text-xs font-medium text-[#666666] mb-2">
                              Transfer ticket
                            </label>
                            <input
                              type="text"
                              value={transferDrafts[ticket.id] || ""}
                              onChange={(eventValue) =>
                                setTransferDrafts((current) => ({
                                  ...current,
                                  [ticket.id]: eventValue.target.value,
                                }))
                              }
                              placeholder="0x recipient wallet"
                              disabled={ticket.used || busyTicketId === ticket.id}
                              className="w-full bg-white border border-[#e5e5e5] rounded-lg px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 disabled:opacity-60"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleTransfer(ticket.id)}
                            disabled={ticket.used || busyTicketId === ticket.id}
                            className="inline-flex items-center justify-center gap-2 self-end bg-[#1a1a1a] text-white px-5 py-3 rounded-lg text-sm font-medium boty-transition hover:bg-[#333] disabled:opacity-50"
                          >
                            {busyTicketId === ticket.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Transfer
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm text-[#666666]">
                            Ticket ID <span className="font-mono text-[#1a1a1a]">#{ticket.id}</span>
                          </p>
                          {actionMessage[ticket.id] && (
                            <p className="text-sm text-[#0f766e]">{actionMessage[ticket.id]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
