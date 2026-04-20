"use client"

import Link from "next/link"
import { Shield, Lock, Eye, EyeOff, Key, Database, Globe, Zap, ArrowRight, Check } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"

const privacyFeatures = [
  {
    icon: Shield,
    title: "Encrypted Access Control",
    description: "Access rules are encrypted on-chain and verified using Fhenix FHE without revealing the actual conditions.",
    details: [
      "Private invite codes stay hidden",
      "PIN verification happens privately",
      "Wallet eligibility checked on-chain"
    ]
  },
  {
    icon: Lock,
    title: "Confidential Attendee Lists",
    description: "Your attendee list is never public. Only authorized addresses can be verified.",
    details: [
      "Attendee data encrypted on Fhenix",
      "Only event organizer can view list",
      "Selective disclosure to verified users"
    ]
  },
  {
    icon: Eye,
    title: "Hidden Pricing Logic",
    description: "Your pricing tiers, discounts, and VIP conditions remain confidential.",
    details: [
      "Early bird pricing hidden until deadline",
      "VIP tiers only visible to eligible users",
      "Discount codes never publicly visible"
    ]
  },
  {
    icon: Database,
    title: "Encrypted Event Metadata",
    description: "Event details like location, special instructions, and access PINs are stored encrypted.",
    details: [
      "Location revealed only to ticket holders",
      "Special instructions for VIPs stay private",
      "PIN codes never exposed publicly"
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
            Powered by Fhenix
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground mb-6">
            Privacy by <span className="text-primary">Design</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            EventNest uses Fully Homomorphic Encryption (FHE) to ensure your event data, attendee lists, and pricing remain private while still being verifiable on-chain.
          </p>
        </div>

        {/* How it Works */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl text-foreground mb-4">How Privacy Works</h2>
            <p className="text-lg text-muted-foreground">From public blockchain to private computations</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: "Encrypt", desc: "Your data is encrypted using Fhenix SDK before being sent on-chain" },
              { step: 2, title: "Store", desc: "Encrypted data is stored in smart contracts on Fhenix" },
              { step: 3, title: "Verify", desc: "Access conditions are verified on encrypted data without decryption" },
              { step: 4, title: "Reveal", desc: "Only verified users receive decrypted access to specific data" }
            ].map((item) => (
              <div key={item.step} className="bg-card rounded-2xl p-6 border border-border text-center boty-shadow">
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
            <p className="text-lg text-muted-foreground">Everything you need to keep confidential</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {privacyFeatures.map((feature) => (
              <div key={feature.title} className="bg-card rounded-3xl p-8 border border-border boty-shadow">
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
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border border-primary/20">
            <h2 className="font-serif text-4xl text-foreground mb-8 text-center">Traditional vs EventNest</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional */}
              <div>
                <h3 className="font-serif text-2xl text-destructive mb-6">Traditional</h3>
                <ul className="space-y-4">
                  {[
                    "Attendee list fully public",
                    "Pricing visible to everyone",
                    "Invite codes in plain text",
                    "Access rules on-chain readable",
                    "VIP tiers exposed",
                    "Location publicly visible"
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
                    "Attendee list encrypted",
                    "Pricing hidden until verified",
                    "Invite codes never exposed",
                    "Access rules encrypted on FHE",
                    "VIP tiers selective disclosure",
                    "Location only to ticket holders"
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
          <h2 className="font-serif text-4xl text-foreground mb-6">Ready to Go Private?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start creating privacy-first events today. Your data stays encrypted on-chain.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
            >
              Create Private Event
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
