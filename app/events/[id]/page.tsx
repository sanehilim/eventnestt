"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Calendar, MapPin, Users, Ticket, Lock, Eye, EyeOff, Shield, ArrowLeft, ArrowRight, Check, AlertCircle, Key } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ConnectButton } from "@rainbow-me/rainbowkit"

const eventDetails: Record<string, {
  id: string
  name: string
  description: string
  longDescription: string
  date: string
  time: string
  location: string
  image: string
  badge: string
  badgeIcon: typeof Lock
  attendees: number
  maxAttendees: number
  price: string
  priceWei?: string
  isPrivate: boolean
  features: string[]
  organizer: string
  contractAddress: string
}> = {
  "web3-summit-2024": {
    id: "web3-summit-2024",
    name: "Web3 Privacy Summit",
    description: "The future of on-chain privacy and FHE",
    longDescription: "Join us for the premier event focused on privacy-preserving technologies in Web3. Learn how Fhenix and Fully Homomorphic Encryption are revolutionizing on-chain confidentiality.",
    date: "2024-06-15",
    time: "10:00 AM",
    location: "San Francisco, CA",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
    badge: "Private",
    badgeIcon: Lock,
    attendees: 250,
    maxAttendees: 500,
    price: "Encrypted",
    isPrivate: true,
    features: [
      "Encrypted attendee list",
      "Private pricing tiers",
      "VIP access control",
      "On-chain verification"
    ],
    organizer: "0x1234...5678",
    contractAddress: "0xabcd...efgh"
  },
  "crypto-art-expo": {
    id: "crypto-art-expo",
    name: "Crypto Art Expo",
    description: "NFT galleries and digital art showcases",
    longDescription: "Experience the intersection of art and blockchain technology. Exclusive NFT galleries, artist meetups, and live auctions.",
    date: "2024-07-20",
    time: "6:00 PM",
    location: "New York, NY",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
    badge: "VIP",
    badgeIcon: Eye,
    attendees: 180,
    maxAttendees: 200,
    price: "Whitelist Only",
    isPrivate: true,
    features: [
      "VIP whitelist access",
      "Exclusive NFT drops",
      "Private artist sessions",
      "Encrypted bidding"
    ],
    organizer: "0x9876...4321",
    contractAddress: "0xijkl...mnop"
  }
}

