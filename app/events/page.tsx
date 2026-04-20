"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { Calendar, MapPin, Users, Ticket, Eye, EyeOff, Lock, SlidersHorizontal, X, Loader2 } from "lucide-react"
import { useEvents, type Event } from "@/hooks/use-events"

type EventCategory = "all" | "hackathon" | "conference" | "vip" | "workshop" | "meetup"
type EventPrivacy = "all" | "public" | "private"

const EVENT_IMAGES = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  "https://images.unsplash.com/photo-1639762681485-074b7f938bd0?w=800&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
  "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80",
]

const categories = [
  { value: "all" as EventCategory, label: "All Events" },
  { value: "hackathon" as EventCategory, label: "Hackathons" },
  { value: "conference" as EventCategory, label: "Conferences" },
  { value: "workshop" as EventCategory, label: "Workshops" },
  { value: "vip" as EventCategory, label: "VIP" }
]

const privacyFilters = [
  { value: "all" as EventPrivacy, label: "All" },
  { value: "public" as EventPrivacy, label: "Public Only" },
  { value: "private" as EventPrivacy, label: "Private Only" }
]

function formatDate(timestamp: bigint): string {
  try {
    const date = new Date(Number(timestamp))
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return "TBA"
  }
}

export default function EventsPage() {
  const { events, loading } = useEvents()
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("all")
  const [selectedPrivacy, setSelectedPrivacy] = useState<EventPrivacy>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const filteredEvents = events.filter(event => {
    const categoryMatch = selectedCategory === "all" || event.category === selectedCategory
    const privacyMatch = selectedPrivacy === "all" ||
      (selectedPrivacy === "private" && event.isPrivate) ||
      (selectedPrivacy === "public" && !event.isPrivate)
    return categoryMatch && privacyMatch
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
            <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
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
            <span className="text-sm tracking-[0.3em] uppercase text-[#6366f1] mb-4 block">
              Blockchain Events
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] mb-4 text-balance">
              Public & Private Events
            </h1>
            <p className="text-lg text-[#666666] max-w-md mx-auto">
              Discover privacy-first Web3 events powered by Fhenix encryption
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-[#e5e5e5]">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden inline-flex items-center gap-2 text-sm text-[#1a1a1a]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-full p-1">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-full text-sm capitalize boty-transition ${
                      selectedCategory === category.value
                        ? "bg-[#1a1a1a] text-white"
                        : "bg-transparent text-[#666666] hover:text-[#1a1a1a]"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-full p-1">
                {privacyFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setSelectedPrivacy(filter.value)}
                    className={`px-4 py-2 rounded-full text-sm capitalize flex items-center gap-1.5 boty-transition ${
                      selectedPrivacy === filter.value
                        ? "bg-[#6366f1] text-white"
                        : "bg-transparent text-[#666666] hover:text-[#1a1a1a]"
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
                      className={`w-full px-6 py-4 rounded-2xl text-left capitalize boty-transition ${
                        selectedCategory === category.value
                          ? "bg-[#6366f1] text-white"
                          : "bg-[#f5f5f5] text-[#1a1a1a]"
                      }`}
                    >
                      {category.label}
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
              <EventCard
                key={event.id}
                event={event}
                index={index}
                isVisible={isVisible}
              />
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

  return (
    <Link
      href={`/events/${event.id}`}
      className={`group transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="bg-white rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02] border border-[#e5e5e5]">
        {/* Image */}
        <div className="relative aspect-video bg-[#f5f5f5] overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 via-[#f5f5f5] to-[#f5f5f5] animate-pulse transition-opacity duration-500 ${
              imageLoaded ? "opacity-0" : "opacity-100"
            }`}
          />

          <img
            src={EVENT_IMAGES[index % EVENT_IMAGES.length]}
            alt={event.name}
            className={`w-full h-full object-cover boty-transition group-hover:scale-105 transition-opacity duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Badge */}
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-white/90 backdrop-blur-sm text-[#1a1a1a] flex items-center gap-1.5">
            {event.isPrivate ? (
              <Lock className="w-3 h-3 text-[#6366f1]" />
            ) : (
              <EyeOff className="w-3 h-3 text-[#666666]" />
            )}
            {event.isPrivate ? "Private" : "Public"}
          </span>

          {/* Category */}
          <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs tracking-wide bg-[#6366f1] text-white capitalize">
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
              <Calendar className="w-4 h-4 text-[#6366f1]/70" />
              <span>{formatDate(event.eventDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#6366f1]/70" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6366f1]/70" />
              <span>{event.totalTicketsSold}/{event.maxAttendees} attendees</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#6366f1]" />
              <span className="text-sm font-medium text-[#1a1a1a]">{event.ticketPrice}</span>
            </div>
            <span className="text-sm text-[#6366f1] group-hover:translate-x-1 boty-transition">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
