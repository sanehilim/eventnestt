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
    time: "10:00 AM",
    location: "San Francisco, CA",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    badge: "Private",
    badgeIcon: Lock,
    category: "tech" as EventCategory,
    attendees: 250,
    maxAttendees: 500,
    price: "Encrypted",
    isPrivate: true
  },
  {
    id: "crypto-art-expo",
    name: "Crypto Art Expo",
    description: "NFT galleries and digital art showcases",
    date: "2024-07-20",
    time: "6:00 PM",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    badge: "VIP",
    badgeIcon: Lock,
    category: "art" as EventCategory,
    attendees: 180,
    maxAttendees: 200,
    price: "Whitelist Only",
    isPrivate: true
  },
  {
    id: "defi-conference",
    name: "DeFi Innovation Conference",
    description: "Decentralized finance breakthroughs",
    date: "2024-08-10",
    time: "9:00 AM",
    location: "London, UK",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
    badge: "Public",
    badgeIcon: EyeOff,
    category: "business" as EventCategory,
    attendees: 450,
    maxAttendees: 1000,
    price: "Free",
    isPrivate: false
  },
  {
    id: "underground-rave",
    name: "Underground Rave",
    description: "Exclusive electronic music experience",
    date: "2024-06-30",
    time: "11:00 PM",
    location: "Berlin, Germany",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    badge: "Invite Only",
    badgeIcon: Lock,
    category: "music" as EventCategory,
    attendees: 99,
    maxAttendees: 100,
    price: "PIN Required",
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
    <section className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block animate-blur-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            Discover
          </span>
          <h2 className="text-4xl leading-tight text-foreground mb-4 text-balance md:text-7xl animate-blur-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            Find Your Event
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto animate-blur-in opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
            Privacy-first events that respect your data
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-background rounded-full p-1 gap-1 relative">
            <div
              className="absolute top-1 bottom-1 bg-primary rounded-full transition-all duration-300 ease-out"
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
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
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
              <div className="bg-background rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02]">
                {/* Image */}
                <div className="relative aspect-square bg-muted overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover boty-transition group-hover:scale-105"
                  />
                  {/* Badge */}
                  {event.badge && (
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-white/90 backdrop-blur-sm text-foreground flex items-center gap-1.5">
                      <event.badgeIcon className="w-3 h-3" />
                      {event.badge}
                    </span>
                  )}
                  {/* Privacy indicator */}
                  <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center boty-shadow">
                    {event.isPrivate ? (
                      <Lock className="w-4 h-4 text-primary" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg text-foreground mb-1">{event.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{event.description}</p>

                  {/* Meta */}
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary/70" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary/70" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary/70" />
                      <span>{event.attendees}/{event.maxAttendees}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{event.price}</span>
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
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90 boty-shadow"
          >
            View All Events
          </Link>
        </div>
      </div>
    </section>
  )
}