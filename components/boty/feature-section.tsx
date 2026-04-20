"use client"

import Link from "next/link"
import { Shield, Lock, Eye, Users, Ticket, Zap } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Encrypted Access",
    description: "Private invite codes & PIN-based entry"
  },
  {
    icon: Lock,
    title: "Hidden Pricing",
    description: "Confidential payment conditions"
  },
  {
    icon: Eye,
    title: "Private Attendance",
    description: "Encrypted attendee validation"
  },
  {
    icon: Users,
    title: "Selective Disclosure",
    description: "Different data for different users"
  }
]

export function FeatureSection() {
  return (
    <section className="py-24 bg-background grid-pattern">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Bento Grid */}
        <div className="grid md:grid-cols-4 mb-20 md:grid-rows-[300px_300px] gap-6">
          {/* Left Large Block - Video with Overlay Card */}
          <div className="relative rounded-3xl overflow-hidden h-[500px] md:h-auto md:col-span-2 md:row-span-2 transition-all duration-700 ease-out opacity-100 scale-100">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/c4baaf67-b900-4b90-af2a-daf25a5a4b78-5un5eTbj9Z67qEtEdsQwlYrte9dZM9.mp4" type="video/mp4" />
            </video>
            {/* Overlay Card */}
            <div className="absolute bottom-8 left-8 right-8 bg-card p-6 shadow-lg rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl text-foreground mb-2 font-medium">
                    Powered by <span className="text-primary">Fhenix</span>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Fully Homomorphic Encryption enables private computations directly on encrypted data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Right - Encrypted */}
          <div className="rounded-3xl p-6 md:p-8 flex flex-col justify-center md:col-span-2 relative overflow-hidden transition-all duration-700 ease-out bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/20">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <Lock className="w-8 h-8 text-primary" />
                <span className="text-xs uppercase tracking-widest text-primary">On-Chain Privacy</span>
              </div>
              <h3 className="text-3xl md:text-4xl text-foreground mb-2">
                Encrypted
              </h3>
              <h3 className="text-2xl md:text-3xl text-foreground/70 mb-4">
                Everything
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground/90 text-sm">
                  <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Private Event Access</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/90 text-sm">
                  <Ticket className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Hidden Invite Systems</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/90 text-sm">
                  <Users className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Encrypted Allowlists</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right - Web3 Native */}
          <div className="rounded-3xl p-6 md:p-8 flex flex-col justify-center relative overflow-hidden md:col-span-2 transition-all duration-700 ease-out bg-secondary border border-border">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            >
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/a0b7c364-afa9-4afa-9716-45718578cc01-Ih8UaqQr1bl8aoNlbRha4FgaQ65eXX.mp4" type="video/mp4" />
            </video>

            <div className="relative z-10 flex flex-col justify-center h-full text-left items-start">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-3">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-sans text-base mb-1 text-foreground">
                Web3 Native
              </h3>
              <h3 className="text-2xl md:text-3xl mb-2 text-foreground">
                NFT Ticketing
              </h3>
              <p className="text-sm text-muted-foreground">
                Each ticket is a unique NFT that cannot be duplicated or faked.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center my-0 py-20">
          {/* Video */}
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden boty-shadow transition-all duration-700 ease-out opacity-100 scale-100">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0c826034-d4f2-4d4f-8e99-50e94e4ce63f-dG1CBOjR36xFPTbhcROrHbomGXtlTQ.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Content */}
          <div className="transition-all duration-700 ease-out opacity-100 translate-y-0">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block animate-blur-in opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              Why EventNest
            </span>
            <h2 className="font-serif text-4xl leading-tight text-foreground mb-6 text-balance md:text-7xl animate-blur-in opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              Privacy without compromise.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-md animate-blur-in opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              EventNest brings true privacy to Web3 events. Your attendee data, pricing strategies, and access rules stay encrypted while still being verifiable on-chain.
            </p>

            {/* Feature Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group p-5 boty-transition hover:scale-[1.02] rounded-md bg-card border border-border"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 group-hover:bg-primary/20 boty-transition bg-secondary">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
