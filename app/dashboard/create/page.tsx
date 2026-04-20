"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Check, Plus, Minus, Upload, Lock, Eye, EyeOff, Shield, DollarSign, Users, Calendar, MapPin, Ticket, Zap } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ConnectButton } from "@rainbow-me/rainbowkit"

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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "tech",
    isPrivate: true,
    requireInviteCode: true,
    requirePIN: false,
    requireWhitelist: false,
    maxAttendees: 100,
    ticketPrice: "",
    ticketPriceWei: "",
    earlyBirdDiscount: "",
    vipPricing: ""
  })

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsComplete(true)
    }, 2000)
  }

  if (isComplete) {
    return (
      <main className="min-h-screen bg-background grid-pattern">
        <Header />
        <div className="pt-28 pb-20">
          <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Event Created!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your event has been deployed to the blockchain with encrypted privacy settings.
            </p>
            <div className="bg-card rounded-2xl p-6 border border-border mb-8 text-left">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Privacy Summary</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Access conditions encrypted on Fhenix
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Pricing logic hidden from public view
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Attendee list remains private
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  NFT tickets minted for verification
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/events"
                className="bg-secondary text-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-secondary/80 border border-border"
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
    <main className="min-h-screen bg-background grid-pattern">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary boty-transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Create Event</h1>
            <p className="text-lg text-muted-foreground">
              Set up your event with privacy-first settings powered by Fhenix
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
            {steps.map((step) => (
              <div
                key={step.id}
                className={`relative z-10 flex flex-col items-center ${
                  currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-border'
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
          <div className="bg-card rounded-3xl p-8 border border-border boty-shadow">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl text-foreground mb-6">Basic Information</h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Event Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Web3 Privacy Summit"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 boty-transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your event..."
                    rows={4}
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 boty-transition resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 boty-transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 boty-transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 boty-transition"
                    >
                      <option value="tech">Tech</option>
                      <option value="music">Music</option>
                      <option value="art">Art</option>
                      <option value="business">Business</option>
                      <option value="sports">Sports</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 boty-transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Max Attendees</label>
                  <input
                    type="number"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({ ...formData, maxAttendees: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 boty-transition"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Privacy Settings */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl text-foreground mb-6">Privacy Settings</h2>
                <p className="text-muted-foreground mb-6">
                  Choose how private your event access controls should be. All settings are encrypted on-chain via Fhenix.
                </p>

                <div className="bg-secondary rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Lock className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-medium text-foreground">Private Event</h3>
                        <p className="text-sm text-muted-foreground">Event details hidden from public view</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        formData.isPrivate ? 'bg-primary' : 'bg-border'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.isPrivate ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="bg-secondary rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-medium text-foreground">Invite Code Required</h3>
                        <p className="text-sm text-muted-foreground">Attendees need a secret code to access</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, requireInviteCode: !formData.requireInviteCode })}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        formData.requireInviteCode ? 'bg-primary' : 'bg-border'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.requireInviteCode ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="bg-secondary rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="font-medium text-foreground">Whitelist Only</h3>
                        <p className="text-sm text-muted-foreground">Only approved wallets can purchase</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, requireWhitelist: !formData.requireWhitelist })}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        formData.requireWhitelist ? 'bg-primary' : 'bg-border'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.requireWhitelist ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-medium text-primary">Fhenix Privacy</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All your privacy settings are encrypted and stored on-chain. No one can see your invite codes, whitelist, or access conditions.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Ticketing */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl text-foreground mb-6">Ticketing & Pricing</h2>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ticket Price (ETH)</label>
                  <input
                    type="text"
                    value={formData.ticketPrice}
                    onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                    placeholder="0.05"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 boty-transition"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Leave empty for free events. Enter 0 for no charge.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Early Bird Discount (%)</label>
                  <input
                    type="text"
                    value={formData.earlyBirdDiscount}
                    onChange={(e) => setFormData({ ...formData, earlyBirdDiscount: e.target.value })}
                    placeholder="20"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 boty-transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">VIP Pricing (ETH)</label>
                  <input
                    type="text"
                    value={formData.vipPricing}
                    onChange={(e) => setFormData({ ...formData, vipPricing: e.target.value })}
                    placeholder="0.1"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 boty-transition"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Optional VIP tier with extra perks. Leave empty to disable.
                  </p>
                </div>

                <div className="bg-secondary rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">Hide Pricing</h3>
                      <p className="text-sm text-muted-foreground">Pricing only visible after access verification</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your pricing tiers are encrypted. Only verified attendees can see the actual prices.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl text-foreground mb-6">Review & Deploy</h2>

                <div className="bg-secondary rounded-2xl p-6 border border-border">
                  <h3 className="font-medium text-foreground mb-4">Event Details</h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Name</dt>
                      <dd className="text-foreground">{formData.name || "Untitled Event"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Date & Time</dt>
                      <dd className="text-foreground">{formData.date} at {formData.time || "TBD"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="text-foreground">{formData.location || "TBD"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Max Attendees</dt>
                      <dd className="text-foreground">{formData.maxAttendees}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Ticket Price</dt>
                      <dd className="text-primary">{formData.ticketPrice ? `${formData.ticketPrice} ETH` : "Free"}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-secondary rounded-2xl p-6 border border-border">
                  <h3 className="font-medium text-foreground mb-4">Privacy Configuration</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      {formData.isPrivate ? (
                        <Lock className="w-4 h-4 text-primary" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={formData.isPrivate ? 'text-primary' : 'text-muted-foreground'}>
                        {formData.isPrivate ? 'Private Event' : 'Public Event'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      {formData.requireInviteCode ? (
                        <Shield className="w-4 h-4 text-primary" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={formData.requireInviteCode ? 'text-primary' : 'text-muted-foreground'}>
                        {formData.requireInviteCode ? 'Invite Code Required' : 'No Invite Code'}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      {formData.requireWhitelist ? (
                        <Users className="w-4 h-4 text-primary" />
                      ) : (
                        <Users className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={formData.requireWhitelist ? 'text-primary' : 'text-muted-foreground'}>
                        {formData.requireWhitelist ? 'Whitelist Enabled' : 'Open Registration'}
                      </span>
                    </li>
                  </ul>
                </div>

                <ConnectButton.Custom>
                  {({ account, chain, openConnectModal, openChainModal, mounted }) => (
                    <div {...(!mounted && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none' } })}>
                      {!mounted || !account ? (
                        <button
                          type="button"
                          onClick={openConnectModal}
                          className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
                        >
                          Connect Wallet to Deploy
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
                          onClick={handleSubmit}
                          disabled={isSubmitting || !formData.name}
                          className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="animate-spin">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                              </span>
                              Deploying Contract...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4" />
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
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="inline-flex items-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-secondary/80 border border-border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
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
