"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi"
import { abi } from "@/contracts/abi"
import { parseEther } from "viem"

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`

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

// Demo events for showcase (shown when contract not deployed)
const DEMO_EVENTS: Event[] = [
  {
    id: 1,
    name: "ETHGlobal Singapore",
    description: "The largest Web3 hackathon in Asia with $500K+ in prizes. Join 800+ builders for 48 hours of coding, networking, and innovation.",
    eventDate: BigInt(Date.now() + 45 * 24 * 60 * 60 * 1000),
    maxAttendees: 800,
    isPrivate: false,
    requiresInviteCode: false,
    requiresWhitelist: false,
    totalTicketsSold: 456,
    ticketPrice: "0.05 ETH",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    location: "Singapore",
    category: "hackathon"
  },
  {
    id: 2,
    name: "ETH Denver 2026",
    description: "Community-driven Ethereum conference with hands-on workshops and networking opportunities.",
    eventDate: BigInt(Date.now() + 60 * 24 * 60 * 60 * 1000),
    maxAttendees: 1500,
    isPrivate: false,
    requiresInviteCode: false,
    requiresWhitelist: false,
    totalTicketsSold: 892,
    ticketPrice: "0.08 ETH",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
    location: "Denver, Colorado",
    category: "conference"
  },
  {
    id: 3,
    name: "ZK Proof Workshop",
    description: "Deep dive into zero-knowledge proofs with expert practitioners. Limited spots available.",
    eventDate: BigInt(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxAttendees: 100,
    isPrivate: true,
    requiresInviteCode: true,
    requiresWhitelist: false,
    totalTicketsSold: 67,
    ticketPrice: "Encrypted",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938bd0?w=800&q=80",
    location: "Lisbon, Portugal",
    category: "vip"
  },
  {
    id: 4,
    name: "NFT NYC Summit",
    description: "Premier NFT conference featuring leading artists and collectors from around the world.",
    eventDate: BigInt(Date.now() + 90 * 24 * 60 * 60 * 1000),
    maxAttendees: 2000,
    isPrivate: false,
    requiresInviteCode: false,
    requiresWhitelist: false,
    totalTicketsSold: 1456,
    ticketPrice: "0.1 ETH",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    location: "New York City",
    category: "conference"
  },
  {
    id: 5,
    name: "DeFi Innovation Day",
    description: "Explore the latest in decentralized finance with live demos and panel discussions.",
    eventDate: BigInt(Date.now() + 35 * 24 * 60 * 60 * 1000),
    maxAttendees: 300,
    isPrivate: false,
    requiresInviteCode: false,
    requiresWhitelist: false,
    totalTicketsSold: 198,
    ticketPrice: "0.03 ETH",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    location: "London, UK",
    category: "conference"
  },
  {
    id: 6,
    name: "Layer 2 Workshop",
    description: "Hands-on workshop covering Optimism, Arbitrum, and zkSync development.",
    eventDate: BigInt(Date.now() + 20 * 24 * 60 * 60 * 1000),
    maxAttendees: 150,
    isPrivate: false,
    requiresInviteCode: false,
    requiresWhitelist: false,
    totalTicketsSold: 89,
    ticketPrice: "Free",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    location: "Berlin, Germany",
    category: "workshop"
  },
  {
    id: 7,
    name: "DAO Governance Summit",
    description: "Discuss the future of decentralized governance with DAO leaders.",
    eventDate: BigInt(Date.now() + 75 * 24 * 60 * 60 * 1000),
    maxAttendees: 500,
    isPrivate: true,
    requiresInviteCode: true,
    requiresWhitelist: true,
    totalTicketsSold: 234,
    ticketPrice: "Whitelist Only",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938bd0?w=800&q=80",
    location: "Dubai, UAE",
    category: "vip"
  },
  {
    id: 8,
    name: "Solidity Bootcamp",
    description: "Intensive 3-day bootcamp for learning smart contract development.",
    eventDate: BigInt(Date.now() + 40 * 24 * 60 * 60 * 1000),
    maxAttendees: 50,
    isPrivate: false,
    requiresInviteCode: false,
    requiresWhitelist: false,
    totalTicketsSold: 42,
    ticketPrice: "0.15 ETH",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    location: "Remote",
    category: "workshop"
  }
]

// Check if contract is deployed
const isContractDeployed = CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000"

// Hook for reading events from contract or demo data
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Try to read event count from contract if deployed
  const { data: eventCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "getEventCount",
    query: {
      enabled: isContractDeployed,
    }
  })

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (isContractDeployed && eventCount && eventCount > 0n) {
        // Fetch events from contract
        const fetchedEvents: Event[] = []
        for (let i = 0; i < Number(eventCount); i++) {
          try {
            const eventData = await fetchEventFromContract(i)
            if (eventData) {
              fetchedEvents.push(eventData)
            }
          } catch (e) {
            console.warn(`Failed to fetch event ${i}:`, e)
          }
        }
        setEvents(fetchedEvents.length > 0 ? fetchedEvents : DEMO_EVENTS)
      } else {
        // Use demo events when contract not deployed
        setEvents(DEMO_EVENTS)
      }
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch events")
      setEvents(DEMO_EVENTS) // Fallback to demo data
    } finally {
      setLoading(false)
    }
  }, [eventCount])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}

// Helper function to fetch single event from contract
async function fetchEventFromContract(eventId: number): Promise<Event | null> {
  // This would use wagmi's useReadContract in a real implementation
  // For now, return null to use demo data
  return null
}

export function useEvent(eventId: number) {
  const { events, loading, error } = useEvents()
  const event = events.find(e => e.id === eventId)

  return { event, loading, error }
}

// Hook for getting user's tickets
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
      if (isContractDeployed) {
        // Read user's tickets from contract
        // Implementation would use useReadContract here
        setTickets([])
      } else {
        // Demo mode - no tickets
        setTickets([])
      }
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

// Hook for creating new events
export function useCreateEvent() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()

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
    if (!isConnected || !address) {
      throw new Error("Wallet not connected")
    }

    if (isContractDeployed) {
      // In production, call contract
      // const hash = await writeContract(config, {
      //   address: CONTRACT_ADDRESS,
      //   abi,
      //   functionName: 'createEvent',
      //   args: [params.name, params.description, params.eventDate, BigInt(params.maxAttendees), params.isPrivate, params.requiresInviteCode, params.requiresWhitelist]
      // })
      // await publicClient.waitForTransactionReceipt({ hash })
      // return { hash, eventId: ... }
      throw new Error("Contract not deployed - demo mode")
    } else {
      // Demo mode - simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      return {
        hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        eventId: Date.now()
      }
    }
  }

  return { createEvent, isConnected, address }
}

// Hook for registering for events
export function useRegisterForEvent() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()

  const register = async (eventId: number, accessCode?: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected")
    }

    if (isContractDeployed) {
      // In production, call contract
      // const hash = await writeContract(config, {
      //   address: CONTRACT_ADDRESS,
      //   abi,
      //   functionName: 'mintTicket',
      //   args: [BigInt(eventId), address, false]
      // })
      // await publicClient.waitForTransactionReceipt({ hash })
      // return { hash, ticketId: ... }
      throw new Error("Contract not deployed - demo mode")
    } else {
      // Demo mode - simulate registration with validation
      await new Promise((resolve, reject) => setTimeout(() => {
        if (accessCode === "INVALID") {
          reject(new Error("Invalid access code"))
        } else {
          resolve(true)
        }
      }, 2000))

      return {
        hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        ticketId: Date.now()
      }
    }
  }

  return { register, isConnected, address }
}

// Hook for getting organizer's events
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
      if (isContractDeployed) {
        // Fetch organizer's events from contract filtered by address
        setEvents([])
      } else {
        // Demo mode - show first 3 demo events as "my events"
        setEvents(DEMO_EVENTS.slice(0, 3).map(e => ({...e, name: `My ${e.name}`})))
      }
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