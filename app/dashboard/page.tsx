"use client"

import Link from "next/link"
import { Calendar, Users, Ticket, DollarSign, Shield, Plus, BarChart3, Settings, ChevronRight, PlusCircle, Lock, EyeOff, Loader2, ArrowRight } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"

const stats = [
  { label: "Total Events", value: "12", change: "+3 this month", icon: Calendar },
  { label: "Total Attendees", value: "2,450", change: "+180 this week", icon: Users },
  { label: "Revenue", value: "45.2 ETH", change: "+12.5 ETH", icon: DollarSign },
  { label: "Private Events", value: "8", change: "66% private", icon: Shield }
]

export default function DashboardPage() {
  const { isConnected, address } = useAccount()

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl text-[#1a1a1a] mb-2">Dashboard</h1>
              <p className="text-[#666666]">
                {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : "Manage your events on-chain"}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, openChainModal, mounted }) => (
                  <div {...(!mounted && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none" } })}>
                    {!mounted || !account ? (
                      <button
                        type="button"
                        onClick={openConnectModal}
                        className="bg-[#1a1a1a] text-white px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-[#333] boty-shadow"
                      >
                        Connect Wallet
                      </button>
                    ) : chain?.unsupported ? (
                      <button
                        type="button"
                        onClick={openChainModal}
                        className="bg-[#ef4444] text-white px-6 py-3 rounded-full text-sm font-medium boty-transition"
                      >
                        Wrong Network
                      </button>
                    ) : (
                      <Link
                        href="/dashboard/create"
                        className="inline-flex items-center gap-2 bg-[#6366f1] text-white px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-[#5558e3] boty-shadow"
                      >
                        <Plus className="w-4 h-4" />
                        Create Event
                      </Link>
                    )}
                  </div>
                )}
              </ConnectButton.Custom>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5]">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-[#6366f1]" />
                  <span className="text-xs text-[#6366f1] bg-[#6366f1]/10 px-2 py-1 rounded-full">{stat.change}</span>
                </div>
                <p className="text-[#666666] text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-semibold text-[#1a1a1a]">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/dashboard/create"
              className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-2xl p-6 text-white boty-transition hover:scale-[1.02]"
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
              className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5] boty-shadow boty-transition hover:scale-[1.02]"
            >
              <Ticket className="w-8 h-8 text-[#6366f1] mb-4" />
              <h3 className="text-xl text-[#1a1a1a] mb-2">Manage Events</h3>
              <p className="text-sm text-[#666666] mb-4">Edit event details, manage attendees</p>
              <span className="inline-flex items-center gap-1 text-sm text-[#6366f1]">
                View Events <ChevronRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5] boty-shadow boty-transition hover:scale-[1.02]"
            >
              <BarChart3 className="w-8 h-8 text-[#6366f1] mb-4" />
              <h3 className="text-xl text-[#1a1a1a] mb-2">Analytics</h3>
              <p className="text-sm text-[#666666] mb-4">Track sales, revenue, and attendance</p>
              <span className="inline-flex items-center gap-1 text-sm text-[#6366f1]">
                View Analytics <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          {/* Privacy Info */}
          <div className="bg-gradient-to-br from-[#6366f1]/10 to-[#8b5cf6]/10 rounded-3xl p-8 border border-[#6366f1]/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#6366f1]/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#6366f1]" />
              </div>
              <div>
                <h3 className="text-xl text-[#1a1a1a] mb-2">Your Events are Protected by Privacy</h3>
                <p className="text-[#666666] leading-relaxed max-w-2xl">
                  All event access controls, pricing tiers, and attendee lists are encrypted on-chain using Fhenix. Your competitive intelligence stays private while still being verifiable by attendees.
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
