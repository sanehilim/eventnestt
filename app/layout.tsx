import React from "react"
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Web3Provider } from '@/components/providers/web3-provider'
import './globals.css'

const geistSans = Geist({
  subsets: ["latin"],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'EventNest - On-Chain Event Ticketing',
  description: 'Create, gate, sell, transfer, and check in NFT tickets with hashed invite codes and wallet allowlists on Sepolia. Built with a CoFHE/Fhenix privacy roadmap.',
  keywords: ['events', 'tickets', 'privacy', 'web3', 'blockchain', 'fhenix', 'nft', 'ticketing', 'allowlist'],
  icons: {
    icon: [
      {
        url: '/image.png',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <Web3Provider>
          {children}
        </Web3Provider>
        {process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  )
}
