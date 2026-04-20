"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi"
import { abi } from "@/contracts/EventNestTicket"

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"

export interface Event {
  id: number
  name: string
  description: string
  eventDate: bigint
  maxAttendees: number
  isPrivate: boolean
  requiresInviteCode: boolean
  requiresWhitelist: boolean
  totalTicketsSold: number
  ticketPrice: string
  image: string
  location: string
  category: string
}

export interface Ticket {
  id: number
  eventId: number
  holder: string
  isVIP: boolean
  used: boolean
}

// Mock events for demo (when contract not deployed)
const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    name: "ETHGlobal Bangkok",
    description: "The biggest Ethereum hackathon in Southeast Asia",
    eventDate: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxAttendees: 500,
    isPrivate: false,
    requiresInviteCode: false,
    requiresWhitelist: false,
    totalTicketsSold: 234,
    ticketPrice: "0.05 ETH",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    location: "Bangkok, Thailand",
    category: "hackathon"
  },
  {
    id: 2,
    name: "NFT NYC",
    description: "Premier NFT conference and exhibition",
    eventDate: BigInt(Date.now() + 45 * 24 * 60 * 60 * 1000),
    maxAttendees: 200,
    isPrivate: true,
    requiresInviteCode: true,
    requiresWhitelist: false,
    totalTicketsSold: 156,
    ticketPrice: "Encrypted",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    location: "New York, USA",
    category: "conference"
  },
  {
    id: 3,
    name: "Devcon VII",
    description: "Ethereum's premier developer conference",
    eventDate: BigInt(Date.now() + 60 * 24 * 60 * 60 * 1000),
    maxAttendees: 1000,
    isPrivate: false,
    requiresInviteCode: false,
    requiresWhitelist: false,
    totalTicketsSold: 789,
    ticketPrice: "0.1 ETH",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
    location: "Prague, Czech Republic",
    category: "conference"
  },
  {
    id: 4,
    name: "ETH Denver",
    description: "Community-driven Ethereum conference",
    eventDate: BigInt(Date.now() + 90 * 24 * 60 * 60 * 1000),
    maxAttendees: 800,
    isPrivate: false,
    requiresInviteCode: false,
    requiresWhitelist: false,
    totalTicketsSold: 456,
    ticketPrice: "0.08 ETH",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
    location: "Denver, USA",
    category: "conference"
  },
  {
    id: 5,
    name: "Worldcoin World ID Launch",
    description: "Exclusive launch event for Worldcoin holders",
    eventDate: BigInt(Date.now() + 15 * 24 * 60 * 60 * 1000),
    maxAttendees: 100,
    isPrivate: true,
    requiresInviteCode: true,
    requiresWhitelist: true,
    totalTicketsSold: 87,
    ticketPrice: "Whitelist Only",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938bd0?w=800",
    location: "Dubai, UAE",
    category: "vip"
  },
  {
    id: 6,
    name: "ZK Week",
    description: "Zero-knowledge proofs deep dive",
    eventDate: BigInt(Date.now() + 120 * 24 * 60 * 60 * 1000),
    maxAttendees: 300,
    isPrivate: false,
    requiresInviteCode: false,
    requiresWhitelist: false,
    totalTicketsSold: 189,
    ticketPrice: "Free",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938bd0?w=800",
    location: "Lisbon, Portugal",
    category: "workshop"
  },
  {
    id: 7,
    name: "Bitcoin 2025",
    description: "Annual Bitcoin conference and networking",
    eventDate: BigInt(Date.now() + 75 * 24 * 60 * 60 * 1000),
    maxAttendees: 2000,
    isPrivate: false,
    requiresInviteCode: false,
    requiresWhitelist: false,
    totalTicketsSold: 1567,
    ticketPrice: "0.15 ETH",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800",
    location: "Miami, USA",
    category: "conference"
  },
  {
    id: 8,
    name: "DeFi Summit",
    description: "Decentralized finance innovation showcase",
    eventDate: BigInt(Date.now() + 50 * 24 * 60 * 60 * 1000),
    maxAttendees: 400,
    isPrivate: false,
    requiresInviteCode: false,
    requiresWhitelist: false,
    totalTicketsSold: 312,
    ticketPrice: "0.06 ETH",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938bd0?w=800",
    location: "London, UK",
    category: "conference"
  }
]

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to read from contract first
      if (CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        // Contract is deployed, read from blockchain
        // For now, use mock data until contract is deployed
        setEvents(MOCK_EVENTS)
      } else {
        // Use mock events for demo
        setEvents(MOCK_EVENTS)
      }
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch events")
      setEvents(MOCK_EVENTS) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}

export function useEvent(eventId: number) {
  const { events, loading, error } = useEvents()
  const event = events.find(e => e.id === eventId)

  return { event, loading, error }
}

export function useMyTickets() {
  const { address, isConnected } = useAccount()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTickets = useCallback(async () => {
    if (!isConnected || !address) {
      setTickets([])
      return
    }

    setLoading(true)
    try {
      // In production, read from contract
      // For demo, return empty array until contract is deployed
      setTickets([])
    } catch (err) {
      console.error("Error fetching tickets:", err)
    } finally {
      setLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  return { tickets, loading, refetch: fetchTickets }
}

export function useCreateEvent() {
  const { address, isConnected } = useWriteContract()

  const createEvent = async (params: {
    name: string
    description: string
    eventDate: bigint
    maxAttendees: number
    isPrivate: boolean
    requiresInviteCode: boolean
    requiresWhitelist: boolean
    ticketPrice: string
  }) => {
    if (!isConnected) {
      throw new Error("Wallet not connected")
    }

    // In production, call contract
    // For demo, simulate transaction
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          hash: "0x" + Math.random().toString(16).slice(2) + "".repeat(60),
          eventId: Date.now()
        })
      }, 2000)
    })
  }

  return { createEvent, isConnected, address }
}

export function useRegisterForEvent() {
  const { address, isConnected } = useWriteContract()

  const register = async (eventId: number, accessCode?: string) => {
    if (!isConnected) {
      throw new Error("Wallet not connected")
    }

    // In production, call contract
    // For demo, simulate transaction
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (accessCode === "INVALID") {
          reject(new Error("Invalid access code"))
        } else {
          resolve({
            hash: "0x" + Math.random().toString(16).slice(2) + "".repeat(60),
            ticketId: Date.now()
          })
        }
      }, 2000)
    })
  }

  return { register, isConnected, address }
}

// Event creation hooks for organizers
export function useMyEvents() {
  const { address, isConnected } = useAccount()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)

  const fetchMyEvents = useCallback(async () => {
    if (!isConnected || !address) {
      setEvents([])
      return
    }

    setLoading(true)
    try {
      // In production, read from contract filtered by organizer
      // For demo, return user's events
      const myMockEvents = MOCK_EVENTS.slice(0, 3).map(e => ({...e, name: `My ${e.name}`}))
      setEvents(myMockEvents)
    } catch (err) {
      console.error("Error fetching my events:", err)
    } finally {
      setLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    fetchMyEvents()
  }, [fetchMyEvents])

  return { events, loading, refetch: fetchMyEvents }
}
