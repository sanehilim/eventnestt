"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Shield, Lock, Eye, EyeOff, Key, Database, Globe, Save, AlertCircle } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { ConnectButton } from "@rainbow-me/rainbowkit"
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
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <main className="min-h-screen bg-background grid-pattern">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary boty-transition mb-8"
          >
            Back to Dashboard
          </Link>

          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Settings</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Configure your default event form settings for this browser and wallet
          </p>

          <div className="space-y-6">
            <div className="bg-card rounded-3xl p-8 border border-border boty-shadow">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-2xl text-foreground">Privacy Defaults</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">Default to Private</h3>
                      <p className="text-sm text-muted-foreground">New events are private by default</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, defaultPrivate: !settings.defaultPrivate })}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      settings.defaultPrivate ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.defaultPrivate ? "translate-x-7" : "translate-x-1"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">Require Invite Code</h3>
                      <p className="text-sm text-muted-foreground">New private events require invite codes</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, requireInviteCode: !settings.requireInviteCode })}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      settings.requireInviteCode ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.requireInviteCode ? "translate-x-7" : "translate-x-1"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">Whitelist Only</h3>
                      <p className="text-sm text-muted-foreground">Only approved wallets can register</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, requireWhitelist: !settings.requireWhitelist })}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      settings.requireWhitelist ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.requireWhitelist ? "translate-x-7" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border boty-shadow">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-2xl text-foreground">Pricing & Visibility</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <EyeOff className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">Hide Pricing</h3>
                      <p className="text-sm text-muted-foreground">Ticket prices hidden until verified</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, hidePricing: !settings.hidePricing })}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      settings.hidePricing ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.hidePricing ? "translate-x-7" : "translate-x-1"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-foreground">Auto-Encrypt Metadata</h3>
                      <p className="text-sm text-muted-foreground">Keep metadata private in your organizer workflow</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, autoEncryptMetadata: !settings.autoEncryptMetadata })}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      settings.autoEncryptMetadata ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.autoEncryptMetadata ? "translate-x-7" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border boty-shadow">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-primary" />
                <h2 className="font-serif text-2xl text-foreground">Notifications</h2>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-medium text-foreground">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Get notified about ticket sales and registrations</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    settings.notifications ? "bg-primary" : "bg-border"
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.notifications ? "translate-x-7" : "translate-x-1"
                  }`} />
                </button>
              </div>
            </div>

            <div className="bg-card rounded-3xl p-8 border border-border boty-shadow">
              <h2 className="font-serif text-2xl text-foreground mb-6">Connected Wallet</h2>
              <ConnectButton.Custom>
                {({ account, chain, openConnectModal, openAccountModal, openChainModal, mounted }) => (
                  <div {...(!mounted && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none" } })}>
                    {!mounted || !account ? (
                      <button
                        type="button"
                        onClick={openConnectModal}
                        className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
                      >
                        Connect Wallet
                      </button>
                    ) : chain?.unsupported ? (
                      <button
                        type="button"
                        onClick={openChainModal}
                        className="w-full bg-destructive text-destructive-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition"
                      >
                        Wrong Network - Switch
                      </button>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                        <div>
                          <p className="font-mono text-foreground">{account.displayName}</p>
                          <p className="text-sm text-muted-foreground">{chain?.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={openAccountModal}
                          className="text-sm text-primary hover:text-primary/80 boty-transition"
                        >
                          Manage
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </ConnectButton.Custom>
            </div>

            <div className="flex items-center justify-end gap-4">
              {isSaved && (
                <span className="text-sm text-primary flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Settings saved in this browser
                </span>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 glow-primary"
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
