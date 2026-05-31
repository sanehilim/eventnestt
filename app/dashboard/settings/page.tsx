"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Database, Key, Lock, Save, Shield } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useAccount } from "wagmi"
import {
  defaultDashboardSettings,
  readDashboardSettings,
  saveDashboardSettings,
} from "@/lib/dashboard-settings"

export default function SettingsPage() {
  const { address } = useAccount()
  const [settings, setSettings] = useState(defaultDashboardSettings)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSettings(readDashboardSettings(address))
    }, 0)

    return () => window.clearTimeout(timer)
  }, [address])

  const handleSave = () => {
    saveDashboardSettings(settings, address)
    setIsSaved(true)
    window.setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-[#666666] hover:text-[#1a1a1a] boty-transition mb-8"
          >
            Back to Dashboard
          </Link>

          <h1 className="text-4xl md:text-5xl text-[#1a1a1a] mb-4">Settings</h1>
          <p className="text-lg text-[#666666] mb-12">
            Configure the default access settings used when this wallet creates new events.
          </p>

          <div className="space-y-6">
            <div className="bg-[#f5f5f5] rounded-xl p-8 border border-[#e5e5e5] boty-shadow">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-[#0f766e]" />
                <h2 className="text-2xl text-[#1a1a1a]">Event Defaults</h2>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "defaultPrivate",
                    title: "Default to Private",
                    description: "New events start with controlled registration enabled.",
                    icon: Lock,
                  },
                  {
                    key: "requireInviteCode",
                    title: "Require Invite Code",
                    description: "New events require a confidential invite credential before minting.",
                    icon: Key,
                  },
                  {
                    key: "requireWhitelist",
                    title: "Whitelist Only",
                    description: "New events require organizer-approved wallets.",
                    icon: Database,
                  },
                ].map((item) => {
                  const Icon = item.icon
                  const key = item.key as keyof typeof settings
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-4 rounded-lg border border-[#e5e5e5] bg-white p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-[#0f766e]" />
                        <div>
                          <h3 className="font-medium text-[#1a1a1a]">{item.title}</h3>
                          <p className="text-sm text-[#666666]">{item.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettings({ ...settings, [key]: !settings[key] })}
                        className={`relative h-6 w-12 rounded-full transition-colors ${
                          settings[key] ? "bg-[#0f766e]" : "bg-[#d4d4d4]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                            settings[key] ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>

              <p className="mt-5 text-sm text-[#666666]">
                These settings only prefill the create-event form. The deployed contract remains the source of truth for
                invite-code, whitelist, payment, and ticket rules.
              </p>
            </div>

            <div className="bg-[#f5f5f5] rounded-xl p-8 border border-[#e5e5e5] boty-shadow">
              <h2 className="text-2xl text-[#1a1a1a] mb-6">Connected Wallet</h2>
              <WalletConnectButton fullWidth />
            </div>

            <div className="flex items-center justify-end gap-4">
              {isSaved && (
                <span className="text-sm text-[#0f766e] flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Settings saved in this browser
                </span>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 bg-[#0f766e] text-white px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-[#0d6b63] boty-shadow"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
