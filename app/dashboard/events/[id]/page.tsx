"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Check, Loader2, Shield } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useEvent, useManageEventAccess } from "@/hooks/use-events"

function parseWallets(value: string) {
  return value
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean) as `0x${string}`[]
}

export default function ManageEventAccessPage() {
  const params = useParams()
  const eventId = Number(params.id)
  const { event, loading } = useEvent(eventId)
  const { addWhitelist, updateInviteCode } = useManageEventAccess()

  const [inviteCode, setInviteCode] = useState("")
  const [walletList, setWalletList] = useState("")
  const [isSavingInvite, setIsSavingInvite] = useState(false)
  const [isSavingWhitelist, setIsSavingWhitelist] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")

  const wallets = useMemo(() => parseWallets(walletList), [walletList])

  const handleSaveInvite = async () => {
    if (!inviteCode.trim()) return
    setIsSavingInvite(true)
    setStatusMessage("")
    try {
      await updateInviteCode(eventId, inviteCode)
      setStatusMessage("Invite code updated on-chain.")
    } catch (error) {
      console.error(error)
      setStatusMessage("Failed to update invite code.")
    } finally {
      setIsSavingInvite(false)
    }
  }

  const handleAddWhitelist = async () => {
    if (wallets.length === 0) return
    setIsSavingWhitelist(true)
    setStatusMessage("")
    try {
      await addWhitelist(eventId, wallets)
      setStatusMessage("Whitelist updated on-chain.")
      setWalletList("")
    } catch (error) {
      console.error(error)
      setStatusMessage("Failed to update whitelist.")
    } finally {
      setIsSavingWhitelist(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-2 text-[#666666] hover:text-[#1a1a1a] boty-transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Events
          </Link>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#6366f1] animate-spin" />
            </div>
          ) : !event ? (
            <div className="bg-[#f5f5f5] rounded-3xl p-10 border border-[#e5e5e5] text-center">
              <h1 className="text-3xl text-[#1a1a1a] mb-2">Event Not Found</h1>
              <p className="text-[#666666]">This event could not be loaded from the contract.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#f5f5f5] rounded-3xl p-8 border border-[#e5e5e5]">
                <h1 className="text-4xl text-[#1a1a1a] mb-2">{event.name}</h1>
                <p className="text-[#666666]">{event.description}</p>
              </div>

              <div className="bg-[#f5f5f5] rounded-3xl p-8 border border-[#e5e5e5]">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-[#6366f1]" />
                  <h2 className="text-2xl text-[#1a1a1a]">Manage Access</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                      Invite Code
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={inviteCode}
                        onChange={(eventValue) => setInviteCode(eventValue.target.value)}
                        placeholder="Set or rotate the invite code"
                        className="flex-1 bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 boty-transition"
                      />
                      <button
                        type="button"
                        onClick={handleSaveInvite}
                        disabled={isSavingInvite || !inviteCode.trim()}
                        className="bg-[#6366f1] text-white px-6 py-4 rounded-full text-sm font-medium boty-transition hover:bg-[#5558e3] disabled:opacity-50"
                      >
                        {isSavingInvite ? "Saving..." : "Save Invite Code"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                      Whitelist Wallets
                    </label>
                    <textarea
                      value={walletList}
                      onChange={(eventValue) => setWalletList(eventValue.target.value)}
                      placeholder="Paste one wallet per line or separate addresses with commas"
                      rows={6}
                      className="w-full bg-white border border-[#e5e5e5] rounded-xl px-4 py-4 text-[#1a1a1a] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/50 boty-transition resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddWhitelist}
                      disabled={isSavingWhitelist || wallets.length === 0}
                      className="mt-3 bg-[#1a1a1a] text-white px-6 py-4 rounded-full text-sm font-medium boty-transition hover:bg-[#333] disabled:opacity-50"
                    >
                      {isSavingWhitelist ? "Saving..." : "Add To Whitelist"}
                    </button>
                  </div>

                  {statusMessage && (
                    <div className="bg-white rounded-2xl p-4 border border-[#e5e5e5] flex items-center gap-2 text-sm text-[#1a1a1a]">
                      <Check className="w-4 h-4 text-[#10b981]" />
                      {statusMessage}
                    </div>
                  )}
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
