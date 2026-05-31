"use client"

import { useState, useEffect, useCallback } from "react"
import { useAccount, useReadContract, useWalletClient, useWriteContract } from "wagmi"
import { createPublicClient, formatEther, http, isAddress, parseEther, parseEventLogs, type AbiEvent } from "viem"
import { abi } from "@/contracts/abi"
import {
  APP_CHAIN,
  APP_DEPLOYMENT,
  APP_RPC_URL,
  ZERO_HASH,
  buildEventMetadataURI,
  normalizeEventImageUrl,
  resolveEventMetadata,
} from "@/lib/onchain"
import type { EncryptedUint128ContractInput } from "@/lib/cofhe"

export const CONTRACT_ADDRESS = APP_DEPLOYMENT.contractAddress
export const CONTRACT_DEPLOY_BLOCK = APP_DEPLOYMENT.deployBlock

export interface Event {
  id: number
  name: string
  description: string
  eventDate: bigint
  maxAttendees: number
  isPrivate: boolean
  requiresInviteCode: boolean
  requiresWhitelist: boolean
  requiresConfidentialAccess: boolean
  totalTicketsSold: number
  ticketPrice: string
  tiers: TicketTier[]
  image: string
  location: string
  category: string
  organizer?: string
}

export interface TicketTier {
  id: number
  name: string
  capacity: number
  priceWei: bigint
  price: string
  transferable: boolean
  active: boolean
  totalSold: number
}

export interface Ticket {
  id: number
  eventId: number
  holder: string
  isVIP: boolean
  used: boolean
  tierId: number
}

export interface TicketValidation {
  ticket: Ticket
  event: Event
}

export interface OrganizerPayment {
  eventId: number
  amountWei: bigint
  transactionHash: `0x${string}`
  type: "received" | "withdrawn"
}

export interface WhitelistEntry {
  wallet: `0x${string}`
  isWhitelisted: boolean
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
  requiresConfidentialAccess: boolean
}