const defaultEvent = {
  id: "web3-summit-2024",
  name: "Web3 Privacy Summit",
  description: "The future of on-chain privacy and FHE",
  longDescription: "Join us for the premier event focused on privacy-preserving technologies in Web3. Learn how Fhenix and Fully Homomorphic Encryption are revolutionizing on-chain confidentiality.",
  date: "2024-06-15",
  time: "10:00 AM",
  location: "San Francisco, CA",
  image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
  badge: "Private",
  badgeIcon: Lock,
  attendees: 250,
  maxAttendees: 500,
  price: "Encrypted",
  isPrivate: true,
  features: [
    "Encrypted attendee list",
    "Private pricing tiers",
    "VIP access control",
    "On-chain verification"
  ],
  organizer: "0x1234...5678",
  contractAddress: "0xabcd...efgh"
}

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const event = eventDetails[eventId] || { ...defaultEvent, id: eventId, name: eventId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }

  const [accessCode, setAccessCode] = useState("")
  const [showAccessForm, setShowAccessForm] = useState(false)
  const [accessStatus, setAccessStatus] = useState<"idle" | "verifying" | "approved" | "denied">("idle")
  const [isRegistered, setIsRegistered] = useState(false)

  const handleAccessRequest = () => {
    if (!accessCode.trim()) return
    setAccessStatus("verifying")

    setTimeout(() => {
      setAccessStatus("approved")
      setIsRegistered(true)
    }, 2000)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary boty-transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Image & Info */}
            <div>
              <div className="relative aspect-video rounded-3xl overflow-hidden boty-shadow mb-8">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 rounded-full text-sm tracking-wide bg-card/90 backdrop-blur-sm text-primary flex items-center gap-2 border border-primary/20">
                    <event.badgeIcon className="w-4 h-4" />
                    {event.badge}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center">
                  {event.isPrivate ? (
                    <Lock className="w-5 h-5 text-primary" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-card rounded-3xl p-8 border border-border">
                <h2 className="font-serif text-2xl text-foreground mb-6">Event Details</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-foreground/80">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground/80">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground/80">
                    <Users className="w-5 h-5 text-primary" />
                    <span>{event.attendees}/{event.maxAttendees} attendees</span>
                  </div>
                  <div className="flex items-center gap-3 text-foreground/80">
                    <Ticket className="w-5 h-5 text-primary" />
                    <span>{event.price}</span>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  {event.longDescription}
                </p>
              </div>
            </div>

            {/* Right Column - Registration */}
            <div>
              <div className="bg-card rounded-3xl p-8 border border-border sticky top-28">
                <h1 className="font-serif text-4xl text-foreground mb-4">{event.name}</h1>
                <p className="text-lg text-muted-foreground mb-6">{event.description}</p>

                {/* Privacy Features */}
                <div className="bg-secondary rounded-2xl p-6 mb-8 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">Privacy Features</span>
                  </div>
                  <ul className="space-y-3">
                    {event.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Registration Section */}
                {isRegistered ? (
                  <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-serif text-xl text-foreground mb-2">You are registered!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your ticket has been issued as an NFT. Check your wallet for your ticket.
                    </p>
                    <Link
                      href="/tickets"
                      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-primary/90"
                    >
                      View My Tickets
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : event.isPrivate && !showAccessForm ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-serif text-xl text-foreground mb-2">Private Event</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      This event requires an access code or invitation to register.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAccessForm(true)}
                      className="bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
                    >
                      Request Access
                    </button>
                  </div>
                ) : event.isPrivate ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">Enter Access Code</span>
                    </div>

                    {accessStatus === "denied" && (
                      <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/20 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                        <span className="text-sm text-destructive">Invalid access code. Please try again or request an invitation.</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Enter your access code or invite PIN"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 boty-transition"
                      />

                      <ConnectButton.Custom>
                        {({ account, chain, openConnectModal, mounted }) => (
                          <div {...(!mounted && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none' } })}>
                            {account ? (
                              <button
                                type="button"
                                onClick={handleAccessRequest}
                                disabled={accessStatus === "verifying" || !accessCode.trim()}
                                className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {accessStatus === "verifying" ? (
                                  <>
                                    <span className="animate-spin">
                                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                      </svg>
                                    </span>
                                    Verifying...
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4" />
                                    Verify & Register
                                  </>
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={openConnectModal}
                                className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
                              >
                                Connect Wallet to Register
                              </button>
                            )}
                          </div>
                        )}
                      </ConnectButton.Custom>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      Your access code is encrypted and verified on-chain using Fhenix.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <ConnectButton.Custom>
                      {({ account, chain, openConnectModal, openChainModal, openAccountModal, mounted }) => (
                        <div {...(!mounted && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none' } })}>
                          {!mounted || !account ? (
                            <button
                              type="button"
                              onClick={openConnectModal}
                              className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
                            >
                              Connect Wallet to Register
                            </button>
                          ) : chain?.unsupported ? (
                            <button
                              type="button"
                              onClick={openChainModal}
                              className="w-full bg-destructive text-destructive-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition"
                            >
                              Wrong Network
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
                              onClick={() => setIsRegistered(true)}
                            >
                              Register for Event
                            </button>
                          )}
                        </div>
                      )}
                    </ConnectButton.Custom>

                    <div className="bg-secondary rounded-xl p-4 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">What you get:</span>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li> NFT ticket stored in your wallet</li>
                        <li> On-chain verification</li>
                        <li> Transferable ticket</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Contract Info */}
                <div className="mt-8 pt-8 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Contract: <span className="font-mono">{event.contractAddress}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Organizer: <span className="font-mono">{event.organizer}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
