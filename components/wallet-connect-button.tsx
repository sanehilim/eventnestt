"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AlertTriangle, Check, ChevronDown, Loader2, LogOut, Wallet } from "lucide-react"
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi"
import { APP_CHAIN } from "@/lib/onchain"

type WalletConnectButtonProps = {
  label?: string
  compact?: boolean
  fullWidth?: boolean
  className?: string
  connectedClassName?: string
}

function shortAddress(address?: `0x${string}`) {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function WalletConnectButton({
  label = "Connect Wallet",
  compact = false,
  fullWidth = false,
  className,
  connectedClassName,
}: WalletConnectButtonProps) {
  const [open, setOpen] = useState(false)
  const [connectingUid, setConnectingUid] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const { address, chain, isConnected } = useAccount()
  const { connectors, connectAsync, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const isWrongChain = isConnected && chain?.id !== APP_CHAIN.id
  const uniqueConnectors = useMemo(() => {
    const seen = new Set<string>()
    return connectors.filter((connector) => {
      const key = `${connector.uid}-${connector.name}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }, [connectors])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const baseButtonClass = cx(
    "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium boty-transition",
    compact ? "px-4 py-2" : "px-6 py-3",
    fullWidth && "w-full",
  )
  const disconnectedClass =
    className ||
    cx(baseButtonClass, "bg-[#1a1a1a] text-white hover:bg-[#333] boty-shadow")
  const connectedClass =
    connectedClassName ||
    className ||
    cx(baseButtonClass, "bg-[#0f766e] text-white hover:bg-[#0d6b63] boty-shadow")

  const connectWallet = async (connector: (typeof uniqueConnectors)[number]) => {
    setConnectingUid(connector.uid)
    try {
      await connectAsync({ connector })
      setOpen(false)
    } finally {
      setConnectingUid(null)
    }
  }

  if (isWrongChain) {
    return (
      <button
        type="button"
        onClick={() => switchChain({ chainId: APP_CHAIN.id })}
        disabled={isSwitching}
        className={cx(baseButtonClass, "bg-[#ef4444] text-white hover:bg-[#dc2626] disabled:opacity-60", className)}
      >
        {isSwitching ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
        Switch to {APP_CHAIN.name}
      </button>
    )
  }

  if (isConnected) {
    return (
      <div ref={rootRef} className={cx("relative", fullWidth && "w-full")}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={connectedClass}
        >
          <Check className="w-4 h-4" />
          {shortAddress(address)}
          <ChevronDown className="w-4 h-4" />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-[80] mt-3 w-72 rounded-xl border border-[#e5e5e5] bg-white p-4 text-left shadow-xl">
            <p className="text-xs uppercase tracking-widest text-[#0f766e] mb-2">Connected</p>
            <p className="font-mono text-sm text-[#1a1a1a] break-all">{address}</p>
            <p className="text-xs text-[#666666] mt-2">{chain?.name ?? APP_CHAIN.name}</p>
            <button
              type="button"
              onClick={() => {
                disconnect()
                setOpen(false)
              }}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#f5f5f5] px-4 py-3 text-sm text-[#1a1a1a] hover:bg-[#e5e5e5] boty-transition"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={rootRef} className={cx("relative", fullWidth && "w-full")}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={disconnectedClass}
      >
        <Wallet className="w-4 h-4" />
        {label}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[80] mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-[#e5e5e5] bg-white p-4 text-left shadow-xl">
          <p className="text-xs uppercase tracking-widest text-[#0f766e] mb-2">Choose Wallet</p>
          <p className="text-sm text-[#666666] mb-4">Use your browser wallet extension to connect on {APP_CHAIN.name}.</p>

          <div className="space-y-2">
            {uniqueConnectors.map((connector) => (
              <button
                key={`${connector.uid}-${connector.name}`}
                type="button"
                onClick={() => connectWallet(connector)}
                disabled={Boolean(connectingUid)}
                className="flex w-full items-center justify-between rounded-lg border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-[#1a1a1a] hover:border-[#0f766e] hover:bg-[#0f766e]/5 disabled:opacity-60 boty-transition"
              >
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#0f766e]" />
                  {connector.name}
                </span>
                {connectingUid === connector.uid && <Loader2 className="w-4 h-4 animate-spin text-[#0f766e]" />}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-3 text-xs text-[#ef4444]">
              {error.message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