type ContractTicketTier = {
  name: string
  capacity: bigint
  priceWei: bigint
  transferable: boolean
  active: boolean
  totalSold: bigint
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

function contractTierToTicketTier(id: number, raw: ContractTicketTier): TicketTier {
  return {
    id,
    name: raw.name,
    capacity: Number(raw.capacity),
    priceWei: raw.priceWei,
    price: formatTicketPrice(raw.priceWei),
    transferable: raw.transferable,
    active: raw.active,
    totalSold: Number(raw.totalSold),
  }
}

function formatEthAmount(value: bigint) {
  if (value === 0n) {
    return "0 ETH"
  }

  return `${formatEther(value)} ETH`
}

async function contractEventToEvent(id: number, raw: ContractEvent, organizer?: string, tiers: TicketTier[] = []): Promise<Event> {
  const metadata = await resolveEventMetadata(raw.metadataURI)
  const activeTiers = tiers.filter((tier) => tier.active)
  const primaryTier = activeTiers[0] || tiers[0]
  return {
    id,
    name: raw.name,
    description: raw.description,
    eventDate: raw.eventDate,
    maxAttendees: Number(raw.maxAttendees),
    isPrivate: raw.isPrivate,
    requiresInviteCode: raw.requiresInviteCode,
    requiresWhitelist: raw.requiresWhitelist,
    requiresConfidentialAccess: raw.requiresConfidentialAccess,
    totalTicketsSold: Number(raw.totalTicketsSold),
    ticketPrice: primaryTier?.price || metadata.ticketPrice || formatTicketPrice(raw.ticketPriceWei),
    tiers,
    image: normalizeEventImageUrl(metadata.image),
    location: metadata.location || "TBD",
    category: metadata.category || "conference",
    organizer,
  }
}

async function waitForReceipt(hash: `0x${string}`) {
  return publicClient.waitForTransactionReceipt({ hash })
}

function normalizeTierInputs(
  tiers: Array<{ name: string; capacity: number; price?: string; transferable: boolean; active: boolean }> | undefined,
  fallbackCapacity: number,
  fallbackPrice: string,
) {
  const suppliedTiers = tiers ?? []
  const normalizedTiers = suppliedTiers
    .map((tier) => ({
      name: tier.name.trim(),
      capacity: BigInt(Math.max(0, Math.floor(tier.capacity))),
      priceWei: ticketPriceToWei(tier.price),
      transferable: tier.transferable,
      active: tier.active,
    }))

  if (normalizedTiers.some((tier) => tier.active && (!tier.name || tier.capacity === 0n))) {
    throw new Error("Active ticket tiers need a name and capacity")
  }

  const configuredTiers = normalizedTiers
    .filter((tier) => tier.name && tier.capacity > 0n)

  if (configuredTiers.length > 0) {
    if (!configuredTiers.some((tier) => tier.active)) {
      throw new Error("At least one ticket tier must be active")
    }
    if (configuredTiers.length > 16) {
      throw new Error("An event can have at most 16 ticket tiers")
    }
    return configuredTiers
  }

  if (suppliedTiers.length > 0) {
    throw new Error("At least one valid ticket tier is required")
  }

  return [
    {
      name: "General",
      capacity: BigInt(fallbackCapacity),
      priceWei: ticketPriceToWei(fallbackPrice),
      transferable: true,
      active: true,
    },
  ]
}

async function readEventTiers(eventId: number): Promise<TicketTier[]> {
  try {
    const rawTiers = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "getTicketTiers",
      args: [BigInt(eventId)],
    })) as ContractTicketTier[]

    return rawTiers.map((tier, index) => contractTierToTicketTier(index, tier))
  } catch {
    return []
  }
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
            const tiers = await readEventTiers(i)
            fetched.push(await contractEventToEvent(i, raw, organizer, tiers))
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
            })) as [{ eventId: bigint; isVIP: boolean; used: boolean; tierId: number }, ContractEvent]

            return {
              id: ticketId,
              eventId: Number(ticketInfo[0].eventId),
              holder,
              isVIP: ticketInfo[0].isVIP,
              used: ticketInfo[0].used,
              tierId: Number(ticketInfo[0].tierId),
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
  const { data: walletClient } = useWalletClient()
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
    ticketTiers?: Array<{
      name: string
      capacity: number
      price?: string
      transferable: boolean
      active: boolean
    }>
  }): Promise<{ eventId: bigint; hash: `0x${string}`; inviteCode?: string }> => {
    assertWriteReady(isConnected, chain?.id)
    if (!address) throw new Error("Wallet not connected")

    const tiers = normalizeTierInputs(params.ticketTiers, params.maxAttendees, params.ticketPrice)
    const activeTierCapacity = tiers
      .filter((tier) => tier.active)
      .reduce((sum, tier) => sum + Number(tier.capacity), 0)
    const eventCapacity = Math.max(params.maxAttendees, activeTierCapacity)
    const ticketPriceWei = tiers[0]?.priceWei ?? ticketPriceToWei(params.ticketPrice)
    const ticketPrice = formatTicketPrice(ticketPriceWei)
    const metadataURI = await buildEventMetadataURI({
      name: params.name,
      description: params.description,
      category: params.category,
      image: params.image,
      location: params.location,
      ticketPrice,
    })
    let encryptedInviteCredential: EncryptedUint128ContractInput | undefined

    if (params.requiresInviteCode && params.inviteCode) {
      if (!walletClient) {
        throw new Error("Wallet client is not ready for CoFHE encryption")
      }
      const { connectCofhe, encryptCredential } = await import("@/lib/cofhe")
      await connectCofhe(publicClient, walletClient)
      encryptedInviteCredential = await encryptCredential(params.inviteCode)
    }

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "createEventWithTiers",
      args: [
        params.name,
        params.description,
        metadataURI,
        params.eventDate,
        BigInt(eventCapacity),
        ticketPriceWei,
        params.isPrivate,
        params.requiresInviteCode,
        params.requiresWhitelist,
        Boolean(params.requiresInviteCode && params.inviteCode),
        tiers,
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

    if (encryptedInviteCredential) {
      try {
        const inviteHash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "setConfidentialInviteCode",
          args: [eventId, encryptedInviteCredential],
        })
        await waitForReceipt(inviteHash)
      } catch (error) {
        throw new Error(
          `Event #${eventId.toString()} was created, but encrypted invite setup failed. Open the event dashboard and rotate the invite code before sharing it. ${error instanceof Error ? error.message : ""}`.trim(),
        )
      }
    }

    return { hash, eventId, inviteCode: params.inviteCode }
  }

  return { createEvent, isConnected, address }
}

