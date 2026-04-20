"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Lock, Eye, Zap } from "lucide-react"

const badges = [
  {
    icon: Shield,
    title: "Encrypted Access",
    description: "Zero-knowledge proofs"
  },
  {
    icon: Lock,
    title: "Private Data",
    description: "On-chain confidentiality"
  },
  {
    icon: Eye,
    title: "Selective Reveal",
    description: "You control what others see"
  },
  {
    icon: Zap,
    title: "Fhenix Powered",
    description: "Fully homomorphic encryption"
  }
]

export function TrustBadges() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section className="py-20 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={sectionRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {badges.map((badge, index) => (
            <div
              key={badge.title}
              className={`bg-secondary p-6 lg:p-8 text-center rounded-xl border border-border transition-all duration-700 ease-out ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <badge.icon className="text-primary mb-4 mx-auto size-12" strokeWidth={1} />
              <h3 className="font-serif text-foreground mb-2 text-2xl">{badge.title}</h3>
              <p className="text-sm text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
