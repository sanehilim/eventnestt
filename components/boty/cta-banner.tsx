"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Shield, Lock, Eye, ArrowRight, Zap } from "lucide-react"

export function CTABanner() {
  const [isVisible, setIsVisible] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (bannerRef.current) {
      observer.observe(bannerRef.current)
    }

    return () => {
      if (bannerRef.current) {
        observer.unobserve(bannerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={bannerRef}
          className={`rounded-3xl p-12 md:p-16 flex flex-col justify-center relative overflow-hidden min-h-[400px] transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          </div>

          <div className="relative z-10 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-white" />
              <span className="text-sm uppercase tracking-widest text-white/80">Powered by Fhenix</span>
            </div>
            <h3 className="text-4xl md:text-5xl text-white mb-4 lg:text-6xl font-semibold">
              Privacy-First
            </h3>
            <h3 className="text-3xl md:text-4xl lg:text-5xl text-white/70 mb-8">
              Event Ticketing
            </h3>

            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center gap-3 text-white/90">
                <Lock className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-base">Encrypted Access Control</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Shield className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-base">Private Allowlists</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Eye className="w-5 h-5 text-white flex-shrink-0" />
                <span className="text-base">Selective Disclosure</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Link
                href="/dashboard"
                className="group inline-flex items-center justify-center gap-3 bg-white text-[#6366f1] px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-white/90 boty-shadow"
              >
                Create Your Event
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 boty-transition" />
              </Link>
              <Link
                href="/privacy"
                className="group inline-flex items-center justify-center gap-3 bg-white/10 text-white px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-white/20 border border-white/30"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}