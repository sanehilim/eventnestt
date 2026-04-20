"use client"

import { useState } from "react"
import { Shield, Mail, ArrowRight } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    setTimeout(() => {
      setStatus("success")
      setEmail("")
    }, 1500)
  }

  return (
    <section className="py-24 bg-[#f5f5f5] border-t border-[#e5e5e5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#6366f1]/10 mb-6">
            <Lock className="w-8 h-8 text-[#6366f1]" />
          </div>
          <h2 className="text-4xl md:text-5xl text-[#1a1a1a] mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-[#666666] mb-10">
            Get the latest on privacy-first event ticketing, Fhenix updates, and exclusive event invites.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-[#e5e5e5] rounded-full px-12 py-4 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 boty-transition"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-[#1a1a1a] text-white px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-[#333] boty-shadow disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <span className="animate-spin">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              ) : status === "success" ? (
                <>
                  <Shield className="w-4 h-4" />
                  Subscribed
                </>
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {status === "success" && (
            <p className="text-sm text-[#6366f1] mt-4">
              You are subscribed. Welcome to the privacy-first community.
            </p>
          )}

          <p className="text-xs text-[#999999] mt-6">
            Your email stays private. We never share or sell your data.
          </p>
        </div>
      </div>
    </section>
  )
}