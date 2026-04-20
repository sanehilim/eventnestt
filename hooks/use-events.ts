"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { createPublicClient, http, parseEventLogs } from "viem"
import { abi } from "@/contracts/abi"
import {
  APP_CHAIN,
  APP_RPC_URL,
  ZERO_HASH,
  decodeEventMetadata,
  encodeEventMetadata,
  hashSecret,
} from "@/lib/onchain"

const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"
) as `0x${string}`

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"

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
  organizer?: string
}

export interface Ticket {
  id: number
  eventId: number
  holder: string
  isVIP: boolean
  used: boolean
}

const isContractDeployed = CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000"

const publicClient = createPublicClient({
  chain: APP_CHAIN,
  transport: http(APP_RPC_URL),
})

type ContractEvent = {
  name: string
  description: string
  metadataURI: string
  eventDate: bigint
  maxAttendees: bigint
  isPrivate: boolean
  requiresInviteCode: boolean
  requiresWhitelist: boolean
  totalTicketsSold: bigint
}

function contractEventToEvent(id: number, raw: ContractEvent, organizer?: string): Event {
  const metadata = decodeEventMetadata(raw.metadataURI)
  return {
    id,
    name: raw.name,
    description: raw.description,
    eventDate: raw.eventDate,
    maxAttendees: Number(raw.maxAttendees),
    isPrivate: raw.isPrivate,
    requiresInviteCode: raw.requiresInviteCode,
    requiresWhitelist: raw.requiresWhitelist,
    totalTicketsSold: Number(raw.totalTicketsSold),
    ticketPrice: metadata.ticketPrice || "Free",
    image: metadata.image || DEFAULT_IMAGE,
    location: metadata.location || "TBD",
    category: metadata.category || "conference",
    organizer,
  }
}

async function waitForReceipt(hash: `0x${string}`) {
  return publicClient.waitForTransactionReceipt({ hash })
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { data: eventCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "getEventCount",
    query: { enabled: isContractDeployed },
  })

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      if (isContractDeployed && eventCount !== undefined && eventCount > 0n) {
        const fetched: Event[] = []
        for (let i = 0; i < Number(eventCount); i++) {
          try {
            const [raw, organizer] = await Promise.all([
              publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi,
                functionName: "getEvent",
                args: [BigInt(i)],
              }) as Promise<ContractEvent>,
              publicClient.readContract({
                address: CONTRACT_ADDRESS,
                abi,
                functionName: "getEventOrganizer",
                args: [BigInt(i)],
              }) as Promise<`0x${string}`>,
            ])
            fetched.push(contractEventToEvent(i, raw, organizer))
          } catch {
            // Skip events that cannot be read.
          }
        }
        setEvents(fetched)
      } else {
        setEvents([])
      }
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch events")
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [eventCount])

  useEffect(() => {
    const run = async () => {
      await fetchEvents()
    }

    void run()
  }, [fetchEvents])

  return { events, loading, error, refetch: fetchEvents }
}

export function useEvent(eventId: number) {
  const { events, loading, error } = useEvents()
  const event = events.find((entry) => entry.id === eventId)
  return { event, loading, error }
}

export function useMyTickets() {
  const { address, isConnected } = useAccount()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTickets = useCallback(async () => {
    if (!isConnected || !address || !isContractDeployed) {
      setTickets([])
      return
    }

    setLoading(true)
    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: abi.find((entry) => entry.type === "event" && entry.name === "TicketMinted")!,
        args: { holder: address },
        fromBlock: 0n,
      })

      const fetchedTickets = await Promise.all(
        logs.map(async (log) => {
          const ticketId = Number(log.args.ticketId)
          const holder = log.args.holder as string
          const ticketInfo = (await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi,
            functionName: "getTicket",
            args: [BigInt(ticketId)],
          })) as [{ eventId: bigint; isVIP: boolean; used: boolean }, ContractEvent]

          return {
            id: ticketId,
            eventId: Number(ticketInfo[0].eventId),
            holder,
            isVIP: ticketInfo[0].isVIP,
            used: ticketInfo[0].used,
          } satisfies Ticket
        }),
      )

      setTickets(fetchedTickets)
    } catch (err) {
      console.error("Error fetching tickets:", err)
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    const run = async () => {
      await fetchTickets()
    }

    void run()
  }, [fetchTickets])

  return { tickets, loading, refetch: fetchTickets }
}

