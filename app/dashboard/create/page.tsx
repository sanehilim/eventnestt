"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Calendar, Shield, Ticket, Loader2, Lock, EyeOff } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { useCreateEvent } from "@/hooks/use-events"

const steps = [
  { id: 1, name: "Basic Info", icon: Calendar },
  { id: 2, name: "Privacy Settings", icon: Shield },
  { id: 3, name: "Ticketing", icon: Ticket },
  { id: 4, name: "Review", icon: Check }
]

export default function CreateEventPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [txHash, setTxHash] = useState<string>("")
  const { isConnected, address } = useAccount()

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
    earlyBirdDiscount: ""
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
      setTxHash(hash)
      setIsComplete(true)
    } catch (err) {
      console.error(err)
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
              Your event has been deployed to the blockchain with encrypted privacy settings.
            </p>
            {txHash && (
              <p className="text-sm text-[#666666] mb-8 font-mono bg-[#f5f5f5] p-2 rounded-lg">
                TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </p>
            )}
            <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-[#e5e5e5] mb-8 text-left">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-[#6366f1]" />
                <span className="font-medium text-[#1a1a1a]">Privacy Summary</span>
              </div>
              <ul className="space-y-2 text-sm text-[#666666]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  Access conditions encrypted on Fhenix
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  Pricing logic hidden from public view
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  Attendee list remains private
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  NFT tickets minted for verification
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
              Set up your event with privacy-first settings powered by Fhenix
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#e5e5e5] -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-[#6366f1] -translate-y-1/2 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
            {steps.map((step) => (
              <div
                key={step.id}
                className={`relative z-10 flex flex-col items-center ${
                  currentStep >= step.id ? "text-[#6366f1]" : "text-[#666666]"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= step.id
                      ? "bg-[#6366f1] border-[#6366f1] text-white"
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
          <div className="bg-[#f5f5f5] rounded-3xl p-8 border border-[#e5e5e5] boty-shadow">
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
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 boty-transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={4}
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 boty-transition resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 boty-transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 boty-transition"
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
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 boty-transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Max Attendees</label>
                  <input
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 boty-transition"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Privacy Settings */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-[#1a1a1a] mb-2">Privacy Settings</h2>
                <p className="text-[#666666] mb-6">
                  Choose how private your event access controls should be. All settings are encrypted on-chain via Fhenix.
                </p>

                <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6 text-[#6366f1]" />
                      <div>
                        <h3 className="font-medium text-[#1a1a1a]">Private Event</h3>
                        <p className="text-sm text-[#666666]">Event details hidden from public view</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        formData.isPrivate ? "bg-[#6366f1]" : "bg-[#e5e5e5]"
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.isPrivate ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-[#6366f1]" />
                      <div>
                        <h3 className="font-medium text-[#1a1a1a]">Invite Code Required</h3>
                        <p className="text-sm text-[#666666]">Attendees need a secret code to access</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, requiresInviteCode: !formData.requiresInviteCode })}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        formData.requiresInviteCode ? "bg-[#6366f1]" : "bg-[#e5e5e5]"
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.requiresInviteCode ? "translate-x-7" : "translate-x-1"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="bg-[#6366f1]/10 rounded-2xl p-6 border border-[#6366f1]/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-[#6366f1]" />
                    <span className="font-medium text-[#6366f1]">Fhenix Privacy</span>
                  </div>
                  <p className="text-sm text-[#666666]">
                    All your privacy settings are encrypted and stored on-chain. No one can see your invite codes, whitelist, or access conditions.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Ticketing */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-[#1a1a1a] mb-6">Ticketing</h2>

                <div>
                  <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Ticket Price (ETH)</label>
                  <input
                    type="text"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    placeholder="0.05"
                    className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 boty-transition"
                  />
                  <p className="text-xs text-[#999999] mt-2">
                    Leave empty for free events.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl text-[#1a1a1a] mb-6">Review & Deploy</h2>

                <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
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
                      <dd className="text-[#1a1a1a]">{formData.maxAttendees}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#666666]">Ticket Price</dt>
                      <dd className="text-[#6366f1]">{formData.ticketPrice ? `${formData.ticketPrice} ETH` : "Free"}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
                  <h3 className="font-medium text-[#1a1a1a] mb-4">Privacy Configuration</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      {formData.isPrivate ? (
                        <Lock className="w-4 h-4 text-[#6366f1]" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[#666666]" />
                      )}
                      <span className={formData.isPrivate ? "text-[#6366f1]" : "text-[#666666]"}>
                        {formData.isPrivate ? "Private Event" : "Public Event"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      {formData.requiresInviteCode ? (
                        <Shield className="w-4 h-4 text-[#6366f1]" />
                      ) : (
                        <Shield className="w-4 h-4 text-[#666666]" />
                      )}
                      <span className={formData.requiresInviteCode ? "text-[#6366f1]" : "text-[#666666]"}>
                        {formData.requiresInviteCode ? "Invite Code Required" : "No Invite Code"}
                      </span>
                    </li>
                  </ul>
                </div>

                <ConnectButton.Custom>
                  {({ account, chain, openConnectModal, openChainModal, mounted }) => (
                    <div className={!mounted ? "opacity-0 pointer-events-none" : ""}>
                      {!mounted || !account ? (
                        <button
                          type="button"
                          onClick={openConnectModal}
                          className="w-full bg-[#1a1a1a] text-white px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-[#333] boty-shadow"
                        >
                          Connect Wallet to Deploy
                        </button>
                      ) : chain?.unsupported ? (
                        <button
                          type="button"
                          onClick={openChainModal}
                          className="w-full bg-[#ef4444] text-white px-8 py-4 rounded-full text-sm font-medium boty-transition"
                        >
                          Wrong Network
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isSubmitting || !formData.name}
                          className="w-full bg-[#6366f1] text-white px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-[#5558e3] boty-shadow disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Deploying Contract...
                            </>
                          ) : (
                            <>
                              Deploy Event Contract
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </ConnectButton.Custom>
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
                  className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-[#333]"
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
