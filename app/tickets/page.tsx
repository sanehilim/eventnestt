"use client"

import Link from "next/link"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useMyTickets, useEvents } from "@/hooks/use-events"
import { Ticket, Calendar, MapPin, Users, ArrowRight, Star, Lock, Loader2 } from "lucide-react"
import { useAccount } from "wagmi"

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
  const { tickets, loading } = useMyTickets()
  const { events } = useEvents()

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
              className="bg-[#6366f1] text-white px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-[#5558e3]"
            >
              Browse Events
            </Link>
          </div>

          {!isConnected ? (
            <div className="bg-[#f5f5f5] rounded-3xl p-12 border border-[#e5e5e5] text-center">
              <Ticket className="w-16 h-16 text-[#666666] mx-auto mb-4" />
              <h2 className="text-2xl text-[#1a1a1a] mb-2">Connect Your Wallet</h2>
              <p className="text-[#666666] mb-6">Connect your wallet to see your tickets</p>
              <ConnectButton />
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-[#f5f5f5] rounded-3xl p-12 border border-[#e5e5e5] text-center">
              <Ticket className="w-16 h-16 text-[#666666] mx-auto mb-4" />
              <h2 className="text-2xl text-[#1a1a1a] mb-2">No Tickets Yet</h2>
              <p className="text-[#666666] mb-6">You haven&apos;t registered for any events yet.</p>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 bg-[#6366f1] text-white px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-[#5558e3]"
              >
                Browse Events
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {tickets.map((ticket) => {
                const event = events.find(e => e.id === ticket.eventId)
                return (
                  <div
                    key={ticket.id}
                    className="bg-[#f5f5f5] rounded-3xl border border-[#e5e5e5] overflow-hidden boty-shadow"
                  >
                    <div className="p-6 flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-[#6366f1]/10 flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-10 h-10 text-[#6366f1]" />
                      </div>
                      <div className="flex-1">
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
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#666666]">Ticket ID</p>
                        <p className="font-mono text-[#1a1a1a]">#{ticket.id}</p>
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
