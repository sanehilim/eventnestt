"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, MapPin, Users, Ticket, Eye, EyeOff, Lock, Plus, BarChart3, Settings, ChevronRight, PlusCircle, DollarSign, Shield, ArrowUpRight } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ConnectButton } from "@rainbow-me/rainbowkit"

const mockEvents = [
  {
    id: "web3-summit-2024",
    name: "Web3 Privacy Summit",
    status: "active",
    attendees: 250,
    maxAttendees: 500,
    revenue: "12.5 ETH",
    isPrivate: true
  },
  {
    id: "crypto-art-expo",
    name: "Crypto Art Expo",
    status: "upcoming",
    attendees: 180,
    maxAttendees: 200,
    revenue: "9.0 ETH",
    isPrivate: true
  },
  {
    id: "hackathon-2024",
    name: "Privacy Hackathon",
    status: "draft",
    attendees: 0,
    maxAttendees: 500,
    revenue: "0 ETH",
    isPrivate: false
  }
]

const stats = [
  { label: "Total Events", value: "12", change: "+3 this month", icon: Calendar },
  { label: "Total Attendees", value: "2,450", change: "+180 this week", icon: Users },
  { label: "Revenue", value: "45.2 ETH", change: "+12.5 ETH", icon: DollarSign },
  { label: "Private Events", value: "8", change: "66% private", icon: Shield }
]

export default function DashboardPage() {
  const [isConnected, setIsConnected] = useState(false)

  return (
    <main className="min-h-screen bg-background grid-pattern">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Manage your events and track performance</p>
            </div>
            <div className="mt-4 md:mt-0">
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, openChainModal, openAccountModal, mounted }) => (
                  <div {...(!mounted && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none' } })}>
                    {!mounted || !account ? (
                      <button
                        type="button"
                        onClick={openConnectModal}
                        className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
                      >
                        Connect Wallet
                      </button>
                    ) : chain?.unsupported ? (
                      <button
                        type="button"
                        onClick={openChainModal}
                        className="bg-destructive text-destructive-foreground px-6 py-3 rounded-full text-sm font-medium boty-transition"
                      >
                        Wrong Network
                      </button>
                    ) : (
                      <Link
                        href="/dashboard/create"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
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
              <div key={stat.label} className="bg-card rounded-2xl p-6 border border-border boty-shadow">
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">{stat.change}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link
              href="/dashboard/create"
              className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-6 border border-primary/20 boty-transition hover:scale-[1.02]"
            >
              <PlusCircle className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-serif text-xl text-foreground mb-2">Create New Event</h3>
              <p className="text-sm text-muted-foreground mb-4">Set up privacy controls and start selling tickets</p>
              <span className="inline-flex items-center gap-1 text-sm text-primary">
                Get Started <ChevronRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/dashboard/events"
              className="bg-card rounded-2xl p-6 border border-border boty-shadow boty-transition hover:scale-[1.02]"
            >
              <Ticket className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-serif text-xl text-foreground mb-2">Manage Events</h3>
              <p className="text-sm text-muted-foreground mb-4">Edit event details, manage attendees</p>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary boty-transition">
                View Events <ChevronRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="bg-card rounded-2xl p-6 border border-border boty-shadow boty-transition hover:scale-[1.02]"
            >
              <BarChart3 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-serif text-xl text-foreground mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground mb-4">Track sales, revenue, and attendance</p>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary boty-transition">
                View Analytics <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          {/* Events Table */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-serif text-2xl text-foreground">Your Events</h2>
              <Link
                href="/dashboard/events"
                className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 boty-transition"
              >
                View All <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Event</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Attendees</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Revenue</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Privacy</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-secondary/30 boty-transition">
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground">{event.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          event.status === 'active' ? 'bg-green-500/10 text-green-500' :
                          event.status === 'upcoming' ? 'bg-primary/10 text-primary' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            event.status === 'active' ? 'bg-green-500' :
                            event.status === 'upcoming' ? 'bg-primary' :
                            'bg-muted-foreground'
                          }`} />
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {event.attendees}/{event.maxAttendees}
                      </td>
                      <td className="px-6 py-4 text-primary font-medium">
                        {event.revenue}
                      </td>
                      <td className="px-6 py-4">
                        {event.isPrivate ? (
                          <span className="inline-flex items-center gap-1.5 text-sm text-primary">
                            <Lock className="w-4 h-4" />
                            Private
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <EyeOff className="w-4 h-4" />
                            Public
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/events/${event.id}`}
                          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 boty-transition"
                        >
                          Manage <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Privacy Info */}
          <div className="mt-12 bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl p-8 border border-accent/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-foreground mb-2">Your Events are Protected by Privacy</h3>
                <p className="text-muted-foreground leading-relaxed max-w-2xl">
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
