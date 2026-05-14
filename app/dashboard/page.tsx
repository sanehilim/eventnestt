"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Calendar, Users, DollarSign, Shield, Plus, BarChart3, ChevronRight, PlusCircle, Loader2 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useAccount } from "wagmi"
import { useMyEvents, useOrganizerRevenue } from "@/hooks/use-events"

export default function DashboardPage() {
  const { isConnected, address } = useAccount()
  const { events, loading } = useMyEvents()
  const { loading: revenueLoading, totalRevenue } = useOrganizerRevenue()

  const stats = useMemo(() => {
    const totalEvents = events.length
    const totalAttendees = events.reduce((sum, event) => sum + event.totalTicketsSold, 0)
    const gatedEvents = events.filter((event) => event.isPrivate || event.requiresInviteCode || event.requiresWhitelist).length
    const gatedRatio = totalEvents > 0 ? Math.round((gatedEvents / totalEvents) * 100) : 0

    return [
      {
        label: "Total Events",
        value: String(totalEvents),
        change: totalEvents > 0 ? "Live from your wallet" : "No events created yet",
        icon: Calendar,
      },
      {
        label: "Total Attendees",
        value: totalAttendees.toLocaleString(),
        change: totalAttendees > 0 ? "Tickets minted on-chain" : "No attendees yet",
        icon: Users,
      },
      {
        label: "Revenue",
        value: totalRevenue,
        change: totalEvents > 0 ? "From payment events" : "No paid tickets yet",
        icon: DollarSign,
      },
      {
        label: "Gated Events",
        value: String(gatedEvents),
        change: totalEvents > 0 ? `${gatedRatio}% use access rules` : "No access rules set yet",
        icon: Shield,
      },
    ]
  }, [events, totalRevenue])

  const totalMinted = useMemo(
    () => events.reduce((sum, event) => sum + event.totalTicketsSold, 0),
    [events],
  )

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl text-[#1a1a1a] mb-2">Dashboard</h1>
              <p className="text-[#666666]">
                {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : "Manage your events on-chain"}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              {isConnected ? (
                <Link
                  href="/dashboard/create"
                  className="inline-flex items-center gap-2 bg-[#0f766e] text-white px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-[#0d6b63] boty-shadow"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </Link>
              ) : (
                <WalletConnectButton />
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#f5f5f5] rounded-lg p-6 border border-[#e5e5e5]">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-[#0f766e]" />
                  <span className="text-xs text-[#0f766e] bg-[#0f766e]/10 px-2 py-1 rounded-full">{stat.change}</span>
                </div>
                <p className="text-[#666666] text-sm mb-1">{stat.label}</p>
                {(loading || (stat.label === "Revenue" && revenueLoading)) && isConnected ? (
                  <Loader2 className="w-6 h-6 text-[#0f766e] animate-spin" />
                ) : (
                  <p className="text-3xl font-semibold text-[#1a1a1a]">{stat.value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/dashboard/create"
              className="bg-gradient-to-br from-[#0f766e] to-[#f59e0b] rounded-lg p-6 text-white boty-transition hover:scale-[1.02]"
            >
              <PlusCircle className="w-8 h-8 mb-4" />
              <h3 className="text-xl text-white mb-2">Create New Event</h3>
              <p className="text-sm text-white/70 mb-4">Set up privacy controls and deploy on-chain</p>
              <span className="inline-flex items-center gap-1 text-sm text-white">
                Get Started <ChevronRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/dashboard/events"
              className="bg-[#f5f5f5] rounded-lg p-6 border border-[#e5e5e5] boty-shadow boty-transition hover:scale-[1.02]"
            >
              <Calendar className="w-8 h-8 text-[#0f766e] mb-4" />
              <h3 className="text-xl text-[#1a1a1a] mb-2">Manage Events</h3>
              <p className="text-sm text-[#666666] mb-4">Edit invite codes, whitelists, and event access</p>
              <span className="inline-flex items-center gap-1 text-sm text-[#0f766e]">
                View Events <ChevronRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="bg-[#f5f5f5] rounded-lg p-6 border border-[#e5e5e5] boty-shadow boty-transition hover:scale-[1.02]"
            >
              <BarChart3 className="w-8 h-8 text-[#0f766e] mb-4" />
              <h3 className="text-xl text-[#1a1a1a] mb-2">Analytics</h3>
              <p className="text-sm text-[#666666] mb-4">Track live ticket minting and access configuration</p>
              <span className="inline-flex items-center gap-1 text-sm text-[#0f766e]">
                View Analytics <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-[#0f766e]/10 to-[#f59e0b]/10 rounded-xl p-8 border border-[#0f766e]/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0f766e]/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#0f766e]" />
              </div>
              <div>
                <h3 className="text-xl text-[#1a1a1a] mb-2">Organizer Summary</h3>
                <p className="text-[#666666] leading-relaxed max-w-2xl">
                  {!isConnected
                    ? "Connect your wallet to load your organizer dashboard and manage your live on-chain events."
                    : loading
                      ? "Loading your live event data from Sepolia."
                      : events.length === 0
                        ? "No on-chain events were found for this wallet yet. Create your first event from this dashboard and it will appear here automatically."
                        : `This wallet currently manages ${events.length} event${events.length === 1 ? "" : "s"} with ${totalMinted} minted ticket${totalMinted === 1 ? "" : "s"}. Invite-code and whitelist rules are enforced by the deployed smart contract on Sepolia.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
