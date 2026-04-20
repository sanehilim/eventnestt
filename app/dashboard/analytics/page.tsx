"use client"

import Link from "next/link"
import { ArrowLeft, TrendingUp, Users, Ticket, DollarSign, Eye, EyeOff, Calendar, BarChart3 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ConnectButton } from "@rainbow-me/rainbowkit"

const analyticsData = {
  totalEvents: 12,
  totalAttendees: 2450,
  totalRevenue: "45.2 ETH",
  privateEvents: 8,
  publicEvents: 4,
  monthlyGrowth: "+23%",
  ticketSales: [
    { month: "Jan", sales: 120 },
    { month: "Feb", sales: 180 },
    { month: "Mar", sales: 250 },
    { month: "Apr", sales: 320 },
    { month: "May", sales: 410 },
    { month: "Jun", sales: 380 }
  ],
  recentActivity: [
    { type: "ticket_sale", event: "Web3 Privacy Summit", time: "2 mins ago", amount: "0.05 ETH" },
    { type: "new_event", event: "NFT Launch Party", time: "1 hour ago", amount: null },
    { type: "ticket_sale", event: "DeFi Conference", time: "3 hours ago", amount: "0.1 ETH" },
    { type: "access_granted", event: "VIP Gala", time: "5 hours ago", amount: null }
  ]
}

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
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
              <p className="text-[#666666]">Track your event performance</p>
            </div>
            <ConnectButton.Custom>
              {({ account, mounted }) => (
                <div {...(!mounted && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none' } })}>
                  {(!mounted || !account) && (
                    <span className="text-sm text-[#666666]">Connect wallet to view your analytics</span>
                  )}
                </div>
              )}
            </ConnectButton.Custom>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-[#6366f1]" />
                <span className="text-xs text-[#6366f1] bg-[#6366f1]/10 px-2 py-1 rounded-full">{analyticsData.monthlyGrowth}</span>
              </div>
              <p className="text-[#666666] text-sm mb-1">Total Events</p>
              <p className="text-3xl font-semibold text-[#1a1a1a]">{analyticsData.totalEvents}</p>
            </div>

            <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 text-[#6366f1]" />
                <span className="text-xs text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-full">+180</span>
              </div>
              <p className="text-[#666666] text-sm mb-1">Total Attendees</p>
              <p className="text-3xl font-semibold text-[#1a1a1a]">{analyticsData.totalAttendees.toLocaleString()}</p>
            </div>

            <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-[#6366f1]" />
                <span className="text-xs text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded-full">+12.5 ETH</span>
              </div>
              <p className="text-[#666666] text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-semibold text-[#1a1a1a]">{analyticsData.totalRevenue}</p>
            </div>

            <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-4">
                <Lock className="w-8 h-8 text-[#6366f1]" />
                <span className="text-xs text-[#6366f1] bg-[#6366f1]/10 px-2 py-1 rounded-full">66%</span>
              </div>
              <p className="text-[#666666] text-sm mb-1">Private Events</p>
              <p className="text-3xl font-semibold text-[#1a1a1a]">{analyticsData.privateEvents}/{analyticsData.totalEvents}</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Simple Chart */}
            <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-[#6366f1]" />
                <h3 className="font-semibold text-[#1a1a1a]">Ticket Sales Trend</h3>
              </div>
              <div className="flex items-end justify-between h-40 gap-2">
                {analyticsData.ticketSales.map((item, index) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-[#6366f1] rounded-t-lg transition-all duration-500"
                      style={{ height: `${(item.sales / 500) * 100}%`, animationDelay: `${index * 100}ms` }}
                    />
                    <span className="text-xs text-[#666666]">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-[#6366f1]" />
                <h3 className="font-semibold text-[#1a1a1a]">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#e5e5e5]">
                    <div className="flex items-center gap-3">
                      {activity.type === "ticket_sale" && <Ticket className="w-4 h-4 text-[#10b981]" />}
                      {activity.type === "new_event" && <Calendar className="w-4 h-4 text-[#6366f1]" />}
                      {activity.type === "access_granted" && <Lock className="w-4 h-4 text-[#6366f1]" />}
                      <div>
                        <p className="text-sm text-[#1a1a1a]">{activity.event}</p>
                        <p className="text-xs text-[#666666]">{activity.time}</p>
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

          {/* Privacy Stats */}
          <div className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-semibold mb-6">Privacy Impact</h3>
            <div className="grid sm:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-5 h-5 text-white/80" />
                  <span className="text-white/80">Encrypted Access Codes</span>
                </div>
                <p className="text-3xl font-bold">1,250</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-white/80" />
                  <span className="text-white/80">Hidden Whitelists</span>
                </div>
                <p className="text-3xl font-bold">8 Events</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <EyeOff className="w-5 h-5 text-white/80" />
                  <span className="text-white/80">Private Attendee Lists</span>
                </div>
                <p className="text-3xl font-bold">2,100 Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
