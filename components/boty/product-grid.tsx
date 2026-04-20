"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Calendar, MapPin, Users, Ticket, EyeOff, Lock, Loader2 } from "lucide-react"
import { useEvents, type Event } from "@/hooks/use-events"

type EventCategory = "all" | "hackathon" | "conference" | "vip" | "workshop" | "meetup"

const categories = [
  { value: "all" as EventCategory, label: "All" },
  { value: "hackathon" as EventCategory, label: "Hackathons" },
  { value: "conference" as EventCategory, label: "Conferences" },
  { value: "workshop" as EventCategory, label: "Workshops" },
  { value: "vip" as EventCategory, label: "VIP" }
]

// Real Unsplash images for Web3/Ethereum events
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

function formatDate(timestamp: bigint): string {
  try {
    const date = new Date(Number(timestamp))
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return "TBA"
  }
}

export function EventGrid() {
  const { events, loading, error } = useEvents()
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("all")
  const [isVisible, setIsVisible] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const filteredEvents = selectedCategory === "all"
    ? events
    : events.filter(event => event.category === selectedCategory)

  const handleCategoryChange = (category: EventCategory) => {
    if (category !== selectedCategory) {
      setIsTransitioning(true)
      setTimeout(() => {
        setSelectedCategory(category)
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 300)
    }
  }

  useEffect(() => {
    const node = gridRef.current
    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (node) {
      gridObserver.observe(node)
    }

    return () => {
      if (node) {
        gridObserver.unobserve(node)
      }
    }
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
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
          <span className="text-sm tracking-[0.3em] uppercase text-[#6366f1] mb-4 block animate-blur-in opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
            Discover
          </span>
          <h2 className="text-4xl leading-tight text-[#1a1a1a] mb-4 text-balance md:text-7xl animate-blur-in opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            Find Your Event
          </h2>
          <p className="text-lg text-[#666666] max-w-md mx-auto animate-blur-in opacity-0" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
            Privacy-first Web3 events powered by Fhenix
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-[#f5f5f5] rounded-full p-1 gap-1 relative">
            <div
              className="absolute top-1 bottom-1 bg-[#1a1a1a] rounded-full transition-all duration-300 ease-out"
              style={{
                left: selectedCategory === "all" ? "4px" : selectedCategory === "hackathon" ? "calc(20% + 2px)" : selectedCategory === "conference" ? "calc(40% + 2px)" : selectedCategory === "workshop" ? "calc(60% + 2px)" : "calc(80% + 2px)",
                width: "calc(20% - 4px)"
              }}
            />
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => handleCategoryChange(category.value)}
                className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.value
                    ? "text-white"
                    : "text-[#666666] hover:text-[#1a1a1a]"
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
          {filteredEvents.map((event, index) => (
            <Link
              key={`${selectedCategory}-${event.id}`}
              href={`/events/${event.id}`}
              className={`group transition-all duration-500 ease-out ${
                isVisible && !isTransitioning ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ transitionDelay: isTransitioning ? "0ms" : `${index * 80}ms` }}
            >
              <div className="bg-white rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02] border border-[#e5e5e5]">
                {/* Image */}
                <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden">
                  <img
                    src={EVENT_IMAGES[index % EVENT_IMAGES.length]}
                    alt={event.name}
                    className="w-full h-full object-cover boty-transition group-hover:scale-105"
                  />
                  {/* Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-white/90 backdrop-blur-sm text-[#1a1a1a] flex items-center gap-1.5 border border-[#e5e5e5]">
                    {event.isPrivate ? (
                      <Lock className="w-3 h-3 text-[#6366f1]" />
                    ) : (
                      <EyeOff className="w-3 h-3 text-[#666666]" />
                    )}
                    {event.isPrivate ? "Private" : "Public"}
                  </span>
                  {/* Tickets Left */}
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs bg-white/90 backdrop-blur-sm text-[#1a1a1a]">
                    {Number(event.maxAttendees) - event.totalTicketsSold} spots left
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg text-[#1a1a1a] mb-1 font-medium">{event.name}</h3>
                  <p className="text-sm text-[#666666] mb-3 line-clamp-2">{event.description}</p>

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
                      <span>{event.totalTicketsSold}/{event.maxAttendees}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[#6366f1]" />
                      <span className="text-sm font-medium text-[#1a1a1a]">{event.ticketPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
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
