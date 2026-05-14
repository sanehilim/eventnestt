"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount, useReadContract, useWriteContract } from "wagmi"
import { createPublicClient, formatEther, http, isAddress, parseEther, parseEventLogs, type AbiEvent } from "viem"
import { abi } from "@/contracts/abi"
import {
  APP_CHAIN,
  APP_RPC_URL,
  ZERO_HASH,
  decodeEventMetadata,
  encodeEventMetadata,
  hashSecret,
} from "@/lib/onchain"

export const CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"
) as `0x${string}`
export const CONTRACT_DEPLOY_BLOCK = BigInt(process.env.NEXT_PUBLIC_CONTRACT_DEPLOY_BLOCK || "0")

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

export interface TicketValidation {
  ticket: Ticket
  event: Event
}

export interface OrganizerPayment {
  eventId: number
  amountWei: bigint
  transactionHash: `0x${string}`
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
  ticketPriceWei: bigint
  isPrivate: boolean
  requiresInviteCode: boolean
  requiresWhitelist: boolean
  totalTicketsSold: bigint
}

function ticketPriceToWei(value?: string) {
  const normalized = value?.trim().replace(/\s*ETH$/i, "") ?? ""
  if (!normalized || normalized.toLowerCase() === "free") {
    return 0n
  }

  return parseEther(normalized)
}

function formatTicketPrice(value: bigint) {
  if (value === 0n) {
    return "Free"
  }

  return `${formatEther(value)} ETH`
}

function formatEthAmount(value: bigint) {
  if (value === 0n) {
    return "0 ETH"
  }

  return `${formatEther(value)} ETH`
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
    ticketPrice: metadata.ticketPrice || formatTicketPrice(raw.ticketPriceWei),
    image: metadata.image || DEFAULT_IMAGE,
    location: metadata.location || "TBD",
    category: metadata.category || "conference",
    organizer,
  }
}

async function waitForReceipt(hash: `0x${string}`) {
  return publicClient.waitForTransactionReceipt({ hash })
}

function getContractEvent(name: string): AbiEvent {
  const event = abi.find((entry) => entry.type === "event" && entry.name === name)
  if (!event) {
    throw new Error(`ABI event not found: ${name}`)
  }
  return event as AbiEvent
}

