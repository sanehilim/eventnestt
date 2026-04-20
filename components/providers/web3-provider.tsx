"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, createConfig, http } from "wagmi"
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit"
import { mainnet, sepolia } from "wagmi/chains"
import { injected, metaMask, coinbaseWallet, walletConnect } from "wagmi/connectors"

import "@rainbow-me/rainbowkit/styles.css"

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id"

const wagmiConfig = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: "EventNest" }),
    walletConnect({ projectId }),
  ],
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia.publicnode.com"),
    [mainnet.id]: http("https://ethereum.publicnode.com"),
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