export function useRegisterForEvent() {
  const { address, chain, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { writeContractAsync } = useWriteContract()

  const register = async (
    eventId: number,
    tierId = 0,
    accessCode?: string,
  ): Promise<{ hash: `0x${string}`; ticketId: bigint }> => {
    assertWriteReady(isConnected, chain?.id)
    if (!address) throw new Error("Wallet not connected")

    const alreadyRegistered = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "hasTicket",
      args: [BigInt(eventId), address],
    })) as boolean

    if (alreadyRegistered) {
      throw new Error("This wallet already has an active ticket for this event. Open My Tickets to view it.")
    }

    const rawEvent = (await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "getEvent",
      args: [BigInt(eventId)],
    })) as ContractEvent
    const tiers = await readEventTiers(eventId)
    const selectedTier = tiers.find((tier) => tier.id === tierId) ?? tiers[0]

    if (!selectedTier) {
      throw new Error("No ticket tiers are configured for this event")
    }

    if (rawEvent.requiresConfidentialAccess) {
      if (!accessCode?.trim()) {
        throw new Error("This event requires a confidential invite code")
      }
      if (!walletClient) {
        throw new Error("Wallet client is not ready for CoFHE encryption")
      }

      const { connectCofhe, decryptAccessResult, encryptCredential } = await import("@/lib/cofhe")
      await connectCofhe(publicClient, walletClient)
      const encryptedCredential = await encryptCredential(accessCode)
      const requestHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "requestConfidentialAccess",
        args: [BigInt(eventId), tierId, encryptedCredential],
      })
      const requestReceipt = await waitForReceipt(requestHash)
      const requestLogs = parseEventLogs({ abi, logs: requestReceipt.logs })
      const requestedAccess = requestLogs.find((entry) => entry.eventName === "ConfidentialAccessRequested")
      const accessResult =
        (requestedAccess?.args.accessResult as `0x${string}` | undefined) ??
        ((await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi,
          functionName: "getPendingConfidentialAccess",
          args: [BigInt(eventId), address],
        })) as [`0x${string}`, number, boolean])[0]

      const decryptResult = await decryptAccessResult(accessResult)
      if (!decryptResult.accessGranted) {
        throw new Error("Confidential access denied")
      }

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "mintConfidentialTicket",
        args: [BigInt(eventId), address, tierId, decryptResult.ctHash, decryptResult.accessGranted, decryptResult.signature],
        value: selectedTier.priceWei,
      })

      const receipt = await waitForReceipt(hash)
      const parsedLogs = parseEventLogs({ abi, logs: receipt.logs })
      const mintedTicket = parsedLogs.find((entry) => entry.eventName === "TicketMinted")
      const ticketId = (mintedTicket?.args.ticketId as bigint | undefined) ?? 0n

      return { hash, ticketId }
    }

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "mintTicketForTier",
      args: [BigInt(eventId), address, tierId, ZERO_HASH],
      value: selectedTier.priceWei,
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

