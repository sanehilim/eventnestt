"use client"

import Link from "next/link"
import { Shield, Lock, Eye, EyeOff, Key, Database, Globe, Zap, ArrowRight, Check } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"

const privacyFeatures = [
  {
    icon: Shield,
    title: "Confidential Invite Checks",
    description: "New invite credentials are encrypted in the browser and compared on-chain through CoFHE.",
    details: [
      "Invite credentials are not stored in plaintext",
      "The contract stores encrypted credential handles",
      "Minting verifies a threshold-signed decrypt result"
    ]
  },
  {
    icon: Lock,
    title: "Wallet Allowlist Controls",
    description: "Organizers can require approved wallets, add or remove addresses, and keep access changes auditable.",
    details: [
      "Allowlist-only events are supported",
      "Wallet updates are contract transactions",
      "Duplicate tickets are blocked per wallet"
    ]
  },
  {
    icon: Eye,
    title: "Paid Ticket Rules",
    description: "Ticket price, capacity, transfers, and check-in status are handled by the contract.",
    details: [
      "Exact payment is required at mint",
      "Funds are released to the organizer",
      "Sold-out events reject new tickets"
    ]
  },
  {
    icon: Database,
    title: "Honest Public State",
    description: "Event commerce data stays public by design, while invite credentials use the confidential path.",
    details: [
      "Event metadata and ticket ownership are public",
      "Wallet allowlists are public contract state",
      "Privacy claims match the deployed Sepolia contract"
    ]
  }
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background grid-pattern">
      <Header />

      <div className="pt-28 pb-20">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
            <Zap className="w-4 h-4" />
            CoFHE confidential credentials
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground mb-6">
            Privacy by <span className="text-primary">Design</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            EventNest protects gated events with encrypted invite credentials, wallet allowlists, NFT tickets, and on-chain check-in. Event metadata and ownership remain public blockchain state.
          </p>
        </div>

        {/* How it Works */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl text-foreground mb-4">How Access Privacy Works</h2>
            <p className="text-lg text-muted-foreground">Encrypted invite checks with on-chain ticket settlement</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Encrypt", desc: "Invite credentials are encrypted in the browser with the CoFHE SDK" },
              { step: 2, title: "Store", desc: "The contract stores encrypted credential handles and public event rules" },
              { step: 3, title: "Compare", desc: "Attendee credentials are compared through FHE equality checks" },
              { step: 4, title: "Mint", desc: "A verified decrypt result unlocks the ticket mint transaction" }
            ].map((item) => (
              <div key={item.step} className="bg-card rounded-lg p-6 border border-border text-center boty-shadow">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="font-serif text-xl text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Features */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl text-foreground mb-4">What Stays Private</h2>
            <p className="text-lg text-muted-foreground">What is confidential and what remains public</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {privacyFeatures.map((feature) => (
              <div key={feature.title} className="bg-card rounded-xl p-8 border border-border boty-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-2 text-sm text-foreground/80">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison */}
        <div className="max-w-4xl mx-auto px-6 lg:px-8 mb-20">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8 border border-primary/20">
            <h2 className="font-serif text-4xl text-foreground mb-8 text-center">Traditional vs EventNest</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional */}
              <div>
                <h3 className="font-serif text-2xl text-destructive mb-6">Traditional</h3>
                <ul className="space-y-4">
                  {[
                    "Manual attendee spreadsheets",
                    "Payment reconciliation off-chain",
                    "Invite codes shared in plain text",
                    "Duplicate tickets possible",
                    "Check-in status easy to spoof",
                    "Access changes hard to audit"
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-muted-foreground">
                      <Eye className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* EventNest */}
              <div>
                <h3 className="font-serif text-2xl text-primary mb-6">EventNest</h3>
                <ul className="space-y-4">
                  {[
                    "NFT ticket ownership tracked",
                    "Ticket price enforced by contract",
                    "Encrypted invite credential checks",
                    "One ticket per wallet per event",
                    "QR check-in writes to chain",
                    "CoFHE flow live on Sepolia"
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-foreground">
                      <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-serif text-4xl text-foreground mb-6">Ready to Gate Events on Chain?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start creating events with confidential invite access, allowlists, paid NFT tickets, transfers, and check-in.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
            >
              Create Gated Event
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 bg-secondary text-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-secondary/80 border border-border"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
