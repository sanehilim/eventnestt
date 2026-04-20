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
  title: 'EventNest - Privacy-First Event Ticketing on Fhenix',
  description: 'Create and attend events with complete privacy. Your data stays encrypted on-chain, powered by Fhenix Fully Homomorphic Encryption.',
  keywords: ['events', 'tickets', 'privacy', 'web3', 'blockchain', 'fhenix', 'nft', 'ticketing', 'encrypted'],
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
        <Analytics />
      </body>
    </html>
  )
}
