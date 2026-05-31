"use client"
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Calendar, MapPin, Users, Ticket, EyeOff, Lock, ArrowRight, Loader2 } from "lucide-react"
import { useEvents, type Event } from "@/hooks/use-events"
import { formatEventDate } from "@/lib/onchain"

type EventCategory = "all" | "hackathon" | "conference" | "vip" | "workshop" | "meetup"

const categories = [
  { value: "all" as EventCategory, label: "All Events" },
  { value: "hackathon" as EventCategory, label: "Hackathons" },
  { value: "conference" as EventCategory, label: "Conferences" },
  { value: "workshop" as EventCategory, label: "Workshops" },
  { value: "vip" as EventCategory, label: "VIP" },
  { value: "meetup" as EventCategory, label: "Meetups" },
]

function formatDate(timestamp: bigint): string {
  return formatEventDate(timestamp, { month: "short", day: "numeric", year: "numeric" })
}

export function ShowcaseGrid() {
  const { events, loading } = useEvents()
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("all")
  const [isVisible, setIsVisible] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const showcaseEvents = events.slice(0, 4)
  const filteredEvents = selectedCategory === "all"
    ? showcaseEvents
    : showcaseEvents.filter(event => event.category === selectedCategory)

  useEffect(() => {
    const node = gridRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (node) {
      observer.observe(node)
    }

    return () => {
      if (node) {
        observer.unobserve(node)
      }
    }
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm tracking-[0.3em] uppercase text-[#0f766e] mb-4 block animate-blur-in opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
            Discover
          </span>
          <h2 className="text-4xl leading-tight text-[#1a1a1a] mb-4 text-balance md:text-7xl animate-blur-in opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            Featured Events
          </h2>
          <p className="text-lg text-[#666666] max-w-md mx-auto animate-blur-in opacity-0" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
            Privacy-first Web3 events with CoFHE invite access
          </p>
        </div>

        {/* Segmented Control */}
        <div className="mb-12 flex w-full justify-center overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex min-w-max items-center gap-1.5 rounded-2xl border border-[#e5e5e5] bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value)}
                aria-pressed={selectedCategory === category.value}
                className={`h-11 rounded-xl px-5 text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === category.value
                    ? "bg-[#1a1a1a] text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                    : "text-[#666666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event Grid */}
        <div
          ref={gridRef}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredEvents.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-[#e5e5e5] bg-[#f5f5f5] p-10 text-center">
              <h3 className="text-2xl text-[#1a1a1a] mb-3">No live events yet</h3>
              <p className="text-[#666666] max-w-md mx-auto">
                Create your first on-chain event from the dashboard and it will appear here automatically.
              </p>
            </div>
          )}
          {filteredEvents.map((event, index) => {
            const isGated = event.isPrivate || event.requiresInviteCode || event.requiresWhitelist || event.requiresConfidentialAccess

            return (
              <Link
                key={`showcase-${selectedCategory}-${event.id}`}
                href={`/events/${event.id}`}
                className={`group transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
              <div className="bg-white rounded-xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02] border border-[#e5e5e5]">
                {/* Image */}
                <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover boty-transition group-hover:scale-105"
                  />
                  {/* Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-white/90 backdrop-blur-sm text-[#1a1a1a] flex items-center gap-1.5 border border-[#e5e5e5]">
                    {isGated ? (
                      <Lock className="w-3 h-3 text-[#0f766e]" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-[#666666]" />
                    )}
                    {isGated ? "Gated" : "Public"}
                  </span>
                  {/* Tickets Left */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs bg-white/90 backdrop-blur-sm text-[#1a1a1a]">
                    {event.maxAttendees - event.totalTicketsSold} spots left
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg text-[#1a1a1a] mb-1 font-medium">{event.name}</h3>
                  <p className="text-sm text-[#666666] mb-3 line-clamp-2">{event.description}</p>

                  {/* Meta */}
                  <div className="space-y-2 text-sm text-[#666666] mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#0f766e]/70" />
                      <span>{formatDate(event.eventDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#0f766e]/70" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#0f766e]/70" />
                      <span>{event.totalTicketsSold}/{event.maxAttendees}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[#0f766e]" />
                      <span className="text-sm font-medium text-[#1a1a1a]">
                        {event.tiers.filter((tier) => tier.active).length > 1 ? "Tiered" : event.ticketPrice}
                      </span>
                    </div>
                    <span className="text-sm text-[#0f766e] flex items-center gap-1 group-hover:translate-x-1 boty-transition">
                      View <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
              </Link>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/events"
            className="inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-[#333] boty-shadow"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
  )
}
