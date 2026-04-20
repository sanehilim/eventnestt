"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Calendar, MapPin, Users, Ticket, EyeOff, Lock } from "lucide-react"

type EventCategory = "all" | "music" | "tech" | "art" | "sports" | "business"

const events = [
  {
    id: "web3-summit-2024",
    name: "Web3 Privacy Summit",
    description: "The future of on-chain privacy and FHE",
    date: "2024-06-15",
    location: "San Francisco, CA",
    image: "/image.png",
    badge: "Private",
    badgeIcon: Lock,
    category: "tech" as EventCategory,
    attendees: 250,
    maxAttendees: 500,
    isPrivate: true
  },
  {
    id: "crypto-art-expo",
    name: "Crypto Art Expo",
    description: "NFT galleries and digital art showcases",
    date: "2024-07-20",
    location: "New York, NY",
    image: "/image.png",
    badge: "VIP",
    badgeIcon: Lock,
    category: "art" as EventCategory,
    attendees: 180,
    maxAttendees: 200,
    isPrivate: true
  },
  {
    id: "defi-conference",
    name: "DeFi Innovation Conference",
    description: "Decentralized finance breakthroughs",
    date: "2024-08-10",
    location: "London, UK",
    image: "/image.png",
    badge: "Public",
    badgeIcon: EyeOff,
    category: "business" as EventCategory,
    attendees: 450,
    maxAttendees: 1000,
    isPrivate: false
  },
  {
    id: "underground-rave",
    name: "Underground Rave",
    description: "Exclusive electronic music experience",
    date: "2024-06-30",
    location: "Berlin, Germany",
    image: "/image.png",
    badge: "Invite Only",
    badgeIcon: Lock,
    category: "music" as EventCategory,
    attendees: 99,
    maxAttendees: 100,
    isPrivate: true
  }
]

const categories = [
  { value: "all" as EventCategory, label: "All" },
  { value: "tech" as EventCategory, label: "Tech" },
  { value: "music" as EventCategory, label: "Music" },
  { value: "art" as EventCategory, label: "Art" },
  { value: "business" as EventCategory, label: "Business" }
]

export function EventGrid() {
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
    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (gridRef.current) {
      gridObserver.observe(gridRef.current)
    }

    return () => {
      if (gridRef.current) {
        gridObserver.unobserve(gridRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm tracking-[0.3em] uppercase text-[#6366f1] mb-4 block animate-blur-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            Discover
          </span>
          <h2 className="text-4xl leading-tight text-[#1a1a1a] mb-4 text-balance md:text-7xl animate-blur-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            Find Your Event
          </h2>
          <p className="text-lg text-[#666666] max-w-md mx-auto animate-blur-in opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
            Privacy-first events that respect your data
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-[#f5f5f5] rounded-full p-1 gap-1 relative">
            <div
              className="absolute top-1 bottom-1 bg-[#1a1a1a] rounded-full transition-all duration-300 ease-out"
              style={{
                left: selectedCategory === 'all' ? '4px' : selectedCategory === 'tech' ? 'calc(20% + 2px)' : selectedCategory === 'music' ? 'calc(40% + 2px)' : selectedCategory === 'art' ? 'calc(60% + 2px)' : 'calc(80% + 2px)',
                width: 'calc(20% - 4px)'
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
                isVisible && !isTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ transitionDelay: isTransitioning ? '0ms' : `${index * 80}ms` }}
            >
              <div className="bg-white rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02] border border-[#e5e5e5]">
                {/* Image */}
                <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover boty-transition group-hover:scale-105"
                  />
                  {/* Badge */}
                  {event.badge && (
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-white/90 backdrop-blur-sm text-[#1a1a1a] flex items-center gap-1.5 border border-[#e5e5e5]">
                      <event.badgeIcon className="w-3 h-3 text-[#6366f1]" />
                      {event.badge}
                    </span>
                  )}
                  {/* Privacy indicator */}
                  <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center boty-shadow">
                    {event.isPrivate ? (
                      <Lock className="w-4 h-4 text-[#6366f1]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[#666666]" />
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg text-[#1a1a1a] mb-1">{event.name}</h3>
                  <p className="text-sm text-[#666666] mb-3">{event.description}</p>

                  {/* Meta */}
                  <div className="space-y-2 text-sm text-[#666666] mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#6366f1]/70" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#6366f1]/70" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#6366f1]/70" />
                      <span>{event.attendees}/{event.maxAttendees}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-[#6366f1]" />
                      <span className="text-sm font-medium text-[#1a1a1a]">Get Tickets</span>
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