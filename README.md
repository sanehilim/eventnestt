# EventNest

EventNest is a privacy-aware on-chain event ticketing platform for organizers who want to create events, control access, and mint wallet-based tickets without relying on a centralized backend.

## Live App

- Live website: [https://event-nest-rho.vercel.app](https://event-nest-rho.vercel.app)
- Production deployment: [https://event-nest-3j0rmjhia-nikkus-projects-d0d225f5.vercel.app](https://event-nest-3j0rmjhia-nikkus-projects-d0d225f5.vercel.app)
- Sepolia contract: [0xa316d86226ce145a0ae2ae349c8c4bb587cae87c](https://sepolia.etherscan.io/address/0xa316d86226ce145a0ae2ae349c8c4bb587cae87c)
- Deployment transaction: [0x398b9e8c6c70951c83cfd8e404e5ff692ff8ae57c5f6327e62ade84351247cc0](https://sepolia.etherscan.io/tx/0x398b9e8c6c70951c83cfd8e404e5ff692ff8ae57c5f6327e62ade84351247cc0)

## What Is EventNest?

EventNest helps organizers launch public or private events on-chain and manage ticket access with wallet-native flows.

With EventNest, organizers can:

- Create events directly on Ethereum Sepolia
- Configure public or private access rules
- Protect access with invite codes and wallet whitelists
- Mint NFT tickets to attendee wallets
- Manage organizer events from a live dashboard
- Track real on-chain event stats instead of fake demo metrics

Attendees can:

- Browse live events
- Connect a wallet
- Register for public events
- Enter invite codes for protected events
- Receive wallet-linked NFT tickets

## What The App Does Today

The current production app is focused on Wave 2 delivery:

- Real smart-contract integration on Ethereum Sepolia
- Organizer dashboard connected to live contract data
- Event creation flow that writes on-chain
- Event access management for invite codes and whitelists
- Wallet-based attendee registration
- Ticket minting tied to the deployed contract
- Production deployment on Vercel

## How It Works

1. The organizer connects a wallet and creates an event from the dashboard.
2. The app stores event metadata and access settings on the deployed Sepolia contract.
3. If the event is private, the organizer can set an invite code and whitelist wallets.
4. Attendees connect a wallet and register from the event page.
5. If access is valid, the contract mints an NFT ticket for that wallet.

## Wave Roadmap

### Wave 2

Wave 2 is the current shipped version.

- Deployed the EventNest contract on Ethereum Sepolia
- Connected the frontend to the real deployed smart contract
- Removed dummy dashboard data and replaced it with live organizer stats
- Added organizer event management for invite codes and wallet whitelists
- Added honest empty states when no on-chain events exist yet
- Stabilized production builds and deployed the live app on Vercel
- Updated dashboard settings so organizer defaults can be reused in the create flow

### Wave 3

Wave 3 will focus on stronger organizer tooling and attendee UX.

- Ticket QR view and event entry validation flow
- Better organizer analytics by event and by ticket type
- Event edit/update flows for metadata management
- Ticket transfer and attendance check-in improvements
- Cleaner mobile-first event browsing and ticket views

### Wave 4

Wave 4 will focus on privacy depth and richer event logic.

- More advanced gated-access models
- VIP tiers and segmented ticket classes
- Private pricing and hidden sales conditions
- Stronger selective-disclosure workflows
- Organizer moderation and admin tooling

### Wave 5

Wave 5 will focus on ecosystem expansion and scale.

- Multi-chain deployment support
- Rich event reputation and organizer trust systems
- Partner integrations for communities and DAO events
- More advanced reporting and growth dashboards
- Broader privacy-preserving ticketing features aligned with the long-term product vision

## Product Highlights

- On-chain event creation
- Invite-code protected registration
- Wallet whitelist support
- NFT-based ticket ownership
- Organizer dashboard with real contract-backed data
- Production deployment with live contract configuration

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- wagmi
- viem
- RainbowKit
- Vercel
- Ethereum Sepolia

## Local Development

1. Install dependencies:

```bash
npm install
```

1. Create local environment variables:

```bash
cp .env.example .env.local
```

1. Start the app:

```bash
npm run dev
```

1. Open:

```text
http://localhost:3000
```

## Environment Variables

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia.publicnode.com
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0xa316d86226ce145a0ae2ae349c8c4bb587cae87c
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is optional. If it is not set, the app still works with injected wallets and Coinbase Wallet.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run build:contract
npm run deploy:sepolia
```

## Notes

- The production app is live and connected to the deployed Sepolia contract.
- The dashboard now reflects real wallet-owned event data.
- If a connected wallet has no events yet, the UI intentionally shows empty states instead of sample content.

##  