export function useHasEventTicket(eventId: number) {
  const { address, isConnected } = useAccount()
  const [hasTicket, setHasTicket] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchTicketStatus = useCallback(async () => {
    if (!isConnected || !address || !isContractDeployed || !Number.isInteger(eventId) || eventId < 0) {
      setHasTicket(false)
      return
    }

    setLoading(true)
    try {
      const result = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "hasTicket",
        args: [BigInt(eventId), address],
      })) as boolean

      setHasTicket(result)
    } catch (err) {
      console.error("Error checking event ticket status:", err)
      setHasTicket(false)
    } finally {
      setLoading(false)
    }
  }, [address, eventId, isConnected])

  useEffect(() => {
    const run = async () => {
      await fetchTicketStatus()
    }

    void run()
  }, [fetchTicketStatus])

  return { hasTicket, loading, refetch: fetchTicketStatus }
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

          const tiers = await readEventTiers(i)
          fetched.push(await contractEventToEvent(i, raw, organizer, tiers))
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
        event: getContractEvent("TicketPaymentReceived"),
        args: { organizer: address },
        fromBlock: CONTRACT_DEPLOY_BLOCK,
      })
      const releasedLogs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: getContractEvent("TicketPaymentReleased"),
        args: { organizer: address },
        fromBlock: CONTRACT_DEPLOY_BLOCK,
      })

      const receivedPayments = logs.map((log) => {
          const args = (log as unknown as { args: { eventId?: bigint; amount?: bigint } }).args
          return {
            eventId: Number(args.eventId ?? 0n),
            amountWei: args.amount ?? 0n,
            transactionHash: log.transactionHash,
            type: "received" as const,
          }
        })
      const withdrawnPayments = releasedLogs.map((log) => {
        const args = (log as unknown as { args: { eventId?: bigint; amount?: bigint } }).args
        return {
          eventId: Number(args.eventId ?? 0n),
          amountWei: args.amount ?? 0n,
          transactionHash: log.transactionHash,
          type: "withdrawn" as const,
        }
      })

      setPayments([...receivedPayments, ...withdrawnPayments])
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

  const totalWei = payments
    .filter((payment) => payment.type === "received")
    .reduce((sum, payment) => sum + payment.amountWei, 0n)
  const withdrawnWei = payments
    .filter((payment) => payment.type === "withdrawn")
    .reduce((sum, payment) => sum + payment.amountWei, 0n)
  const pendingWei = totalWei > withdrawnWei ? totalWei - withdrawnWei : 0n

  return {
    loading,
    payments,
    refetch: fetchRevenue,
    pendingRevenue: formatEthAmount(pendingWei),
    pendingWei,
    totalRevenue: formatEthAmount(totalWei),
    totalWei,
    withdrawnRevenue: formatEthAmount(withdrawnWei),
    withdrawnWei,
  }
}

export function useEventPendingRevenue(eventId: number) {
  const [pendingWei, setPendingWei] = useState(0n)
  const [loading, setLoading] = useState(false)

  const fetchPendingRevenue = useCallback(async () => {
    if (!isContractDeployed || !Number.isInteger(eventId) || eventId < 0) {
      setPendingWei(0n)
      return
    }

    setLoading(true)
    try {
      const amount = (await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "eventPendingRevenue",
        args: [BigInt(eventId)],
      })) as bigint

      setPendingWei(amount)
    } catch (err) {
      console.error("Error fetching pending event revenue:", err)
      setPendingWei(0n)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    const run = async () => {
      await fetchPendingRevenue()
    }

    void run()
  }, [fetchPendingRevenue])

  return {
    loading,
    pendingRevenue: formatEthAmount(pendingWei),
    pendingWei,
    refetch: fetchPendingRevenue,
  }
}

