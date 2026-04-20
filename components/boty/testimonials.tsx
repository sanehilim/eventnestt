"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Lock, Star, ArrowRight } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Alex Chen",
    location: "San Francisco",
    rating: 5,
    text: "EventNest transformed how we handle VIP guest lists. Our pricing tiers stay completely private while being verifiable on-chain.",
    event: "Web3 Summit"
  },
  {
    id: 2,
    name: "Sarah Miller",
    location: "Berlin",
    rating: 5,
    text: "Finally, an event platform that respects privacy. The encrypted access control is seamless for attendees while being bulletproof.",
    event: "Underground Rave"
  },
  {
    id: 3,
    name: "Marcus Johnson",
    location: "London",
    rating: 5,
    text: "The Fhenix integration is incredible. Our exclusive pre-sale data stayed private, and only authorized wallets could access it.",
    event: "DeFi Conference"
  },
  {
    id: 4,
    name: "Emma Watson",
    location: "New York",
    rating: 5,
    text: "As an event organizer, the ability to hide pricing tiers and offer private discounts has been a game-changer for our premium events.",
    event: "Crypto Art Expo"
  },
  {
    id: 5,
    name: "David Park",
    location: "Tokyo",
    rating: 5,
    text: "The selective disclosure feature lets us reward loyal attendees without revealing their full purchase history to others.",
    event: "NFT Launch Party"
  },
  {
    id: 6,
    name: "Lisa Thompson",
    location: "Miami",
    rating: 5,
    text: "Privacy-first by design, not by policy. The encryption happens automatically - attendees dont need to do anything special.",
    event: "VIP Gala"
  },
  {
    id: 7,
    name: "James Wilson",
    location: "Dubai",
    rating: 5,
    text: "EventNest handles our most exclusive events with complete confidentiality. The technology is invisible but the results speak for themselves.",
    event: "VIP Gala"
  },
  {
    id: 8,
    name: "Nina Rodriguez",
    location: "Austin",
    rating: 5,
    text: "The PIN-based entry system is genius. We can verify eligibility without ever storing or revealing the actual PINs.",
    event: "Hackathon"
  },
  {
    id: 9,
    name: "Ryan Lee",
    location: "Singapore",
    rating: 5,
    text: "Built on Fhenix, powered by privacy. This is exactly what Web3 events needed - real confidentiality, not just pseudo-anonymity.",
    event: "Web3 Summit"
  }
]

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <div className="rounded-3xl p-6 bg-white mb-4 flex-shrink-0 border border-[#e5e5e5]"
    style={{
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
    }}
  >
    {/* Stars */}
    <div className="flex gap-1 mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
      ))}
    </div>

    {/* Quote */}
    <p className="text-[#1a1a1a]/80 leading-relaxed mb-4 text-pretty font-medium text-lg">
      &ldquo;{testimonial.text}&rdquo;
    </p>

    {/* Author */}
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-[#1a1a1a] text-sm font-bold">{testimonial.name}</p>
        <p className="text-xs text-[#666666]">{testimonial.location}</p>
      </div>
      <span className="text-xs tracking-wide text-[#6366f1] bg-[#6366f1]/10 px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
        <Lock className="w-3 h-3" />
        {testimonial.event}
      </span>
    </div>
  </div>
)

export function Testimonials() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  const column1 = [testimonials[0], testimonials[3], testimonials[6]]
  const column2 = [testimonials[1], testimonials[4], testimonials[7]]
  const column3 = [testimonials[2], testimonials[5], testimonials[8]]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (headerRef.current) {
      observer.observe(headerRef.current)
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-[#f5f5f5] overflow-hidden pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className={`text-sm tracking-[0.3em] uppercase text-[#6366f1] mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
            Testimonials
          </span>
          <h2 className={`text-4xl leading-tight text-[#1a1a1a] text-balance md:text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
            Trusted by Event Organizers
          </h2>
          <p className="text-lg text-[#666666] mt-4 max-w-md mx-auto">
            See what organizers and attendees say about privacy-first event ticketing.
          </p>
        </div>

        {/* Scrolling Testimonials */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#f5f5f5] to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f5f5f5] to-transparent z-10 pointer-events-none" />

          {/* Mobile - Single Column */}
          <div className="md:hidden h-[600px]">
            <div className="relative overflow-hidden h-full">
              <div className="animate-scroll-down">
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                  <TestimonialCard key={`mobile-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop - Three Columns */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 h-[600px]">
            {/* Column 1 - Scrolling Down */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-down">
                {[...column1, ...column1].map((testimonial, index) => (
                  <TestimonialCard key={`col1-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>

            {/* Column 2 - Scrolling Up */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-up">
                {[...column2, ...column2].map((testimonial, index) => (
                  <TestimonialCard key={`col2-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>

            {/* Column 3 - Scrolling Down */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-down">
                {[...column3, ...column3].map((testimonial, index) => (
                  <TestimonialCard key={`col3-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-down {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        @keyframes scroll-up {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-scroll-down {
          animation: scroll-down 30s linear infinite;
        }

        .animate-scroll-up {
          animation: scroll-up 30s linear infinite;
        }
      `}</style>
    </section>
  )
}