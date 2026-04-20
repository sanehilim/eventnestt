"use client"

import Link from "next/link"
import { Calendar, MapPin, Users, Lock, Eye, EyeOff, MoreVertical, Edit, Trash2, Eye as ViewEvent, ChevronRight } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ConnectButton } from "@rainbow-me/rainbowkit"

const events = [
  {
    id: "web3-summit-2024",
    name: "Web3 Privacy Summit",
    status: "active",
    date: "2024-06-15",
    location: "San Francisco, CA",
    attendees: 250,
    maxAttendees: 500,
    revenue: "12.5 ETH",
    isPrivate: true
  },
  {
    id: "crypto-art-expo",
    name: "Crypto Art Expo",
    status: "upcoming",
    date: "2024-07-20",
    location: "New York, NY",
    attendees: 180,
    maxAttendees: 200,
    revenue: "9.0 ETH",
    isPrivate: true
  },
  {
    id: "defi-conference",
    name: "DeFi Innovation Conference",
    status: "upcoming",
    date: "2024-08-10",
    location: "London, UK",
    attendees: 0,
    maxAttendees: 1000,
    revenue: "0 ETH",
    isPrivate: false
  },
  {
    id: "hackathon-2024",
    name: "Privacy Hackathon",
    status: "draft",
    date: "2024-09-01",
    location: "Remote",
    attendees: 0,
    maxAttendees: 500,
    revenue: "0 ETH",
    isPrivate: false
  }
]

export default function EventsListPage() {
  return (
    <main className="min-h-screen bg-background grid-pattern">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary boty-transition mb-4"
              >
                Back to Dashboard
              </Link>
              <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">Your Events</h1>
              <p className="text-muted-foreground">Manage all your events in one place</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link
                href="/dashboard/create"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
              >
                Create Event
              </Link>
            </div>
          </div>

          {/* Events Table */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden boty-shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Event</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Date</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Attendees</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Revenue</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Privacy</th>
                    <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-secondary/30 boty-transition">
                      <td className="px-6 py-4">
                        <div>
                          <Link href={`/events/${event.id}`} className="font-medium text-foreground hover:text-primary boty-transition">
                            {event.name}
                          </Link>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </p>
                        </div>
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4" />
                          {event.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.attendees}/{event.maxAttendees}
                        </div>
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
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/events/${event.id}`}
                            className="p-2 text-muted-foreground hover:text-primary boty-transition rounded-lg hover:bg-secondary"
                            title="View Event"
                          >
                            <ViewEvent className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/events/${event.id}`}
                            className="p-2 text-muted-foreground hover:text-primary boty-transition rounded-lg hover:bg-secondary"
                            title="Edit Event"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            className="p-2 text-muted-foreground hover:text-destructive boty-transition rounded-lg hover:bg-secondary"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {events.length === 0 && (
              <div className="text-center py-20">
                <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-serif text-2xl text-foreground mb-2">No events yet</h3>
                <p className="text-muted-foreground mb-6">Create your first event to get started.</p>
                <Link
                  href="/dashboard/create"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
                >
                  Create Event
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
