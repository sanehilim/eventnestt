# EventNest - Privacy-First Event Ticketing on Fhenix

**EventNest** is a privacy-first decentralized event ticketing platform built on Fhenix using Fully Homomorphic Encryption (FHE).

## What is EventNest?

EventNest allows event organizers to:
- Create public or private events
- Sell tickets securely
- Control access rules with encrypted invite codes
- Manage attendees privately
- **Without exposing sensitive data on-chain**

## Key Features

### Core Privacy Features
- **Encrypted Access Control**: Private invite codes and PIN-based entry verified on-chain
- **Hidden Pricing Logic**: Confidential payment conditions that stay private
- **Private Attendee Lists**: Only you know who is attending
- **Selective Disclosure**: Different data for different users
- **NFT Tickets**: Each ticket is a unique NFT that cannot be duplicated

### Technical Features
- Built on **Fhenix** - Fully Homomorphic Encryption for smart contracts
- **On-chain privacy** - All access conditions verified without decryption
- **Wallet-based verification** - Connect with MetaMask, WalletConnect, etc.
- **Web3 native** - No centralized server dependency

## How It Works

1. **Create Event**: Organizer creates event with public metadata and encrypted private rules
2. **Set Privacy**: Configure invite codes, PINs, whitelist, VIP rules
3. **Attendee Verification**: Fhenix verifies access on encrypted data
4. **NFT Minting**: Verified users receive NFT tickets

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Web3**: wagmi, viem, RainbowKit
- **Blockchain**: Ethereum (Sepolia testnet)
- **Privacy**: Fhenix Fully Homomorphic Encryption

## Pages

- `/` - Homepage with video hero and event discovery
- `/events` - Browse all public and private events
- `/events/[id]` - Event detail with wallet-connected registration
- `/dashboard` - Organizer dashboard with stats
- `/dashboard/create` - Create event with privacy settings
- `/dashboard/events` - Manage your events
- `/dashboard/settings` - Privacy preferences
- `/privacy` - How privacy works on EventNest

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env.local
```

3. Add your WalletConnect Project ID to `.env.local`

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
```

## Smart Contracts

The smart contracts are located in `/contracts` and use Fhenix Solidity library for encrypted data types.

## License

MIT

---

Built with privacy by design on Fhenix.
