"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, createConfig, http, injected } from "wagmi"
import { APP_CHAIN, APP_RPC_URL } from "@/lib/onchain"

const wagmiConfig = createConfig({
  chains: [APP_CHAIN],
  connectors: [injected()],
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
