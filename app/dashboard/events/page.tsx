"use client"

import Link from "next/link"
import { Calendar, MapPin, Users, Lock, EyeOff, Edit, Eye as ViewEvent, Loader2 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useMyEvents } from "@/hooks/use-events"

export default function EventsListPage() {
  const { events, loading } = useMyEvents()

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
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Event</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Date</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Attendees</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">Ticket Price</th>
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
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(Number(event.eventDate)).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.totalTicketsSold}/{event.maxAttendees}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-primary font-medium">
                        {event.ticketPrice}
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}

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
