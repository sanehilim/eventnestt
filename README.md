# EventNest

EventNest is a privacy-aware on-chain event ticketing platform for organizers who want to create events, control access, and mint wallet-based tickets without relying on a centralized backend.

## Live App

- Live website: [https://event-nest-rho.vercel.app](https://event-nest-rho.vercel.app)
- Latest Vercel production deployment: [https://event-nest-rho.vercel.app](https://event-nest-rho.vercel.app) (`dpl_Fta4mGQ3ddNzv1hZ4ebPpb1F63af`)
- Sepolia contract: [0x1f9ec1bcf266c8779b128a3962d07bb0ee7379ce](https://sepolia.etherscan.io/address/0x1f9ec1bcf266c8779b128a3962d07bb0ee7379ce)
- Deployment transaction: [0x01f06bdf77b69d46647166a7602ef45c5e03a0b4d7ca44903ccdf1d73c5dbe4c](https://sepolia.etherscan.io/tx/0x01f06bdf77b69d46647166a7602ef45c5e03a0b4d7ca44903ccdf1d73c5dbe4c)
- Deploy block: `10849892`
- Latest live-chain audit: May 14, 2026 Sepolia E2E passed across invalid private-event rejection, event creation, invite code gates, whitelist-only private registration, paid ticket minting, duplicate prevention, transfer, organizer check-in, used-ticket transfer rejection, and burn cleanup.

## What Is EventNest?

EventNest helps organizers launch public or private events on-chain and manage ticket access with wallet-native flows.

With EventNest, organizers can:

- Create events directly on Ethereum Sepolia
- Configure public or private access rules
- Protect access with invite codes and wallet whitelists
- Set paid ticket prices with automatic organizer payout
- Mint NFT tickets to attendee wallets
- Manage organizer events from a live dashboard
- Edit event metadata and access rules after launch
- Validate and check in tickets from the organizer dashboard
- Track real on-chain event stats instead of fake demo metrics

Attendees can:

- Browse live events
- Connect a wallet
- Register for public events
- Enter invite codes for protected events
- Receive wallet-linked NFT tickets
- View QR-ready entry passes
- Transfer tickets to another wallet

## What The App Does Today

The current production app is focused on Wave 2 delivery:

- Real smart-contract integration on Ethereum Sepolia
- Organizer dashboard connected to live contract data
- Event creation flow that writes on-chain
- Event access management for invite codes and whitelists
- Wallet-based attendee registration
- Paid ticket minting with ETH forwarded to the organizer wallet
- Ticket minting tied to the deployed contract
- QR ticket views, wallet transfers, and organizer check-in
- Event edit/update flows for metadata and access settings
- Production deployment on Vercel

## How It Works

1. The organizer connects a wallet and creates an event from the dashboard.
2. The app stores event metadata and access settings on the deployed Sepolia contract.
3. If the event is private, the organizer can set an invite code and whitelist wallets.
4. Attendees connect a wallet and register from the event page.
5. If access is valid and the ticket payment is correct, the contract mints an NFT ticket for that wallet.
6. The attendee can present a QR ticket, transfer the ticket, or the organizer can check it in on-chain.

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

Wave 3 is now implemented in the current production upgrade.

- Ticket QR view and event entry validation flow
- Better organizer analytics by event and by ticket type
- Event edit/update flows for metadata management
- Ticket transfer and attendance check-in improvements
- Cleaner mobile-first event browsing and ticket views
- Paid ticket minting with organizer payout

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
- Custom wagmi wallet selector
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
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1f9ec1bcf266c8779b128a3962d07bb0ee7379ce
NEXT_PUBLIC_CONTRACT_DEPLOY_BLOCK=10849892
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

`npm run deploy:sepolia` requires `PRIVATE_KEY` or `DEPLOYER_PRIVATE_KEY` in the shell environment. Never commit private keys.

## Notes

- The production app is live and connected to the deployed Sepolia contract.
- The dashboard now reflects real wallet-owned event data.
- Paid tickets require the exact ETH price configured by the organizer and pay the organizer wallet during minting.
- Invite codes are stored as hashes and checked on-chain. CoFHE/Fhenix documentation is used as the privacy roadmap for migrating sensitive equality checks and encrypted rules into encrypted smart-contract logic.
- If a connected wallet has no events yet, the UI intentionally shows empty states instead of sample content.

##  

