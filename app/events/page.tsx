"use client"
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { Calendar, MapPin, Users, Ticket, EyeOff, Lock, SlidersHorizontal, X, Loader2 } from "lucide-react"
import { useEvents, type Event } from "@/hooks/use-events"
import { formatEventDate } from "@/lib/onchain"

type EventCategory = "all" | "hackathon" | "conference" | "vip" | "workshop" | "meetup"
type EventPrivacy = "all" | "public" | "private"

const categories = [
  { value: "all" as EventCategory, label: "All Events" },
  { value: "hackathon" as EventCategory, label: "Hackathons" },
  { value: "conference" as EventCategory, label: "Conferences" },
  { value: "workshop" as EventCategory, label: "Workshops" },
  { value: "vip" as EventCategory, label: "VIP" },
  { value: "meetup" as EventCategory, label: "Meetups" },
]

const privacyFilters = [
  { value: "all" as EventPrivacy, label: "All" },
  { value: "public" as EventPrivacy, label: "Public Only" },
  { value: "private" as EventPrivacy, label: "Private Only" }
]

function formatDate(timestamp: bigint): string {
  return formatEventDate(timestamp, { month: "short", day: "numeric", year: "numeric" })
}

export default function EventsPage() {
  const { events, loading } = useEvents()
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("all")
  const [selectedPrivacy, setSelectedPrivacy] = useState<EventPrivacy>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const filteredEvents = events
    .filter(event => {
      const categoryMatch = selectedCategory === "all" || event.category === selectedCategory
      const isGated = event.isPrivate || event.requiresInviteCode || event.requiresWhitelist || event.requiresConfidentialAccess
      const privacyMatch = selectedPrivacy === "all" ||
        (selectedPrivacy === "private" && isGated) ||
        (selectedPrivacy === "public" && !isGated)
      return categoryMatch && privacyMatch
    })
    .sort((left, right) => {
      const leftScore = left.totalTicketsSold * 3 + left.tiers.filter((tier) => tier.active && tier.totalSold > 0).length
      const rightScore = right.totalTicketsSold * 3 + right.tiers.filter((tier) => tier.active && tier.totalSold > 0).length
      return rightScore - leftScore || Number(left.eventDate - right.eventDate)
    })

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

  useEffect(() => {
    const hideTimer = window.setTimeout(() => setIsVisible(false), 0)
    const showTimer = window.setTimeout(() => setIsVisible(true), 50)

    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(showTimer)
    }
  }, [selectedCategory, selectedPrivacy])

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-28 pb-20">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin" />
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-[#0f766e] mb-4 block">
              Blockchain Events
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] mb-4 text-balance">
              Public & Gated Events
            </h1>
            <p className="text-lg text-[#666666] max-w-md mx-auto">
              Discover live Web3 events ranked by on-chain activity and CoFHE-ready access controls
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-[#e5e5e5] pb-6">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden inline-flex items-center gap-2 text-sm text-[#1a1a1a]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            {/* Desktop Filters */}
            <div className="hidden min-w-0 flex-1 items-center gap-3 lg:flex">
              <div className="grid min-w-0 flex-1 grid-cols-6 gap-1.5 rounded-2xl border border-[#e5e5e5] bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setSelectedCategory(category.value)}
                    aria-pressed={selectedCategory === category.value}
                    className={`h-11 rounded-xl px-3 text-sm font-semibold capitalize boty-transition ${
                      selectedCategory === category.value
                        ? "bg-[#1a1a1a] text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                        : "text-[#666666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-[#e5e5e5] bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                {privacyFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setSelectedPrivacy(filter.value)}
                    aria-pressed={selectedPrivacy === filter.value}
                    className={`flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold capitalize boty-transition ${
                      selectedPrivacy === filter.value
                        ? "bg-[#0f766e] text-white shadow-[0_8px_20px_rgba(15,118,110,0.22)]"
                        : "text-[#666666] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
                    }`}
                  >
                    {filter.value === "private" && <Lock className="w-3 h-3" />}
                    {filter.value === "public" && <EyeOff className="w-3 h-3" />}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-sm text-[#666666]">
              {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
            </span>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl text-[#1a1a1a]">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="p-2 text-[#666666] hover:text-[#1a1a1a]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-[#666666]">Category</h3>
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.value)
                        setShowFilters(false)
                      }}
                      className={`w-full px-6 py-4 rounded-lg text-left capitalize boty-transition ${
                        selectedCategory === category.value
                          ? "bg-[#0f766e] text-white"
                          : "bg-[#f5f5f5] text-[#1a1a1a]"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
                <div className="mt-8 space-y-3">
                  <h3 className="text-sm font-medium text-[#666666]">Access</h3>
                  {privacyFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => {
                        setSelectedPrivacy(filter.value)
                        setShowFilters(false)
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-6 py-4 text-left boty-transition ${
                        selectedPrivacy === filter.value
                          ? "bg-[#0f766e] text-white"
                          : "bg-[#f5f5f5] text-[#1a1a1a]"
                      }`}
                    >
                      {filter.value === "private" && <Lock className="w-4 h-4" />}
                      {filter.value === "public" && <EyeOff className="w-4 h-4" />}
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Event Grid */}
          <div
            ref={gridRef}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} isVisible={isVisible} />
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <Lock className="w-16 h-16 text-[#e5e5e5] mx-auto mb-4" />
              <h3 className="text-2xl text-[#1a1a1a] mb-2">No events found</h3>
              <p className="text-[#666666]">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}

function EventCard({
  event,
  index,
  isVisible
}: {
  event: Event
  index: number
  isVisible: boolean
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const isGated = event.isPrivate || event.requiresInviteCode || event.requiresWhitelist || event.requiresConfidentialAccess
  const activeTiers = event.tiers.filter((tier) => tier.active)
  const priceLabel = activeTiers.length > 1 ? `From ${activeTiers[0]?.price || event.ticketPrice}` : event.ticketPrice

  return (
    <Link
      href={`/events/${event.id}`}
      className={`group transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="bg-white rounded-xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02] border border-[#e5e5e5]">
        {/* Image */}
        <div className="relative aspect-video bg-[#f5f5f5] overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-[#0f766e]/10 via-[#f5f5f5] to-[#f5f5f5] animate-pulse transition-opacity duration-500 ${
              imageLoaded ? "opacity-0" : "opacity-100"
            }`}
          />

          <img
            src={event.image}
            alt={event.name}
            className={`w-full h-full object-cover boty-transition group-hover:scale-105 transition-opacity duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Badge */}
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-white/90 backdrop-blur-sm text-[#1a1a1a] flex items-center gap-1.5">
            {isGated ? (
              <Lock className="w-3 h-3 text-[#0f766e]" />
            ) : (
              <EyeOff className="w-3 h-3 text-[#666666]" />
            )}
            {isGated ? "Gated" : "Public"}
          </span>

          {/* Category */}
          <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs tracking-wide bg-[#0f766e] text-white capitalize">
            {event.category}
          </span>
        </div>

        {/* Info */}
        <div className="p-6">
          <h3 className="text-xl text-[#1a1a1a] mb-1 font-medium">{event.name}</h3>
          <p className="text-sm text-[#666666] mb-4 line-clamp-2">{event.description}</p>

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
              <span>{event.totalTicketsSold}/{event.maxAttendees} attendees</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#0f766e]" />
              <span className="text-sm font-medium text-[#1a1a1a]">{priceLabel}</span>
            </div>
            <span className="text-sm text-[#0f766e] group-hover:translate-x-1 boty-transition">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
