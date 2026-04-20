"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, createConfig, http } from "wagmi"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
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

const customTheme = darkTheme({
  accentColor: "#00D4FF",
  accentColorForeground: "#0A0A0F",
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
              modalBackground: "#12121A",
              modalBorder: "#2A2A3E",
              modalText: "#F0F4FF",
              modalTextDim: "#8B8B9E",
              profileForeground: "#F0F4FF",
              closeButton: "#F0F4FF",
              closeButtonBackground: "#1A1A2E",
              connectButtonBackground: "#00D4FF",
              connectButtonText: "#0A0A0F",
            },
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
