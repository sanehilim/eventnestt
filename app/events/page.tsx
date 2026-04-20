"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { Calendar, MapPin, Users, Ticket, Eye, EyeOff, Lock, SlidersHorizontal, X } from "lucide-react"

type EventCategory = "all" | "music" | "tech" | "art" | "sports" | "business"
type EventPrivacy = "all" | "public" | "private"

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
    badgeIcon: Eye,
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
    price: "0.05 ETH",
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
  },
  {
    id: "nft-launch-party",
    name: "NFT Launch Party",
    description: "Exclusive collection reveal and networking",
    date: "2024-07-05",
    time: "8:00 PM",
    location: "Miami, FL",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    badge: "Whitelist",
    badgeIcon: Eye,
    category: "tech" as EventCategory,
    attendees: 75,
    maxAttendees: 150,
    price: "Encrypted",
    isPrivate: true
  },
  {
    id: "hackathon-2024",
    name: "Privacy Hackathon",
    description: "Build the future of private dApps",
    date: "2024-09-01",
    time: "8:00 AM",
    location: "Remote",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    badge: "Public",
    badgeIcon: EyeOff,
    category: "tech" as EventCategory,
    attendees: 320,
    maxAttendees: 500,
    price: "Free",
    isPrivate: false
  },
  {
    id: "vip-gala",
    name: "VIP Blockchain Gala",
    description: "An evening of luxury and networking",
    date: "2024-08-25",
    time: "7:00 PM",
    location: "Dubai, UAE",
    image: "https://images.unsplash.com/photo-1561489413-985b06da5bee?w=800",
    badge: "VIP",
    badgeIcon: Lock,
    category: "business" as EventCategory,
    attendees: 48,
    maxAttendees: 50,
    price: "VIP Only",
    isPrivate: true
  },
  {
    id: "sports-meetup",
    name: "Crypto Sports Meetup",
    description: "Watch the game, talk Web3",
    date: "2024-07-15",
    time: "3:00 PM",
    location: "Los Angeles, CA",
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800",
    badge: "Public",
    badgeIcon: EyeOff,
    category: "sports" as EventCategory,
    attendees: 89,
    maxAttendees: 200,
    price: "0.02 ETH",
    isPrivate: false
  }
]

const categories = [
  { value: "all" as EventCategory, label: "All Events" },
  { value: "tech" as EventCategory, label: "Tech" },
  { value: "music" as EventCategory, label: "Music" },
  { value: "art" as EventCategory, label: "Art" },
  { value: "business" as EventCategory, label: "Business" },
  { value: "sports" as EventCategory, label: "Sports" }
]

const privacyFilters = [
  { value: "all" as EventPrivacy, label: "All Events" },
  { value: "public" as EventPrivacy, label: "Public Only" },
  { value: "private" as EventPrivacy, label: "Private Only" }
]

export default function EventsPage() {
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (gridRef.current) {
      observer.observe(gridRef.current)
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [selectedCategory, selectedPrivacy])

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
              Discover Events
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance">
              Public & Private Events
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Find events that respect your privacy. All attendee data and access rules stay encrypted on-chain.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-border/50">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden inline-flex items-center gap-2 text-sm text-foreground"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Category Filters */}
              <div className="flex items-center gap-2 bg-secondary rounded-full p-1 border border-border">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setSelectedCategory(category.value)}
                    className={`px-4 py-2 rounded-full text-sm capitalize boty-transition ${
                      selectedCategory === category.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center gap-2 bg-secondary rounded-full p-1 border border-border">
                {privacyFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setSelectedPrivacy(filter.value)}
                    className={`px-4 py-2 rounded-full text-sm capitalize boty-transition flex items-center gap-1.5 ${
                      selectedPrivacy === filter.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {filter.value === "private" && <Lock className="w-3 h-3" />}
                    {filter.value === "public" && <EyeOff className="w-3 h-3" />}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-sm text-muted-foreground">
              {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
            </span>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-background">
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-2xl text-foreground">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="p-2 text-foreground/70 hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
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
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                  <h3 className="text-sm font-medium text-muted-foreground pt-4">Privacy</h3>
                  {privacyFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => {
                        setSelectedPrivacy(filter.value)
                        setShowFilters(false)
                      }}
                      className={`w-full px-6 py-4 rounded-2xl text-left capitalize boty-transition ${
                        selectedPrivacy === filter.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground"
                      }`}
                    >
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
              <Lock className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-serif text-2xl text-foreground mb-2">No events found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to discover more events.</p>
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
  event: typeof events[0]
  index: number
  isVisible: boolean
}) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Link
      href={`/events/${event.id}`}
      className={`group transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="bg-card rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02] border border-border">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-br from-primary/20 via-muted/50 to-muted animate-pulse transition-opacity duration-500 ${
              imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />

          <img
            src={event.image}
            alt={event.name}
            className={`w-full h-full object-cover boty-transition group-hover:scale-105 transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Badge */}
          {event.badge && (
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide bg-card/90 backdrop-blur-sm text-primary flex items-center gap-1.5 border border-primary/20">
              <event.badgeIcon className="w-3 h-3" />
              {event.badge}
            </span>
          )}

          {/* Privacy indicator */}
          <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center boty-shadow">
            {event.isPrivate ? (
              <Lock className="w-4 h-4 text-primary" />
            ) : (
              <EyeOff className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-6">
          <h3 className="font-serif text-xl text-foreground mb-1">{event.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{event.description}</p>

          {/* Meta */}
          <div className="space-y-2 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary/70" />
              <span>{event.date} at {event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary/70" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary/70" />
              <span>{event.attendees}/{event.maxAttendees} attendees</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{event.price}</span>
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-primary boty-transition">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
