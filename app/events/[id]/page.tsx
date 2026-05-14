"use client"
/* eslint-disable @next/next/no-img-element */

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Calendar, MapPin, Users, Ticket, Lock, EyeOff, Shield, ArrowLeft, ArrowRight, Check, AlertCircle, Key, Loader2 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useRegisterForEvent, useEvents } from "@/hooks/use-events"
import { useAccount } from "wagmi"
import { APP_CHAIN } from "@/lib/onchain"

function formatDate(timestamp: bigint): string {
  try {
    const date = new Date(Number(timestamp))
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  } catch {
    return "Date TBA"
  }
}

export default function EventDetailPage() {
  const params = useParams()
  const eventId = Number(params.id)
  const { events, loading } = useEvents()
  const { register, isConnected } = useRegisterForEvent()
  const { chain } = useAccount()

  const [accessCode, setAccessCode] = useState("")
  const [showAccessForm, setShowAccessForm] = useState(false)
  const [accessStatus, setAccessStatus] = useState<"idle" | "verifying" | "approved" | "denied">("idle")
  const [isRegistered, setIsRegistered] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [actionError, setActionError] = useState("")

  const event = events.find(e => e.id === eventId)
  const isWrongChain = isConnected && chain?.id !== APP_CHAIN.id
  const requiresAccessCode = Boolean(event?.requiresInviteCode)
  const isGated = Boolean(event && (event.isPrivate || event.requiresInviteCode || event.requiresWhitelist))

  const handleAccessRequest = async () => {
    if (requiresAccessCode && !accessCode.trim()) return
    setAccessStatus("verifying")
    setIsRegistering(true)
    setActionError("")

    try {
      await register(eventId, requiresAccessCode ? accessCode : undefined)
      setAccessStatus("approved")
      setIsRegistered(true)
    } catch (err) {
      setAccessStatus("denied")
      setActionError(err instanceof Error ? err.message : "Registration failed.")
    } finally {
      setIsRegistering(false)
    }
  }

  const handleDirectRegister = async () => {
    if (!isConnected) return
    setAccessStatus("verifying")
    setIsRegistering(true)
    setActionError("")

    try {
      await register(eventId)
      setAccessStatus("approved")
      setIsRegistered(true)
    } catch (err) {
      setAccessStatus("denied")
      setActionError(err instanceof Error ? err.message : "Registration failed.")
    } finally {
      setIsRegistering(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-28 pb-20">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 text-[#0f766e] animate-spin" />
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-28 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h1 className="text-4xl text-[#1a1a1a] mb-4">Event Not Found</h1>
            <p className="text-[#666666] mb-8">The event you are looking for does not exist.</p>
            <Link href="/events" className="text-[#0f766e] hover:underline">
              Browse all events
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-[#666666] hover:text-[#1a1a1a] boty-transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Image & Info */}
            <div>
              <div className="relative aspect-video rounded-xl overflow-hidden boty-shadow mb-8">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 rounded-full text-sm tracking-wide bg-white/90 backdrop-blur-sm text-[#1a1a1a] flex items-center gap-2 border border-[#e5e5e5]">
                    {isGated ? (
                      <Lock className="w-4 h-4 text-[#0f766e]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[#666666]" />
                    )}
                    {isGated ? "Gated Event" : "Public Event"}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-[#f5f5f5] rounded-xl p-8 border border-[#e5e5e5]">
                <h2 className="text-2xl text-[#1a1a1a] mb-6">Event Details</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-[#666666]">
                    <Calendar className="w-5 h-5 text-[#0f766e]" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#666666]">
                    <MapPin className="w-5 h-5 text-[#0f766e]" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#666666]">
                    <Users className="w-5 h-5 text-[#0f766e]" />
                    <span>{event.totalTicketsSold}/{event.maxAttendees} attendees</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#666666]">
                    <Ticket className="w-5 h-5 text-[#0f766e]" />
                    <span>{event.ticketPrice}</span>
                  </div>
                </div>

                <p className="text-[#666666] leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Right Column - Registration */}
            <div>
              <div className="bg-[#f5f5f5] rounded-xl p-8 border border-[#e5e5e5] sticky top-28">
                <h1 className="text-4xl text-[#1a1a1a] mb-4">{event.name}</h1>
                <p className="text-lg text-[#666666] mb-6">{event.description}</p>

                {/* Privacy Features */}
                <div className="bg-white rounded-lg p-6 mb-8 border border-[#e5e5e5]">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-[#0f766e]" />
                    <span className="font-medium text-[#1a1a1a]">Privacy Features</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm text-[#666666]">
                      <Check className="w-4 h-4 text-[#0f766e] flex-shrink-0" />
                      {isGated ? "Gated event - access controlled" : "Public event - open registration"}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#666666]">
                      <Check className="w-4 h-4 text-[#0f766e] flex-shrink-0" />
                      {event.requiresInviteCode ? "Invite code required" : "No invite code needed"}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#666666]">
                      <Check className="w-4 h-4 text-[#0f766e] flex-shrink-0" />
                      {event.requiresWhitelist ? "Whitelist verification" : "Open to all wallets"}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#666666]">
                      <Lock className="w-4 h-4 text-[#0f766e] flex-shrink-0" />
                      On-chain NFT ticket minting
                    </li>
                  </ul>
                </div>

                {/* Registration Section */}
                {isRegistered || accessStatus === "approved" ? (
                  <div className="bg-[#10b981]/10 rounded-lg p-6 border border-[#10b981]/20 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#10b981]/20 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-[#10b981]" />
                    </div>
                    <h3 className="text-xl text-[#1a1a1a] mb-2">You are registered!</h3>
                    <p className="text-sm text-[#666666] mb-4">
                      Your NFT ticket has been minted and confirmed on-chain.
                    </p>
                    <Link
                      href="/tickets"
                      className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-[#333]"
                    >
                      View My Tickets
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : isGated && !showAccessForm ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[#0f766e]/10 flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-[#0f766e]" />
                    </div>
                    <h3 className="text-xl text-[#1a1a1a] mb-2">Gated Event</h3>
                    <p className="text-sm text-[#666666] mb-6">
                      {requiresAccessCode
                        ? "This event requires an access code before registration."
                        : "Your wallet must be allowed by the organizer before registration."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAccessForm(true)}
                      className="bg-[#0f766e] text-white px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-[#0d6b63] boty-shadow"
                    >
                      {requiresAccessCode ? "Enter Access Code" : "Register With Wallet"}
                    </button>
                  </div>
                ) : isGated ? (
                  <div className="space-y-6">
                    {requiresAccessCode && (
                      <div className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-[#0f766e]" />
                        <span className="font-medium text-[#1a1a1a]">Enter Access Code</span>
                      </div>
                    )}

                    {accessStatus === "denied" && (
                      <div className="bg-[#ef4444]/10 rounded-xl p-4 border border-[#ef4444]/20 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-[#ef4444] flex-shrink-0" />
                        <span className="text-sm text-[#ef4444]">
                          {actionError || "Access denied. Check the code or ask the organizer to approve your wallet."}
                        </span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {requiresAccessCode && (
                        <input
                          type="text"
                          placeholder="Enter your access code or invite PIN"
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value)}
                          className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 boty-transition"
                        />
                      )}

                      {!isConnected || isWrongChain ? (
                        <WalletConnectButton label="Connect Wallet to Register" fullWidth />
                      ) : (
                        <button
                          type="button"
                          onClick={handleAccessRequest}
                          disabled={accessStatus === "verifying" || (requiresAccessCode && !accessCode.trim())}
                          className="w-full bg-[#0f766e] text-white px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-[#0d6b63] boty-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {accessStatus === "verifying" ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              {requiresAccessCode ? "Verify & Register" : "Register With Approved Wallet"}
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-[#999999] text-center">
                      Access is verified by the event smart contract before minting.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {!isConnected || isWrongChain ? (
                      <WalletConnectButton label="Connect Wallet to Register" fullWidth />
                    ) : (
                      <button
                        type="button"
                        onClick={handleDirectRegister}
                        disabled={isRegistering}
                        className="w-full bg-[#0f766e] text-white px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-[#0d6b63] boty-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isRegistering ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Ticket className="w-4 h-4" />
                        )}
                        Register for Event
                      </button>
                    )}

                    <div className="bg-white rounded-xl p-4 border border-[#e5e5e5]">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-[#0f766e]" />
                        <span className="text-sm font-medium text-[#1a1a1a]">What you get:</span>
                      </div>
                      <ul className="space-y-1 text-sm text-[#666666]">
                        <li>NFT ticket stored in your wallet</li>
                        <li>On-chain verification</li>
                        <li>Transferable ticket</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