export function useEventWhitelist(eventId: number) {
  const [entries, setEntries] = useState<WhitelistEntry[]>([])
  const [loading, setLoading] = useState(false)

  const fetchWhitelist = useCallback(async () => {
    if (!isContractDeployed || !Number.isInteger(eventId) || eventId < 0) {
      setEntries([])
      return
    }

    setLoading(true)
    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: getContractEvent("WhitelistUpdated"),
        args: { eventId: BigInt(eventId) },
        fromBlock: CONTRACT_DEPLOY_BLOCK,
      })
      const latest = new Map<string, WhitelistEntry>()

      for (const log of logs) {
        const args = (log as unknown as { args: { wallet?: `0x${string}`; isWhitelisted?: boolean } }).args
        if (args.wallet) {
          latest.set(args.wallet.toLowerCase(), {
            wallet: args.wallet,
            isWhitelisted: Boolean(args.isWhitelisted),
            transactionHash: log.transactionHash,
          })
        }
      }

      setEntries([...latest.values()].sort((left, right) => left.wallet.localeCompare(right.wallet)))
    } catch (err) {
      console.error("Error fetching whitelist:", err)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    const run = async () => {
      await fetchWhitelist()
    }

    void run()
  }, [fetchWhitelist])

  return { entries, loading, refetch: fetchWhitelist }
}

export function useManageEventAccess() {
  const { chain, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { writeContractAsync } = useWriteContract()

  const updateInviteCode = async (eventId: number, inviteCode: string) => {
    assertWriteReady(isConnected, chain?.id)
    if (!walletClient) {
      throw new Error("Wallet client is not ready for CoFHE encryption")
    }

    const { connectCofhe, encryptCredential } = await import("@/lib/cofhe")
    await connectCofhe(publicClient, walletClient)
    const encryptedCredential = await encryptCredential(inviteCode)

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "setConfidentialInviteCode",
      args: [BigInt(eventId), encryptedCredential],
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

  const updateTicketTier = async (
    eventId: number,
    tier: { id: number; name: string; capacity: number; price?: string; transferable: boolean; active: boolean },
  ) => {
    assertWriteReady(isConnected, chain?.id)

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "setTicketTier",
      args: [
        BigInt(eventId),
        tier.id,
        tier.name,
        BigInt(Math.max(1, Math.floor(tier.capacity))),
        ticketPriceToWei(tier.price),
        tier.transferable,
        tier.active,
      ],
    })

    await waitForReceipt(hash)
    return hash
  }

  const updateTierCondition = async (eventId: number, tierId: number, conditionCode: string) => {
    assertWriteReady(isConnected, chain?.id)
    if (!walletClient) {
      throw new Error("Wallet client is not ready for CoFHE encryption")
    }

    const { connectCofhe, encryptCredential } = await import("@/lib/cofhe")
    await connectCofhe(publicClient, walletClient)
    const encryptedCondition = await encryptCredential(conditionCode)

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "setEncryptedTierCondition",
      args: [BigInt(eventId), tierId, encryptedCondition],
    })

    await waitForReceipt(hash)
    return hash
  }

  const withdrawEventRevenue = async (eventId: number) => {
    assertWriteReady(isConnected, chain?.id)

    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: "withdrawEventRevenue",
      args: [BigInt(eventId)],
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
    const metadataURI = await buildEventMetadataURI({
      name: params.name,
      description: params.description,
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

  return {
    addWhitelist,
    removeWhitelist,
    updateEvent,
    updateInviteCode,
    updateTicketTier,
    updateTierCondition,
    withdrawEventRevenue,
  }
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
      }) as Promise<[{ eventId: bigint; isVIP: boolean; used: boolean; tierId: number }, ContractEvent]>,
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
    const tiers = await readEventTiers(eventId)

    return {
      ticket: {
        id: ticketId,
        eventId,
        holder,
        isVIP: ticketInfo[0].isVIP,
        used: ticketInfo[0].used,
        tierId: Number(ticketInfo[0].tierId),
      },
      event: await contractEventToEvent(eventId, ticketInfo[1], organizer, tiers),
    }
  }

  return { burnTicket, checkInTicket, readTicket, transferTicket }
}
