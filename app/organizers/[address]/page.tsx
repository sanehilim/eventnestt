"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { isAddress } from "viem"
import { ArrowLeft, Calendar, ShieldCheck, Ticket, Users, Wallet } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useEvents } from "@/hooks/use-events"

export default function OrganizerProfilePage() {
  const params = useParams()
  const address = String(params.address || "")
  const { events, loading } = useEvents()
  const normalized = address.toLowerCase()
  const organizerEvents = events.filter((event) => event.organizer?.toLowerCase() === normalized)
  const totalTickets = organizerEvents.reduce((sum, event) => sum + event.totalTicketsSold, 0)
  const confidentialEvents = organizerEvents.filter((event) => event.requiresConfidentialAccess).length
  const activeTiers = organizerEvents.reduce((sum, event) => sum + event.tiers.filter((tier) => tier.active).length, 0)

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <Link href="/events" className="inline-flex items-center gap-2 text-[#666666] hover:text-[#1a1a1a] boty-transition mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>

          <section className="rounded-xl border border-[#e5e5e5] bg-[#f5f5f5] p-8 mb-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0f766e]/20 bg-[#0f766e]/10 px-3 py-1 text-sm text-[#0f766e]">
                  <ShieldCheck className="h-4 w-4" />
                  Organizer Reputation
                </div>
                <h1 className="text-3xl md:text-4xl text-[#1a1a1a] mb-2">
                  {isAddress(address) ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Unknown Organizer"}
                </h1>
                <p className="font-mono text-sm text-[#666666] break-all">{address}</p>
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {[
              { label: "Live Events", value: organizerEvents.length, icon: Calendar },
              { label: "Tickets Minted", value: totalTickets, icon: Users },
              { label: "CoFHE Events", value: confidentialEvents, icon: ShieldCheck },
              { label: "Active Tiers", value: activeTiers, icon: Ticket },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-[#e5e5e5] bg-white p-5">
                <stat.icon className="mb-4 h-6 w-6 text-[#0f766e]" />
                <p className="text-sm text-[#666666]">{stat.label}</p>
                <p className="text-3xl font-semibold text-[#1a1a1a]">{loading ? "-" : stat.value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-xl border border-[#e5e5e5] bg-[#f5f5f5] p-8">
            <div className="flex items-center gap-2 mb-6">
              <Wallet className="h-5 w-5 text-[#0f766e]" />
              <h2 className="text-2xl text-[#1a1a1a]">Organizer Events</h2>
            </div>

            {loading ? (
              <p className="text-[#666666]">Loading on-chain activity...</p>
            ) : organizerEvents.length === 0 ? (
              <p className="text-[#666666]">No events were found for this organizer on the configured contract.</p>
            ) : (
              <div className="grid gap-4">
                {organizerEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="rounded-lg border border-[#e5e5e5] bg-white p-5 boty-transition hover:border-[#0f766e]/40"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-medium text-[#1a1a1a]">{event.name}</h3>
                        <p className="text-sm text-[#666666]">{event.location}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#666666]">
                        <span>{event.totalTicketsSold}/{event.maxAttendees} minted</span>
                        {event.requiresConfidentialAccess && (
                          <span className="rounded-full bg-[#0f766e]/10 px-3 py-1 text-[#0f766e]">CoFHE</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
