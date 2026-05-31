"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Check, Calendar, Shield, Ticket, Loader2, Lock, EyeOff, Plus, Trash2 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { EventImageUpload } from "@/components/event-image-upload"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useAccount } from "wagmi"
import { useCreateEvent } from "@/hooks/use-events"
import { readDashboardSettings } from "@/lib/dashboard-settings"
import { APP_CHAIN, dateInputToEventTimestamp } from "@/lib/onchain"

const steps = [
  { id: 1, name: "Basic Info", icon: Calendar },
  { id: 2, name: "Privacy Settings", icon: Shield },
  { id: 3, name: "Ticketing", icon: Ticket },
  { id: 4, name: "Review", icon: Check }
]

function generateInviteCode() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return `EVENT-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`
}

export default function CreateEventPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [txHash, setTxHash] = useState<string>("")
  const [generatedInviteCode, setGeneratedInviteCode] = useState("")
  const [submitError, setSubmitError] = useState("")
  const { isConnected, address, chain } = useAccount()
  const isWrongChain = isConnected && chain?.id !== APP_CHAIN.id
  const { createEvent } = useCreateEvent()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    category: "conference",
    isPrivate: true,
    requiresInviteCode: true,
    requiresWhitelist: false,
    maxAttendees: 100,
    ticketPrice: "",
    image: "",
    ticketTiers: [
      { name: "General", capacity: 100, price: "", transferable: true, active: true },
      { name: "VIP", capacity: 25, price: "0.08", transferable: false, active: false },
      { name: "Speaker", capacity: 10, price: "", transferable: false, active: false },
      { name: "Sponsor", capacity: 15, price: "0.2", transferable: false, active: false },
      { name: "DAO Member", capacity: 50, price: "0.02", transferable: true, active: false },
    ],
  })
  const privateEventMissingAccessRule =
    formData.isPrivate && !formData.requiresInviteCode && !formData.requiresWhitelist
  const cannotContinue = currentStep === 2 && privateEventMissingAccessRule
  const activeTiers = formData.ticketTiers.filter((tier) => tier.active)
  const totalTierCapacity = activeTiers.reduce((sum, tier) => sum + tier.capacity, 0)
  const noActiveTier = activeTiers.length === 0
  const tooManyTiers = formData.ticketTiers.length > 16
  const cannotGoNext = cannotContinue || (currentStep === 3 && (noActiveTier || tooManyTiers))

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const settings = readDashboardSettings(address)
      setFormData((current) => ({
        ...current,
        isPrivate: settings.defaultPrivate,
        requiresInviteCode: settings.requireInviteCode,
        requiresWhitelist: settings.requireWhitelist,
      }))
    }, 0)

    return () => window.clearTimeout(timer)
  }, [address])

  const updateTier = (
    index: number,
    patch: Partial<(typeof formData.ticketTiers)[number]>,
  ) => {
    setFormData((current) => ({
      ...current,
      ticketTiers: current.ticketTiers.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, ...patch } : tier,
      ),
    }))
  }

  const addTier = () => {
    setFormData((current) => ({
      ...current,
      ticketTiers: [
        ...current.ticketTiers,
        { name: "Custom", capacity: 25, price: "", transferable: true, active: true },
      ],
    }))
  }

  const removeTier = (index: number) => {
    setFormData((current) => ({
      ...current,
      ticketTiers: current.ticketTiers.filter((_, tierIndex) => tierIndex !== index),
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.date) {
      return
    }
    if (privateEventMissingAccessRule) {
      setSubmitError("Private events must require an invite code or whitelist.")
      return
    }
    if (noActiveTier) {
      setSubmitError("Add at least one active ticket tier.")
      return
    }
    if (tooManyTiers) {
      setSubmitError("Events can have at most 16 ticket tiers.")
      return
    }

    setSubmitError("")
    setIsSubmitting(true)
    try {
      const inviteCode = formData.requiresInviteCode
        ? generateInviteCode()
        : undefined

      const { hash } = await createEvent({
        name: formData.name,
        description: formData.description,
        eventDate: dateInputToEventTimestamp(formData.date),
        maxAttendees: Math.max(formData.maxAttendees, totalTierCapacity),
        isPrivate: formData.isPrivate,
        requiresInviteCode: formData.requiresInviteCode,
        requiresWhitelist: formData.requiresWhitelist,
        ticketPrice: formData.ticketPrice,
        location: formData.location,
        category: formData.category,
        image: formData.image,
        inviteCode,
        ticketTiers: formData.ticketTiers,
      })
      setTxHash(hash)
      setGeneratedInviteCode(inviteCode || "")
      setIsComplete(true)
    } catch (err) {
      console.error(err)
      setSubmitError(err instanceof Error ? err.message : "Failed to create event.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isComplete) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="pt-28 pb-20">
          <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#10b981]/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Check className="w-10 h-10 text-[#10b981]" />
            </div>
            <h1 className="text-4xl md:text-5xl text-[#1a1a1a] mb-4">Event Created!</h1>
            <p className="text-lg text-[#666666] mb-4">
              Your event has been deployed on-chain and is ready to accept registrations.
            </p>
            {txHash && (
              <p className="text-sm text-[#666666] mb-8 font-mono bg-[#f5f5f5] p-2 rounded-lg">
                TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </p>
            )}
            {generatedInviteCode && (
              <p className="text-sm text-[#1a1a1a] mb-8 bg-[#fff7ed] border border-[#fed7aa] p-3 rounded-lg">
                Invite code: <span className="font-mono">{generatedInviteCode}</span>
              </p>
            )}
            <div className="bg-[#f5f5f5] rounded-lg p-6 border border-[#e5e5e5] mb-8 text-left">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-[#0f766e]" />
                <span className="font-medium text-[#1a1a1a]">Access Summary</span>
              </div>
              <ul className="space-y-2 text-sm text-[#666666]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  Event deployed successfully on {APP_CHAIN.name}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  Wallet registration is connected to the smart contract
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  Confidential invite credential encrypted with CoFHE
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  Tiered NFT tickets minted for verification
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-[#1a1a1a] text-white px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-[#333]"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/events"
                className="bg-[#f5f5f5] text-[#1a1a1a] px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-[#e5e5e5] border border-[#e5e5e5]"
              >
                View All Events
              </Link>
            </div>
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
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#666666] hover:text-[#1a1a1a] boty-transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl text-[#1a1a1a] mb-4">Create Event</h1>
            <p className="text-lg text-[#666666]">
              Set up your event with organizer-controlled on-chain access settings
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#e5e5e5] -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-[#0f766e] -translate-y-1/2 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
            {steps.map((step) => (
              <div
                key={step.id}
                className={`relative z-10 flex flex-col items-center ${
                  currentStep >= step.id ? "text-[#0f766e]" : "text-[#666666]"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= step.id
                      ? "bg-[#0f766e] border-[#0f766e] text-white"
                      : "bg-white border-[#e5e5e5]"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="mt-2 text-sm font-medium hidden sm:block">{step.name}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-[#f5f5f5] rounded-xl p-8 border border-[#e5e5e5] boty-shadow">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-[#1a1a1a] mb-6">Basic Information</h2>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Event Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ETH Global Bangkok"
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 boty-transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={4}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 boty-transition resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 boty-transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 boty-transition"
                    >
                      <option value="hackathon">Hackathon</option>
                      <option value="conference">Conference</option>
                      <option value="workshop">Workshop</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Bangkok, Thailand or Remote"
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 boty-transition"
                  />
                </div>

                <EventImageUpload
                  value={formData.image}
                  onChange={(image) => setFormData((current) => ({ ...current, image }))}
                />

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Max Attendees</label>
                  <input
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50 boty-transition"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Privacy Settings */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-[#1a1a1a] mb-2">Privacy Settings</h2>
                <p className="text-[#666666] mb-6">
                  Choose how private your event access controls should be. These rules are enforced by your deployed smart contract.
                </p>

                <div className="bg-white rounded-lg p-6 border border-[#e5e5e5]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6 text-[#0f766e]" />
                      <div>
                        <h3 className="font-medium text-[#1a1a1a]">Private Event</h3>
                        <p className="text-sm text-[#666666]">Registration is controlled by invite and whitelist rules</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        formData.isPrivate ? "bg-[#0f766e]" : "bg-[#e5e5e5]"
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.isPrivate ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-[#e5e5e5]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-[#0f766e]" />
                      <div>
                        <h3 className="font-medium text-[#1a1a1a]">Invite Code Required</h3>
                        <p className="text-sm text-[#666666]">Attendees need a secret code to access</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, requiresInviteCode: !formData.requiresInviteCode })}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        formData.requiresInviteCode ? "bg-[#0f766e]" : "bg-[#e5e5e5]"
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.requiresInviteCode ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border border-[#e5e5e5]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-[#0f766e]" />
                      <div>
                        <h3 className="font-medium text-[#1a1a1a]">Whitelist Only</h3>
                        <p className="text-sm text-[#666666]">Only approved wallets can mint tickets</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, requiresWhitelist: !formData.requiresWhitelist })}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        formData.requiresWhitelist ? "bg-[#0f766e]" : "bg-[#e5e5e5]"
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.requiresWhitelist ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="bg-[#0f766e]/10 rounded-lg p-6 border border-[#0f766e]/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-[#0f766e]" />
                    <span className="font-medium text-[#0f766e]">On-Chain Access Rules</span>
                  </div>
                  <p className="text-sm text-[#666666]">
                    Invite credentials use CoFHE encrypted inputs; whitelist settings are enforced by the contract.
                  </p>
                </div>
                {privateEventMissingAccessRule && (
                  <p className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm text-[#92400e]">
                    Private events must enable an invite code or whitelist before they can be deployed.
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Ticketing */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl text-[#1a1a1a]">Ticket Tiers</h2>
                    <p className="mt-1 text-sm text-[#666666]">
                      Configure capacity, pricing, and transfer rules per tier.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addTier}
                    disabled={formData.ticketTiers.length >= 16}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-sm font-medium text-[#1a1a1a] boty-transition hover:bg-[#eeeeee] disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add Tier
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.ticketTiers.map((tier, index) => (
                    <div key={`${tier.name}-${index}`} className="rounded-lg border border-[#e5e5e5] bg-white p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <label className="flex items-center gap-3 text-sm font-medium text-[#1a1a1a]">
                          <input
                            type="checkbox"
                            checked={tier.active}
                            onChange={(event) => updateTier(index, { active: event.target.checked })}
                            className="h-4 w-4 accent-[#0f766e]"
                          />
                          Active tier
                        </label>
                        {formData.ticketTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTier(index)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e5e5] text-[#666666] hover:bg-[#f5f5f5] hover:text-[#ef4444]"
                            aria-label="Remove tier"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-[1fr_120px_140px_150px]">
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-[#1a1a1a]">Tier Name</span>
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(event) => updateTier(index, { name: event.target.value })}
                            className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-[#1a1a1a]">Capacity</span>
                          <input
                            type="number"
                            min="1"
                            value={tier.capacity}
                            onChange={(event) => updateTier(index, { capacity: Number(event.target.value) || 0 })}
                            className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-2 block text-sm font-medium text-[#1a1a1a]">Price ETH</span>
                          <input
                            type="text"
                            value={tier.price}
                            onChange={(event) => updateTier(index, { price: event.target.value })}
                            placeholder="Free"
                            className="w-full rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/50"
                          />
                        </label>
                        <label className="flex items-end gap-3 pb-3 text-sm font-medium text-[#1a1a1a]">
                          <input
                            type="checkbox"
                            checked={tier.transferable}
                            onChange={(event) => updateTier(index, { transferable: event.target.checked })}
                            className="h-4 w-4 accent-[#0f766e]"
                          />
                          Transferable
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-[#0f766e]/20 bg-[#0f766e]/10 p-4 text-sm text-[#0f766e]">
                  {activeTiers.length} active tier{activeTiers.length === 1 ? "" : "s"} with {totalTierCapacity} total seats.
                </div>
                {tooManyTiers && (
                  <p className="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-4 py-3 text-sm text-[#92400e]">
                    Events can have at most 16 ticket tiers on-chain.
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-[#1a1a1a] mb-6">Review & Deploy</h2>

                <div className="bg-white rounded-lg p-6 border border-[#e5e5e5]">
                  <h3 className="font-medium text-[#1a1a1a] mb-4">Event Details</h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-[#666666]">Name</dt>
                      <dd className="text-[#1a1a1a]">{formData.name || "Untitled Event"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#666666]">Date</dt>
                      <dd className="text-[#1a1a1a]">{formData.date || "TBD"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#666666]">Location</dt>
                      <dd className="text-[#1a1a1a]">{formData.location || "TBD"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#666666]">Max Attendees</dt>
                      <dd className="text-[#1a1a1a]">{Math.max(formData.maxAttendees, totalTierCapacity)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#666666]">Ticket Tiers</dt>
                      <dd className="text-[#0f766e]">{activeTiers.length} active</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#666666]">Image</dt>
                      <dd className="text-[#1a1a1a]">{formData.image ? "Uploaded" : "Fallback image"}</dd>
                    </div>
                  </dl>
                  {formData.image && (
                    <div className="mt-4 aspect-video overflow-hidden rounded-lg border border-[#e5e5e5] bg-[#f5f5f5]">
                      <Image src={formData.image} alt="Event cover preview" width={720} height={405} className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-6 border border-[#e5e5e5]">
                  <h3 className="font-medium text-[#1a1a1a] mb-4">Privacy Configuration</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      {formData.isPrivate ? (
                        <Lock className="w-4 h-4 text-[#0f766e]" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[#666666]" />
                      )}
                      <span className={formData.isPrivate ? "text-[#0f766e]" : "text-[#666666]"}>
                        {formData.isPrivate ? "Private Event" : "Public Event"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      {formData.requiresInviteCode ? (
                        <Shield className="w-4 h-4 text-[#0f766e]" />
                      ) : (
                        <Shield className="w-4 h-4 text-[#666666]" />
                      )}
                      <span className={formData.requiresInviteCode ? "text-[#0f766e]" : "text-[#666666]"}>
                        {formData.requiresInviteCode ? "Invite Code Required" : "No Invite Code"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Shield className={`w-4 h-4 ${formData.requiresWhitelist ? "text-[#0f766e]" : "text-[#666666]"}`} />
                      <span className={formData.requiresWhitelist ? "text-[#0f766e]" : "text-[#666666]"}>
                        {formData.requiresWhitelist ? "Whitelist Required" : "No Whitelist"}
                      </span>
                    </li>
                  </ul>
                </div>

                {!isConnected || isWrongChain ? (
                  <WalletConnectButton label="Connect Wallet to Deploy" fullWidth />
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name.trim() || !formData.date || privateEventMissingAccessRule || noActiveTier}
                    className="w-full bg-[#0f766e] text-white px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-[#0d6b63] boty-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Event...
                      </>
                    ) : (
                      <>Create Event On-Chain</>
                    )}
                  </button>
                )}

                {submitError && (
                  <p className="text-sm text-[#ef4444] mt-4 text-center">{submitError}</p>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-[#e5e5e5]">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="inline-flex items-center gap-2 bg-white text-[#1a1a1a] px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-[#f5f5f5] border border-[#e5e5e5] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  disabled={cannotGoNext}
                  className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
