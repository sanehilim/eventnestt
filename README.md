# EventNest

EventNest is a privacy-aware on-chain event ticketing platform for organizers who want to create events, control access, mint NFT tickets, and verify entry without relying on a centralized backend.

The current production release is live on Ethereum Sepolia and Vercel. It uses real contract reads/writes, real wallet flows, and real on-chain ticket state. No demo fallback data is used for production event or dashboard views.

## Live App

- Live website: [https://event-nest-rho.vercel.app](https://event-nest-rho.vercel.app)
- Latest Vercel production deployment: `dpl_Fta4mGQ3ddNzv1hZ4ebPpb1F63af`
- Sepolia contract: [0x1f9ec1bcf266c8779b128a3962d07bb0ee7379ce](https://sepolia.etherscan.io/address/0x1f9ec1bcf266c8779b128a3962d07bb0ee7379ce)
- Contract deployment transaction: [0x01f06bdf77b69d46647166a7602ef45c5e03a0b4d7ca44903ccdf1d73c5dbe4c](https://sepolia.etherscan.io/tx/0x01f06bdf77b69d46647166a7602ef45c5e03a0b4d7ca44903ccdf1d73c5dbe4c)
- Contract deploy block: `10849892`
- Latest live-chain audit: May 14, 2026

## What Shipped

### Smart Contract

- Deployed a fresh `EventNestTicket` contract to Sepolia.
- Removed the global owner/admin override so only the event organizer can manage that event.
- Enforced invite-code and whitelist access at mint time.
- Rejected private events that do not enable at least one real access rule.
- Added paid ticket minting with exact ETH payment checks.
- Forwarded paid ticket revenue directly to the organizer wallet.
- Added one-ticket-per-wallet enforcement per event.
- Added event metadata update support.
- Added organizer ticket check-in.
- Rejected transfer attempts after a ticket is checked in.
- Fixed attendee and holder mappings after ticket transfers.
- Fixed burn cleanup so burned tickets no longer count as active attendees.
- Added payout, update, check-in, and burn events for indexing and analytics.

### Frontend

- Reworked the UI and UX for a cleaner production app feel.
- Replaced disconnected demo-like flows with live contract-backed reads.
- Added a custom wagmi wallet selector for injected wallets, Coinbase Wallet, and optional WalletConnect.
- Added wrong-chain handling with a direct switch-to-Sepolia action.
- Updated event browsing to use on-chain event metadata and organizer image URLs.
- Changed privacy language to "gated" where the event is protected by invite code, whitelist, or private access rules.
- Added create-event validation for invalid private access settings.
- Added organizer dashboard stats from real on-chain event data.
- Added real organizer revenue from `TicketPaymentReleased` logs.
- Added event edit/update flows for metadata, capacity, price, image, and access rules.
- Added invite-code rotation and whitelist add/remove controls.
- Added ticket lookup, QR payload parsing, and organizer check-in.
- Added ticket transfer and burn flows for attendees.
- Removed fake analytics, fake dashboard numbers, and sample event fallbacks.
- Simplified settings so only real, working event defaults remain.
- Updated empty states so they honestly reflect the connected wallet and contract state.

### Deployment

- Linked the workspace to the existing Vercel project: `event-nest`.
- Updated Vercel Production environment variables:
  - `NEXT_PUBLIC_CHAIN_ID=11155111`
  - `NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia.publicnode.com`
  - `NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com`
  - `NEXT_PUBLIC_CONTRACT_ADDRESS=0x1f9ec1bcf266c8779b128a3962d07bb0ee7379ce`
  - `NEXT_PUBLIC_CONTRACT_DEPLOY_BLOCK=10849892`
- Deployed the production build to Vercel.
- Verified the public production alias: [https://event-nest-rho.vercel.app](https://event-nest-rho.vercel.app)

Vercel Preview environment variables were not updated because the Vercel project currently has no connected Git repository. Production is configured and verified.

## Verification

The latest production pass completed:

- `npm run build:contract`
- `npm audit --omit=dev`
- `npm run lint`
- `npx tsc --noEmit --incremental false`
- `npm run build`
- Real Sepolia E2E against the deployed contract
- Local browser smoke test
- Deployed Vercel browser smoke test

The Sepolia E2E covered:

- Invalid private-event rejection
- Event creation
- Invite-code access verification
- Wrong invite-code rejection
- Whitelist-only private registration
- Paid ticket minting
- Incorrect payment rejection
- Duplicate mint rejection
- Ticket transfer
- Organizer check-in
- Used-ticket transfer rejection
- Burn cleanup
- Revenue payout event emission

The deployed Vercel smoke test covered:

- `/`
- `/events`
- `/events/0`
- `/dashboard/create`
- `/tickets`
- Header wallet menu
- Live Sepolia event data loading
- No app console errors during the checked flows

## Product Capabilities

Organizers can:

- Create events directly on Ethereum Sepolia.
- Configure public or gated access.
- Protect registration with invite codes.
- Restrict registration to whitelisted wallets.
- Set free or paid ticket prices.
- Receive paid ticket revenue directly in the organizer wallet.
- Manage live organizer events from the dashboard.
- Edit event metadata and access rules after launch.
- Rotate invite codes.
- Add and remove whitelist wallets.
- Validate attendee tickets.
- Check in tickets on-chain.
- View real event and revenue analytics.

Attendees can:

- Browse live on-chain events.
- Connect a wallet.
- Register for public events.
- Enter invite codes for protected events.
- Mint wallet-linked NFT tickets.
- View QR-ready ticket passes.
- Transfer unused tickets.
- Burn tickets they own.

## How It Works

1. The organizer connects a wallet.
2. The organizer creates an event from the dashboard.
3. The frontend writes event metadata, capacity, price, and access flags to the deployed Sepolia contract.
4. If invite codes are enabled, the app hashes the invite code client-side and stores only the hash on-chain.
5. If whitelist access is enabled, the contract checks the attendee wallet at mint time.
6. Attendees connect a wallet and register from the event page.
7. If access and payment are valid, the contract mints an ERC721 ticket to the attendee wallet.
8. The attendee can present the QR payload for entry.
9. The organizer can look up and check in the ticket on-chain.
10. Used tickets cannot be transferred.

## Privacy Reality

The current production release is privacy-aware but not a full confidential FHE app yet.

On the current Sepolia contract:

- Event names, descriptions, dates, prices, and metadata are public.
- Invite codes are not stored in plaintext.
- Invite-code hashes are still public and should be treated as gated access, not full secrecy.
- Wallet allowlists are public contract state.
- Ticket ownership and transfers are public ERC721 state.

The app includes a documented CoFHE/Fhenix roadmap for moving sensitive checks to encrypted contract logic in a future upgrade.

Useful Fhenix docs:

- [FHE library quick start](https://cofhe-docs.fhenix.zone/fhe-library/introduction/quick-start)
- [Client SDK JavaScript quick start](https://cofhe-docs.fhenix.zone/client-sdk/quick-start/javascript)
- [FHE.sol overview](https://cofhe-docs.fhenix.zone/fhe-library/reference/fhe-sol/overview)

## Roadmap

### Wave 1 - Done

- Built the first EventNest app structure with Next.js, React, TypeScript, and Tailwind CSS.
- Created the initial landing experience, event browsing pages, dashboard pages, ticket pages, account page, and privacy page.
- Added the base event creation flow and organizer dashboard layout.
- Added the initial ticket UI, event cards, navigation, footer, and responsive page structure.
- Set up Solidity contract compilation and generated the app ABI.
- Added the first wallet/web3 integration foundation with wagmi and viem.
- Added Vercel-ready project configuration.

### Wave 2 - Done

- Deployed EventNest to Ethereum Sepolia for real chain testing.
- Connected the frontend to the deployed smart contract.
- Replaced dummy dashboard data with live organizer event reads.
- Added on-chain event creation from the dashboard.
- Added invite-code access management.
- Added wallet whitelist management.
- Added wallet-based attendee registration.
- Added honest empty states when no wallet-owned events or tickets exist.
- Added reusable organizer defaults for the create-event flow.
- Stabilized the first production Vercel deployment.

### Wave 3 - Done

- Added QR-ready ticket views for attendees.
- Added organizer ticket lookup.
- Added organizer ticket check-in.
- Added event edit/update flows for metadata and access settings.
- Added ticket transfer support for unused tickets.
- Added ticket burn support for ticket owners.
- Added paid ticket minting.
- Added automatic organizer payout on paid mint.
- Added real organizer revenue analytics from payment logs.
- Improved event browsing, ticket pages, and dashboard UX for mobile and desktop.

### Wave 4 - Done

- Redeployed a fresh hardened Sepolia contract.
- Removed the global owner/admin event override.
- Restricted event management to each event organizer.
- Enforced gated access for invite-only, whitelist-only, and private events.
- Rejected private events without an invite-code or whitelist rule.
- Added frontend validation for invalid private access settings.
- Fixed duplicate ticket prevention.
- Fixed transfer holder and attendee mappings.
- Rejected transfers after ticket check-in.
- Fixed burn cleanup so burned tickets no longer count as active attendees.
- Added paid mint exact-value checks and payout events.
- Updated the UI language from private-only to public/gated where appropriate.
- Updated event grids to use real event image metadata.
- Added wrong-chain handling and wallet switch prompts.
- Added QR payload parsing for organizer check-in.
- Removed non-working settings and fake analytics.
- Updated `.env.local`, `.env.example`, Vercel Production env, and README with the new contract.
- Deployed the app to Vercel production.
- Verified the public production URL in the browser.
- Ran contract compile, audit, lint, TypeScript, production build, Sepolia E2E, local browser smoke, and deployed browser smoke.
- Documented the CoFHE/Fhenix privacy path honestly as Wave 5 work.

### Wave 5 - Remaining Work Only

Wave 5 is the next major product expansion and should focus on scale, privacy depth, and production operations.

- Migrate sensitive access checks to a CoFHE/Fhenix-enabled contract.
- Encrypt private access rules with `FHE.sol` encrypted types.
- Use `@cofhe/sdk` for browser-side encrypted input generation.
- Add encrypted invite-code or credential checks instead of public hash comparison.
- Add encrypted private pricing or hidden ticket conditions.
- Add multi-ticket tiers such as General, VIP, Speaker, Sponsor, and DAO member.
- Add per-tier capacity, pricing, and transfer rules.
- Add stronger organizer identity and reputation pages.
- Add event discovery ranking using real activity signals.
- Add attendee history and organizer trust indicators.
- Add multi-chain deployment support beyond Sepolia.
- Add a deployment registry so each chain has a known contract address and deploy block.
- Add contract verification automation for Etherscan-compatible explorers.
- Add CI checks for lint, TypeScript, build, contract compile, and contract tests.
- Add automated browser smoke tests for production URLs after each deploy.
- Add automated Sepolia E2E tests using a dedicated deployer wallet.
- Add a safer key-management process for deployment wallets.
- Connect the Vercel project to Git so Preview env variables and preview deployments work cleanly.
- Add structured event metadata storage for richer images and descriptions.
- Add optional IPFS or decentralized metadata storage.
- Add organizer export tools for attendees, tickets, payouts, and check-ins.
- Add richer analytics for conversion, revenue, capacity, and attendance.
- Add refund, cancellation, and event-reschedule flows.
- Add moderation/reporting tools for suspicious events.
- Add accessibility QA and full mobile regression testing.
- Add a mainnet readiness review before any real-money production launch.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components
- wagmi
- viem
- Custom wagmi wallet selector
- Vercel
- Ethereum Sepolia
- Solidity
- OpenZeppelin ERC721

## Local Development

Install dependencies:

```bash
npm install
```

Create local environment variables:

```bash
cp .env.example .env.local
```

Start the local dev server:

```bash
npm run dev
```

Open:

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

## Production Checklist

Before any future production redeploy:

- Compile the contract if Solidity changes.
- Redeploy the contract if ABI or contract behavior changes.
- Update `.env.local`, `.env.example`, Vercel Production env, and this README with the new contract address and deploy block.
- Run lint, TypeScript, audit, contract compile, and production build.
- Run a real-chain E2E test against the deployed contract.
- Deploy to Vercel production.
- Smoke-test the public Vercel URL in the browser.
- Confirm event list/detail pages load live chain data.
- Confirm wallet menu and wrong-chain handling work.
- Never use a private key that has been committed, logged, or shared publicly for a real production launch.
