import { createPublicClient, createWalletClient, http, parseEventLogs } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"
import fs from "node:fs"
import path from "node:path"
import { loadLocalEnv } from "./env.mjs"

loadLocalEnv()

const artifactPath = path.join(process.cwd(), "out", "EventNestTicket.sol", "EventNestTicket.json")
const { abi } = JSON.parse(fs.readFileSync(artifactPath, "utf8"))

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL ||
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
  process.env.SEPOLIA_RPC_URL ||
  "https://ethereum-sepolia.publicnode.com"

if (!contractAddress) {
  throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS.")
}

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
})

const bytecode = await publicClient.getBytecode({ address: contractAddress })
if (!bytecode || bytecode === "0x") {
  throw new Error(`No contract bytecode found at ${contractAddress}`)
}

const eventCount = await publicClient.readContract({
  address: contractAddress,
  abi,
  functionName: "getEventCount",
})

const ticketCount = await publicClient.readContract({
  address: contractAddress,
  abi,
  functionName: "getTicketCount",
})

console.log(`Sepolia E2E OK contract=${contractAddress} events=${eventCount} tickets=${ticketCount}`)

if (process.env.RUN_SEPOLIA_WRITE_E2E !== "1") {
  console.log("Sepolia write E2E skipped. Set RUN_SEPOLIA_WRITE_E2E=1 with PRIVATE_KEY to create, mint, and check in a smoke ticket.")
  process.exit(0)
}

const rawPrivateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY
if (!rawPrivateKey) {
  throw new Error("RUN_SEPOLIA_WRITE_E2E=1 requires PRIVATE_KEY or DEPLOYER_PRIVATE_KEY.")
}

const privateKey = rawPrivateKey.startsWith("0x") ? rawPrivateKey : `0x${rawPrivateKey}`
const account = privateKeyToAccount(privateKey)
const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(rpcUrl),
})

async function wait(hash) {
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  if (receipt.status !== "success") {
    throw new Error(`Transaction reverted: ${hash}`)
  }
  return receipt
}

const eventDate = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60)
const createHash = await walletClient.writeContract({
  address: contractAddress,
  abi,
  functionName: "createEventWithTiers",
  args: [
    `EventNest Smoke ${Date.now()}`,
    "Automated Sepolia E2E smoke event",
    JSON.stringify({ category: "workshop", location: "Sepolia", ticketPrice: "Free" }),
    eventDate,
    2n,
    0n,
    false,
    false,
    false,
    false,
    [{ name: "General", capacity: 2n, priceWei: 0n, transferable: true, active: true }],
  ],
})
const createReceipt = await wait(createHash)
const createLogs = parseEventLogs({ abi, logs: createReceipt.logs })
const eventId = createLogs.find((entry) => entry.eventName === "EventCreated")?.args.eventId
if (eventId === undefined) {
  throw new Error("Smoke event creation did not emit EventCreated.")
}

const mintHash = await walletClient.writeContract({
  address: contractAddress,
  abi,
  functionName: "mintTicketForTier",
  args: [eventId, account.address, 0, "0x0000000000000000000000000000000000000000000000000000000000000000"],
})
const mintReceipt = await wait(mintHash)
const mintLogs = parseEventLogs({ abi, logs: mintReceipt.logs })
const ticketId = mintLogs.find((entry) => entry.eventName === "TicketMinted")?.args.ticketId
if (ticketId === undefined) {
  throw new Error("Smoke ticket mint did not emit TicketMinted.")
}

const owner = await publicClient.readContract({
  address: contractAddress,
  abi,
  functionName: "ownerOf",
  args: [ticketId],
})
if (owner.toLowerCase() !== account.address.toLowerCase()) {
  throw new Error(`Smoke ticket owner mismatch: ${owner}`)
}

const checkInHash = await walletClient.writeContract({
  address: contractAddress,
  abi,
  functionName: "useTicket",
  args: [ticketId],
})
await wait(checkInHash)

const ticketInfo = await publicClient.readContract({
  address: contractAddress,
  abi,
  functionName: "getTicket",
  args: [ticketId],
})
if (!ticketInfo[0].used) {
  throw new Error("Smoke ticket was not marked used after check-in.")
}

const paidCreateHash = await walletClient.writeContract({
  address: contractAddress,
  abi,
  functionName: "createEventWithTiers",
  args: [
    `EventNest Paid Smoke ${Date.now()}`,
    "Automated Sepolia E2E paid ticket event",
    JSON.stringify({ category: "workshop", location: "Sepolia", ticketPrice: "0.000000000000000001 ETH" }),
    eventDate,
    2n,
    1n,
    false,
    false,
    false,
    false,
    [{ name: "General", capacity: 2n, priceWei: 1n, transferable: true, active: true }],
  ],
})
const paidCreateReceipt = await wait(paidCreateHash)
const paidCreateLogs = parseEventLogs({ abi, logs: paidCreateReceipt.logs })
const paidEventId = paidCreateLogs.find((entry) => entry.eventName === "EventCreated")?.args.eventId
if (paidEventId === undefined) {
  throw new Error("Paid smoke event creation did not emit EventCreated.")
}

const paidMintHash = await walletClient.writeContract({
  address: contractAddress,
  abi,
  functionName: "mintTicketForTier",
  args: [paidEventId, account.address, 0, "0x0000000000000000000000000000000000000000000000000000000000000000"],
  value: 1n,
})
await wait(paidMintHash)

const pendingRevenue = await publicClient.readContract({
  address: contractAddress,
  abi,
  functionName: "eventPendingRevenue",
  args: [paidEventId],
})
if (pendingRevenue !== 1n) {
  throw new Error(`Paid smoke revenue mismatch: ${pendingRevenue}`)
}

const withdrawHash = await walletClient.writeContract({
  address: contractAddress,
  abi,
  functionName: "withdrawEventRevenue",
  args: [paidEventId],
})
await wait(withdrawHash)

const pendingRevenueAfterWithdraw = await publicClient.readContract({
  address: contractAddress,
  abi,
  functionName: "eventPendingRevenue",
  args: [paidEventId],
})
if (pendingRevenueAfterWithdraw !== 0n) {
  throw new Error(`Paid smoke revenue was not cleared: ${pendingRevenueAfterWithdraw}`)
}

console.log(`Sepolia write E2E OK event=${eventId} ticket=${ticketId} paidEvent=${paidEventId} tx=${withdrawHash}`)
