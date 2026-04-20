"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Search, User, Ticket, Shield } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 backdrop-blur-md rounded-lg py-0 my-0 animate-scale-fade-in bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(18,18,26,0.8)] border border-[rgba(255,255,255,0.32)] dark:border-[rgba(72,72,243,0.15)]" style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px' }}>
        <div className="flex items-center justify-between h-[68px]">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-foreground/80 hover:text-foreground boty-transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Navigation - Left */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/events"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              Events
            </Link>
            <Link
              href="/dashboard"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition flex items-center gap-1.5"
            >
              <Ticket className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <Link
              href="/privacy"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Privacy
            </Link>
          </div>

          {/* Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-3xl tracking-wider text-foreground">
              <span className="gradient-text font-semibold">Event</span>Nest
            </h1>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 text-foreground/70 hover:text-foreground boty-transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/account"
              className="hidden sm:block p-2 text-foreground/70 hover:text-foreground boty-transition"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted
              }) => (
                <div
                  {...(!mounted && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }
                  })}
                >
                  {(() => {
                    if (!mounted || !account) {
                      return (
                        <button
                          type="button"
                          onClick={openConnectModal}
                          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 boty-shadow"
                        >
                          Connect
                        </button>
                      )
                    }
                    if (chain?.unsupported) {
                      return (
                        <button
                          type="button"
                          onClick={openChainModal}
                          className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-medium boty-transition"
                        >
                          Wrong Network
                        </button>
                      )
                    }
                    return (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={openChainModal}
                          className="flex items-center gap-2 bg-secondary text-foreground px-3 py-2 rounded-full text-sm font-medium boty-transition hover:bg-secondary/80 border border-border"
                        >
                          {chain.hasIcon && chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                              className="w-5 h-5 rounded-full"
                            />
                          )}
                          <span className="hidden sm:inline">{chain.name}</span>
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )}
            </ConnectButton.Custom>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden boty-transition ${
            isMenuOpen ? "max-h-64 pb-6" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-4 pt-4 border-t border-border/50">
            <Link
              href="/events"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              href="/dashboard"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition flex items-center gap-1.5"
              onClick={() => setIsMenuOpen(false)}
            >
              <Ticket className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <Link
              href="/privacy"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition flex items-center gap-1.5"
              onClick={() => setIsMenuOpen(false)}
            >
              <Shield className="w-3.5 h-3.5" />
              Privacy
            </Link>
            <Link
              href="/account"
              className="text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Account
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
