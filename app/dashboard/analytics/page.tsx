"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, TrendingUp, Users, Ticket, DollarSign, Eye, EyeOff, Calendar, BarChart3, Lock, Loader2 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { useMyEvents } from "@/hooks/use-events"

function parseTicketPriceEth(value: string) {
  const match = value.match(/(\d+(\.\d+)?)/)
  return match ? Number.parseFloat(match[1]) : 0
}

function formatEth(value: number) {
  if (value === 0) {
    return "0 ETH"
  }

  return `${value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")} ETH`
}

export default function AnalyticsPage() {
  const { isConnected } = useAccount()
  const { events, loading } = useMyEvents()

  const analyticsData = useMemo(() => {
    const totalEvents = events.length
    const totalAttendees = events.reduce((sum, event) => sum + event.totalTicketsSold, 0)
    const totalRevenue = events.reduce(
      (sum, event) => sum + parseTicketPriceEth(event.ticketPrice) * event.totalTicketsSold,
      0,
    )
    const privateEvents = events.filter((event) => event.isPrivate).length
    const inviteProtected = events.filter((event) => event.requiresInviteCode).length
    const whitelistProtected = events.filter((event) => event.requiresWhitelist).length
    const privateAttendees = events
      .filter((event) => event.isPrivate)
      .reduce((sum, event) => sum + event.totalTicketsSold, 0)
    const ticketSales = events
      .slice()
      .sort((left, right) => right.totalTicketsSold - left.totalTicketsSold)
      .slice(0, 6)
      .map((event) => ({
        label: event.name.length > 3 ? event.name.slice(0, 3).toUpperCase() : event.name.toUpperCase(),
        sales: event.totalTicketsSold,
        fullName: event.name,
      }))
    const recentActivity = events
      .slice()
      .sort((left, right) => Number(right.eventDate) - Number(left.eventDate))
      .slice(0, 4)
      .map((event) => ({
        type: event.totalTicketsSold > 0 ? "ticket_sale" : event.isPrivate ? "access_granted" : "new_event",
        event: event.name,
        detail:
          event.totalTicketsSold > 0
            ? `${event.totalTicketsSold}/${event.maxAttendees} tickets minted`
            : event.isPrivate
              ? "Private access rules active"
              : "Public registration available",
        amount: parseTicketPriceEth(event.ticketPrice) > 0 ? event.ticketPrice : null,
      }))

    return {
      totalEvents,
      totalAttendees,
      totalRevenue: formatEth(totalRevenue),
      privateEvents,
      inviteProtected,
      whitelistProtected,
      privateAttendees,
      ticketSales,
      recentActivity,
    }
  }, [events])

  const chartMax = Math.max(1, ...analyticsData.ticketSales.map((entry) => entry.sales))

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#666666] hover:text-[#1a1a1a] boty-transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl text-[#1a1a1a] mb-2">Analytics</h1>
              <p className="text-[#666666]">Track your live on-chain event performance</p>
            </div>
            <ConnectButton.Custom>
              {({ account, mounted }) => (
                <div {...(!mounted && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none" } })}>
                  {(!mounted || !account) && (
                    <span className="text-sm text-[#666666]">Connect wallet to view your analytics</span>
                  )}
                </div>
              )}
            </ConnectButton.Custom>
          </div>

          {!isConnected ? (
            <div className="bg-[#f5f5f5] rounded-3xl p-12 border border-[#e5e5e5] text-center">
              <BarChart3 className="w-16 h-16 text-[#666666] mx-auto mb-4" />
              <h2 className="text-2xl text-[#1a1a1a] mb-2">Connect Your Wallet</h2>
              <p className="text-[#666666]">Connect the organizer wallet to load live analytics from Sepolia.</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="bg-[#f5f5f5] rounded-3xl p-12 border border-[#e5e5e5] text-center">
              <Calendar className="w-16 h-16 text-[#666666] mx-auto mb-4" />
              <h2 className="text-2xl text-[#1a1a1a] mb-2">No Analytics Yet</h2>
              <p className="text-[#666666]">Create your first event to start collecting organizer analytics.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 text-[#6366f1]" />
                    <span className="text-xs text-[#6366f1] bg-[#6366f1]/10 px-2 py-1 rounded-full">Live</span>
                  </div>
                  <p className="text-[#666666] text-sm mb-1">Total Events</p>
                  <p className="text-3xl font-semibold text-[#1a1a1a]">{analyticsData.totalEvents}</p>
                </div>

                <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-[#6366f1]" />
                    <span className="text-xs text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-full">Minted</span>
                  </div>
                  <p className="text-[#666666] text-sm mb-1">Total Attendees</p>
                  <p className="text-3xl font-semibold text-[#1a1a1a]">{analyticsData.totalAttendees.toLocaleString()}</p>
                </div>

                <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
                  <div className="flex items-center justify-between mb-4">
                    <DollarSign className="w-8 h-8 text-[#6366f1]" />
                    <span className="text-xs text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-full">Estimate</span>
                  </div>
                  <p className="text-[#666666] text-sm mb-1">Total Revenue</p>
                  <p className="text-3xl font-semibold text-[#1a1a1a]">{analyticsData.totalRevenue}</p>
                </div>

                <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
                  <div className="flex items-center justify-between mb-4">
                    <Lock className="w-8 h-8 text-[#6366f1]" />
                    <span className="text-xs text-[#6366f1] bg-[#6366f1]/10 px-2 py-1 rounded-full">
                      {Math.round((analyticsData.privateEvents / analyticsData.totalEvents) * 100)}%
                    </span>
                  </div>
                  <p className="text-[#666666] text-sm mb-1">Private Events</p>
                  <p className="text-3xl font-semibold text-[#1a1a1a]">{analyticsData.privateEvents}/{analyticsData.totalEvents}</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-[#6366f1]" />
                    <h3 className="font-semibold text-[#1a1a1a]">Top Events by Tickets Minted</h3>
                  </div>
                  <div className="flex items-end justify-between h-40 gap-2">
                    {analyticsData.ticketSales.map((item, index) => (
                      <div key={item.fullName} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-[#6366f1] rounded-t-lg transition-all duration-500"
                          style={{ height: `${(item.sales / chartMax) * 100}%`, animationDelay: `${index * 100}ms` }}
                          title={item.fullName}
                        />
                        <span className="text-xs text-[#666666]">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-[#6366f1]" />
                    <h3 className="font-semibold text-[#1a1a1a]">Recent Activity</h3>
                  </div>
                  <div className="space-y-4">
                    {analyticsData.recentActivity.map((activity, index) => (
                      <div key={`${activity.event}-${index}`} className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#e5e5e5]">
                        <div className="flex items-center gap-3">
                          {activity.type === "ticket_sale" && <Ticket className="w-4 h-4 text-[#10b981]" />}
                          {activity.type === "new_event" && <Calendar className="w-4 h-4 text-[#6366f1]" />}
                          {activity.type === "access_granted" && <Lock className="w-4 h-4 text-[#6366f1]" />}
                          <div>
                            <p className="text-sm text-[#1a1a1a]">{activity.event}</p>
                            <p className="text-xs text-[#666666]">{activity.detail}</p>
                          </div>
                        </div>
                        {activity.amount && (
                          <span className="text-sm font-medium text-[#10b981]">{activity.amount}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-semibold mb-6">Privacy Impact</h3>
                <div className="grid sm:grid-cols-3 gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-5 h-5 text-white/80" />
                      <span className="text-white/80">Invite-Code Events</span>
                    </div>
                    <p className="text-3xl font-bold">{analyticsData.inviteProtected}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-white/80" />
                      <span className="text-white/80">Whitelist-Protected Events</span>
                    </div>
                    <p className="text-3xl font-bold">{analyticsData.whitelistProtected}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <EyeOff className="w-5 h-5 text-white/80" />
                      <span className="text-white/80">Tickets Minted for Private Events</span>
                    </div>
                    <p className="text-3xl font-bold">{analyticsData.privateAttendees}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
