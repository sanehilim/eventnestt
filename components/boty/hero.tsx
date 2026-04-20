"use client"

import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#f5f5f5]">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-40"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full pt-20 mr-14 lg:mr-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="w-full lg:max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <span className="text-sm uppercase mb-6 block text-[#6366f1] animate-blur-in opacity-0 tracking-normal flex items-center gap-2 justify-center lg:justify-start" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <Shield className="w-4 h-4" />
              Privacy-First Event Ticketing
            </span>
            <h2 className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 text-balance text-[#1a1a1a]">
              <span className="block animate-blur-in opacity-0 font-semibold" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                <span className="gradient-text">EventNest</span>
              </span>
              <span className="block animate-blur-in opacity-0 font-semibold xl:text-9xl text-7xl" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>Private. Secure.</span>
            </h2>
            <p className="text-lg leading-relaxed mb-10 max-w-md mx-auto lg:mx-0 text-[#666666] animate-blur-in opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              Create and attend events with complete privacy. Your data stays encrypted on-chain, powered by Fhenix Fully Homomorphic Encryption.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-blur-in opacity-0" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
              <Link
                href="/events"
                className="group inline-flex items-center justify-center gap-3 bg-[#1a1a1a] text-white px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-[#333] boty-shadow"
              >
                Explore Events
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 boty-transition" />
              </Link>
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-3 bg-white text-[#1a1a1a] px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-[#f5f5f5] border border-[#e5e5e5]"
              >
                <Shield className="w-4 h-4" />
                Create Event
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#666666]">
        <span className="text-xs tracking-widest uppercase font-bold">Scroll</span>
        <div className="w-px h-12 bg-[#e5e5e5] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-[#1a1a1a] animate-pulse" />
        </div>
      </div>
    </section>
  )
}