export function useCreateEvent() {
  const { address, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const createEvent = async (params: {
    name: string
    description: string
    eventDate: bigint
    maxAttendees: number
    isPrivate: boolean
    requiresInviteCode: boolean
    requiresWhitelist: boolean
    ticketPrice: string
    location: string
    category: string
    image?: string
    inviteCode?: string
  }): Promise<{ eventId: bigint; hash: `0x${string}`; inviteCode?: string }> => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected")
    }

    if (!isContractDeployed) {
      throw new Error("Contract address is not configured")
    }

    const metadataURI = encodeEventMetadata({
      category: params.category,
      image: params.image,
      location: params.location,
      ticketPrice: params.ticketPrice || "Free",
    })

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "createEvent",
      args: [
        params.name,
        params.description,
        metadataURI,
        params.eventDate,
        BigInt(params.maxAttendees),
        params.isPrivate,
        params.requiresInviteCode,
        params.requiresWhitelist,
      ],
    })

    const receipt = await waitForReceipt(hash)
    const parsedLogs = parseEventLogs({
      abi,
      logs: receipt.logs,
    })

    const createdEvent = parsedLogs.find((entry) => entry.eventName === "EventCreated")
    const eventId = (createdEvent?.args.eventId as bigint | undefined) ?? 0n

    if (eventId > 0n && params.requiresInviteCode && params.inviteCode) {
      const inviteHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "setInviteCode",
        args: [eventId, hashSecret(params.inviteCode)],
      })
      await waitForReceipt(inviteHash)
    }

    return { hash, eventId, inviteCode: params.inviteCode }
  }

  return { createEvent, isConnected, address }
}

export function useRegisterForEvent() {
  const { address, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const register = async (
    eventId: number,
    accessCode?: string,
  ): Promise<{ hash: `0x${string}`; ticketId: bigint }> => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected")
    }

    if (!isContractDeployed) {
      throw new Error("Contract address is not configured")
    }

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "mintTicket",
      args: [BigInt(eventId), address, false, accessCode ? hashSecret(accessCode) : ZERO_HASH],
    })

    const receipt = await waitForReceipt(hash)
    const parsedLogs = parseEventLogs({
      abi,
      logs: receipt.logs,
    })

    const mintedTicket = parsedLogs.find((entry) => entry.eventName === "TicketMinted")
    const ticketId = (mintedTicket?.args.ticketId as bigint | undefined) ?? 0n

    return { hash, ticketId }
  }

  return { register, isConnected, address }
}

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
      if (!isContractDeployed) {
        setEvents([])
        return
      }

      const eventCount = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "getEventCount",
      })) as bigint

      const fetched: Event[] = []
      for (let i = 0; i < Number(eventCount); i++) {
        try {
          const organizer = (await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi,
            functionName: "getEventOrganizer",
            args: [BigInt(i)],
          })) as string

          if (organizer.toLowerCase() !== address.toLowerCase()) {
            continue
          }

          const raw = (await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi,
            functionName: "getEvent",
            args: [BigInt(i)],
          })) as ContractEvent

          fetched.push(contractEventToEvent(i, raw, organizer))
        } catch {
          // Skip events that cannot be read.
        }
      }

      setEvents(fetched)
    } catch (err) {
      console.error("Error fetching my events:", err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    const run = async () => {
      await fetchMyEvents()
    }

    void run()
  }, [fetchMyEvents])

  return { events, loading, refetch: fetchMyEvents }
}

export function useManageEventAccess() {
  const { isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const updateInviteCode = async (eventId: number, inviteCode: string) => {
    if (!isConnected) {
      throw new Error("Wallet not connected")
    }

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "setInviteCode",
      args: [BigInt(eventId), hashSecret(inviteCode)],
    })

    await waitForReceipt(hash)
    return hash
  }

  const addWhitelist = async (eventId: number, wallets: `0x${string}`[]) => {
    if (!isConnected) {
      throw new Error("Wallet not connected")
    }

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: wallets.length === 1 ? "addToWhitelist" : "batchAddToWhitelist",
      args: wallets.length === 1 ? [BigInt(eventId), wallets[0]] : [BigInt(eventId), wallets],
    })

    await waitForReceipt(hash)
    return hash
  }

  return { addWhitelist, updateInviteCode }
}
