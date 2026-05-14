"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, createConfig, http } from "wagmi"
import { injected, coinbaseWallet, walletConnect } from "wagmi/connectors"
import { APP_CHAIN, APP_RPC_URL } from "@/lib/onchain"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim()

const connectors = [
  injected(),
  coinbaseWallet({ appName: "EventNest" }),
  ...(projectId ? [walletConnect({ projectId })] : []),
]

const wagmiConfig = createConfig({
  chains: [APP_CHAIN],
  connectors,
  transports: {
    [APP_CHAIN.id]: http(APP_RPC_URL),
  },
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
