"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, createConfig, http } from "wagmi"
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit"
import { injected, metaMask, coinbaseWallet, walletConnect } from "wagmi/connectors"
import { APP_CHAIN, APP_RPC_URL } from "@/lib/onchain"

import "@rainbow-me/rainbowkit/styles.css"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim()

const connectors = [
  injected(),
  metaMask(),
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

// Light theme matching EventNest's white aesthetic
const customTheme = lightTheme({
  accentColor: "#6366f1",
  accentColorForeground: "white",
  borderRadius: "large",
  fontStack: "system",
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            ...customTheme,
            colors: {
              ...customTheme.colors,
              modalBackground: "#ffffff",
              modalBorder: "#e5e5e5",
              modalText: "#1a1a1a",
              modalTextDim: "#666666",
              profileForeground: "#1a1a1a",
              closeButton: "#1a1a1a",
              closeButtonBackground: "#f5f5f5",
              connectButtonBackground: "#6366f1",
              connectButtonText: "white",
            },
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
