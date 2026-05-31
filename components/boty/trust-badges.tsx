"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Lock, Eye, Zap } from "lucide-react"

const badges = [
  {
    icon: Shield,
    title: "Encrypted Access",
    description: "Invite credentials stay confidential"
  },
  {
    icon: Lock,
    title: "On-Chain Tickets",
    description: "Transferable ERC721 passes"
  },
  {
    icon: Eye,
    title: "Wallet Gating",
    description: "Allowlist-ready events"
  },
  {
    icon: Zap,
    title: "CoFHE Sepolia",
    description: "FHE invite checks are live"
  }
]

export function TrustBadges() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = sectionRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (node) {
      observer.observe(node)
    }

    return () => {
      if (node) {
        observer.unobserve(node)
      }
    }
  }, [])

  return (
    <section className="relative z-20 -mt-10 pb-16 sm:-mt-12 sm:pb-20 lg:-mt-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={sectionRef}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {badges.map((badge, index) => (
            <div
              key={badge.title}
              className={`min-w-0 rounded-lg border border-[#e5e5e5] bg-white p-5 text-center shadow-[0_18px_55px_rgba(15,118,110,0.10)] transition-all duration-700 ease-out sm:p-6 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <badge.icon className="text-[#0f766e] mb-4 mx-auto size-9" strokeWidth={1.5} />
              <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">{badge.title}</h3>
              <p className="text-sm leading-relaxed text-[#666666]">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