function assertWriteReady(isConnected: boolean, chainId?: number) {
  if (!isConnected) {
    throw new Error("Wallet not connected")
  }

  if (chainId !== APP_CHAIN.id) {
    throw new Error(`Switch your wallet to ${APP_CHAIN.name}`)
  }

  if (!isContractDeployed) {
    throw new Error("Contract address is not configured")
  }
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
        event: getContractEvent("Transfer"),
        args: { to: address },
        fromBlock: CONTRACT_DEPLOY_BLOCK,
      })
      const ticketIds = [
        ...new Set(
          logs.map((log) => {
            const args = (log as unknown as { args: { tokenId: bigint } }).args
            return Number(args.tokenId)
          }),
        ),
      ]

      const fetchedTickets = await Promise.all(
        ticketIds.map(async (ticketId) => {
          try {
            const holder = (await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi,
              functionName: "ownerOf",
              args: [BigInt(ticketId)],
            })) as string

            if (holder.toLowerCase() !== address.toLowerCase()) {
              return null
            }

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
          } catch {
            return null
          }
        }),
      )

      setTickets(fetchedTickets.filter((ticket): ticket is Ticket => ticket !== null))
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
  const { address, chain, isConnected } = useAccount()
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
    assertWriteReady(isConnected, chain?.id)
    if (!address) throw new Error("Wallet not connected")

    const ticketPriceWei = ticketPriceToWei(params.ticketPrice)
    const ticketPrice = formatTicketPrice(ticketPriceWei)
    const metadataURI = encodeEventMetadata({
      category: params.category,
      image: params.image,
      location: params.location,
      ticketPrice,
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
        ticketPriceWei,
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
    const eventId = createdEvent?.args.eventId as bigint | undefined

    if (eventId === undefined) {
      throw new Error("Event creation transaction did not emit an event ID")
    }

    if (params.requiresInviteCode && params.inviteCode) {
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
  const { address, chain, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const register = async (
    eventId: number,
    accessCode?: string,
  ): Promise<{ hash: `0x${string}`; ticketId: bigint }> => {
    assertWriteReady(isConnected, chain?.id)
    if (!address) throw new Error("Wallet not connected")

    const rawEvent = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "getEvent",
      args: [BigInt(eventId)],
    })) as ContractEvent

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "mintTicket",
      args: [BigInt(eventId), address, false, accessCode ? hashSecret(accessCode) : ZERO_HASH],
      value: rawEvent.ticketPriceWei,
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

export function useOrganizerRevenue() {
  const { address, isConnected } = useAccount()
  const [payments, setPayments] = useState<OrganizerPayment[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRevenue = useCallback(async () => {
    if (!isConnected || !address || !isContractDeployed) {
      setPayments([])
      return
    }

    setLoading(true)
    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: getContractEvent("TicketPaymentReleased"),
        args: { organizer: address },
        fromBlock: CONTRACT_DEPLOY_BLOCK,
      })

      setPayments(
        logs.map((log) => {
          const args = (log as unknown as { args: { eventId?: bigint; amount?: bigint } }).args
          return {
            eventId: Number(args.eventId ?? 0n),
            amountWei: args.amount ?? 0n,
            transactionHash: log.transactionHash,
          }
        }),
      )
    } catch (err) {
      console.error("Error fetching organizer revenue:", err)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [address, isConnected])

  useEffect(() => {
    const run = async () => {
      await fetchRevenue()
    }

    void run()
  }, [fetchRevenue])

  const totalWei = payments.reduce((sum, payment) => sum + payment.amountWei, 0n)

  return {
    loading,
    payments,
    refetch: fetchRevenue,
    totalRevenue: formatEthAmount(totalWei),
    totalWei,
  }
}

export function useManageEventAccess() {
  const { chain, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const updateInviteCode = async (eventId: number, inviteCode: string) => {
    assertWriteReady(isConnected, chain?.id)

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
    assertWriteReady(isConnected, chain?.id)

    const invalidWallet = wallets.find((wallet) => !isAddress(wallet))
    if (invalidWallet) {
      throw new Error(`Invalid wallet address: ${invalidWallet}`)
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

  const removeWhitelist = async (eventId: number, wallet: `0x${string}`) => {
    assertWriteReady(isConnected, chain?.id)

    if (!isAddress(wallet)) {
      throw new Error(`Invalid wallet address: ${wallet}`)
    }

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "removeFromWhitelist",
      args: [BigInt(eventId), wallet],
    })

    await waitForReceipt(hash)
    return hash
  }

  const updateEvent = async (
    eventId: number,
    params: {
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
    },
  ) => {
    assertWriteReady(isConnected, chain?.id)

    const ticketPriceWei = ticketPriceToWei(params.ticketPrice)
    const ticketPrice = formatTicketPrice(ticketPriceWei)
    const metadataURI = encodeEventMetadata({
      category: params.category,
      image: params.image,
      location: params.location,
      ticketPrice,
    })

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "updateEvent",
      args: [
        BigInt(eventId),
        params.name,
        params.description,
        metadataURI,
        params.eventDate,
        BigInt(params.maxAttendees),
        ticketPriceWei,
        params.isPrivate,
        params.requiresInviteCode,
        params.requiresWhitelist,
      ],
    })

    await waitForReceipt(hash)
    return hash
  }

  return { addWhitelist, removeWhitelist, updateEvent, updateInviteCode }
}

export function useTicketActions() {
  const { address, chain, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const transferTicket = async (ticketId: number, to: `0x${string}`) => {
    assertWriteReady(isConnected, chain?.id)
    if (!address) throw new Error("Wallet not connected")

    if (!isAddress(to)) {
      throw new Error(`Invalid recipient address: ${to}`)
    }

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "transferFrom",
      args: [address, to, BigInt(ticketId)],
    })

    await waitForReceipt(hash)
    return hash
  }

  const checkInTicket = async (ticketId: number) => {
    assertWriteReady(isConnected, chain?.id)

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "useTicket",
      args: [BigInt(ticketId)],
    })

    await waitForReceipt(hash)
    return hash
  }

  const burnTicket = async (ticketId: number) => {
    assertWriteReady(isConnected, chain?.id)

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "burnTicket",
      args: [BigInt(ticketId)],
    })

    await waitForReceipt(hash)
    return hash
  }

  const readTicket = async (ticketId: number): Promise<TicketValidation> => {
    if (!isContractDeployed) {
      throw new Error("Contract address is not configured")
    }

    const [ticketInfo, holder] = await Promise.all([
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "getTicket",
        args: [BigInt(ticketId)],
      }) as Promise<[{ eventId: bigint; isVIP: boolean; used: boolean }, ContractEvent]>,
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "ownerOf",
        args: [BigInt(ticketId)],
      }) as Promise<`0x${string}`>,
    ])

    const eventId = Number(ticketInfo[0].eventId)
    const organizer = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "getEventOrganizer",
      args: [BigInt(eventId)],
    })) as `0x${string}`

    return {
      ticket: {
        id: ticketId,
        eventId,
        holder,
        isVIP: ticketInfo[0].isVIP,
        used: ticketInfo[0].used,
      },
      event: contractEventToEvent(eventId, ticketInfo[1], organizer),
    }
  }

  return { burnTicket, checkInTicket, readTicket, transferTicket }
}
