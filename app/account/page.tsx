"use client"

import Link from "next/link"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { User, Mail, Wallet, Key, ExternalLink, Copy, Check } from "lucide-react"
import { useState } from "react"

export default function AccountPage() {
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl text-[#1a1a1a] mb-8">Account</h1>

          {!isConnected ? (
            <div className="bg-[#f5f5f5] rounded-3xl p-8 border border-[#e5e5e5] text-center">
              <User className="w-16 h-16 text-[#666666] mx-auto mb-4" />
              <h2 className="text-2xl text-[#1a1a1a] mb-2">Connect Your Wallet</h2>
              <p className="text-[#666666] mb-6">Connect your wallet to view your account details and tickets.</p>
              <ConnectButton />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Wallet Card */}
              <div className="bg-[#f5f5f5] rounded-3xl p-8 border border-[#e5e5e5]">
                <div className="flex items-center gap-3 mb-6">
                  <Wallet className="w-6 h-6 text-[#6366f1]" />
                  <h2 className="text-xl text-[#1a1a1a]">Connected Wallet</h2>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-[#e5e5e5]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#6366f1]/10 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-[#6366f1]" />
                      </div>
                      <div>
                        <p className="text-sm text-[#666666]">Ethereum Address</p>
                        <p className="font-mono text-[#1a1a1a]">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={copyAddress}
                      className="p-2 text-[#666666] hover:text-[#1a1a1a] boty-transition"
                      title="Copy address"
                    >
                      {copied ? <Check className="w-5 h-5 text-[#10b981]" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-[#666666]">
                  <Key className="w-4 h-4" />
                  <span>Your tickets and event access are tied to this wallet address</span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-[#f5f5f5] rounded-3xl p-8 border border-[#e5e5e5]">
                <h2 className="text-xl text-[#1a1a1a] mb-4">Quick Links</h2>
                <div className="space-y-3">
                  <Link
                    href="/tickets"
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#e5e5e5] hover:border-[#6366f1] boty-transition"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[#6366f1]" />
                      <span className="text-[#1a1a1a]">My Tickets</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#666666]" />
                  </Link>
                  <Link
                    href="/dashboard/events"
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#e5e5e5] hover:border-[#6366f1] boty-transition"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#6366f1]" />
                      <span className="text-[#1a1a1a]">My Events</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#666666]" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
