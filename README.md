# EventNest

EventNest blockchain ticketing

EventNest is a privacy-aware on-chain event ticketing app built for the Fhenix WaveHack final Wave 5 submission. It lets organizers create public or gated events, sell tiered NFT tickets, protect invite-only access with CoFHE encrypted credentials, manage wallet allowlists, and check in attendees on-chain.

Live app: [https://event-nest-rho.vercel.app](https://event-nest-rho.vercel.app)

Sepolia contract: [0x8816edd9fc6a0e5b2605af22a0db5e9f76d58f0a](https://sepolia.etherscan.io/address/0x8816edd9fc6a0e5b2605af22a0db5e9f76d58f0a)

## What EventNest Does

EventNest replaces manual event guest lists, copy-pasted invite codes, and unverifiable QR tickets with a wallet-native ticketing flow.

Organizers can:

- Create events on Ethereum Sepolia.
- Add event metadata, location, category, date, capacity, and locally uploaded cover image.
- Pin new event metadata to IPFS through Pinata.
- Configure public, whitelist-only, invite-gated, or confidential CoFHE-gated events.
- Create multiple ticket tiers with capacity, price, transferability, and active/inactive status.
- Sell free or paid NFT tickets.
- Rotate confidential invite credentials before the event starts.
- Add and remove whitelisted wallets.
- Edit event details and ticket tiers before the event starts.
- View organizer dashboard, analytics, revenue, and event activity.
- Withdraw paid ticket revenue from the contract.
- Validate QR payloads and check in attendees on-chain.

Attendees can:

- Browse live on-chain events.
- Connect a browser wallet.
- Mint free or paid NFT tickets.
- Submit confidential invite credentials for protected events.
- View wallet-owned tickets and QR entry payloads.
- Transfer eligible unused tickets before the event starts.
- Burn eligible unused tickets before the event starts.

## Why This Project Matters

Most event platforms keep the critical trust layer off-chain: ticket ownership, access rules, duplicate prevention, guest lists, and check-ins are controlled by a centralized backend. EventNest moves those guarantees into a smart contract while using Fhenix CoFHE for the sensitive part of gated events: the invite credential.

The result is useful for:

- Hackathons and conferences with private invite access.
- VIP events where guest eligibility should not be public.
- Paid Web3 meetups that need verifiable NFT tickets.
- Token-gated or wallet-gated communities.
- Organizers who want transparent ticket sales and check-in history.
- Attendees who want tickets they can verify directly from their wallet.

## How It Works

1. Organizer connects a wallet on Sepolia.
2. Organizer creates an event with metadata, capacity, access rules, and ticket tiers.
3. Event metadata is pinned to IPFS through the server-only Pinata route.
4. If invite access is enabled, the invite credential is encrypted in the browser with the CoFHE SDK.
5. The smart contract stores event rules, tier settings, encrypted credential handles, sales counts, ticket ownership, and check-in state.
6. Attendee connects a wallet and selects a ticket tier.
7. For public events, the attendee mints directly.
8. For confidential invite events, the attendee submits an encrypted credential, the contract verifies the decrypted access result, and then mints the ticket.
9. The ticket is an ERC721 NFT with event metadata.
10. At the venue, the organizer reads the attendee QR payload and checks in the ticket on-chain.

## Core Features


| Area            | Feature                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Event creation  | Name, description, date, location, category, local image upload, capacity, privacy settings    |
| Ticketing       | ERC721 tickets, multiple tiers, free and paid minting, tier capacity, transferability controls |
| Privacy         | CoFHE encrypted invite credentials, confidential access result verification                    |
| Access control  | Public events, private events, whitelist-only events, invite-gated events                      |
| Organizer tools | Dashboard, event editor, whitelist manager, invite rotation, tier editing, QR check-in         |
| Attendee tools  | Event browsing, ticket minting, My Tickets page, QR payloads, transfers, burns                 |
| Revenue         | Paid ticket revenue accrues in contract and can be withdrawn by the organizer                  |
| Metadata        | IPFS metadata pinning through Pinata, event image uploads, data URI fallback                   |
| Production      | Vercel deployment, Sepolia contract, smoke tests, read/write E2E scripts                       |


## WaveHack Progress

### Wave 1 - Project Foundation

- Defined EventNest as an on-chain event ticketing and gated access platform.
- Built the initial Next.js frontend structure.
- Added core pages for landing, events, dashboard, tickets, privacy, and account flows.
- Established the wallet-first user experience for organizers and attendees.

### Wave 2 - Smart Contract Ticketing

- Built the `EventNestTicket` Solidity contract.
- Added event creation and event storage.
- Added ERC721 NFT ticket minting.
- Added ticket ownership reads for the app.
- Added organizer-only event management foundations.

### Wave 3 - Access Control and Dashboard

- Added public, private, whitelist, and invite-gated event modes.
- Added organizer dashboard pages.
- Added event editing, ticket tier management, and whitelist management.
- Added attendee ticket page with QR payloads.
- Added transfer and burn flows for eligible tickets.

### Wave 4 - Fhenix CoFHE Integration

- Integrated `@cofhe/sdk` in the browser.
- Integrated `@fhenixprotocol/cofhe-contracts` in the Solidity contract.
- Added encrypted invite credential setup.
- Added confidential access request flow.
- Added decrypt-result verification before confidential ticket minting.
- Updated privacy messaging so the app accurately explains what is encrypted and what remains public.

### Wave 5 - Final  Hardening

- Redeployed the hardened contract on Ethereum Sepolia.
- Added tiered ticket capacity and pricing checks.
- Added safer paid-ticket revenue flow with organizer withdrawal.
- Added one active ticket per wallet per event.
- Added protected transfer checks for gated tickets.
- Added organizer-only check-in.
- Added no-edit/no-mint/no-transfer/no-burn restrictions after event start where required.
- Added deploy block based log reads for tickets, revenue, and whitelist state.
- Added Pinata/IPFS metadata route for new event metadata.
- Added production smoke tests and Sepolia read/write E2E checks.
- Fixed UI navigation, event filters, organizer pages, terms page, and production deployment configuration.
- Updated Vercel production environment variables.
- Verified the final app against the live Sepolia contract.

Wave 5 is the final version for this submission.

## Current Deployment

- App: [https://event-nest-rho.vercel.app](https://event-nest-rho.vercel.app)
- Contract: [0x8816edd9fc6a0e5b2605af22a0db5e9f76d58f0a](https://sepolia.etherscan.io/address/0x8816edd9fc6a0e5b2605af22a0db5e9f76d58f0a)
- Deploy block: `10960383`
- Chain: Ethereum Sepolia
- Chain ID: `11155111`
- Metadata storage: Pinata/IPFS
- Event image upload: Cloudinary when server credentials are configured, Pinata fallback otherwise
- Event image fallback: Cloudinary
- Frontend hosting: Vercel

Source verification still requires an `ETHERSCAN_API_KEY` from a secured operator environment.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- wagmi
- viem
- Solidity
- OpenZeppelin ERC721
- Fhenix CoFHE contracts
- `@cofhe/sdk`
- Pinata/IPFS
- Cloudinary
- Vercel
- Ethereum Sepolia

## Architecture

```text
Browser
  |
  |-- Wallet connection through wagmi/viem
  |-- CoFHE invite credential encryption
  |-- Event and ticket UI
  |
Next.js App
  |
  |-- /api/metadata pins event metadata to Pinata/IPFS
  |-- Cloudinary fallback image for events without custom artwork
  |-- Reads contract state through Sepolia RPC
  |-- Writes through connected user wallet
  |
EventNestTicket Contract
  |
  |-- Event storage
  |-- Ticket tier storage
  |-- ERC721 ticket minting
  |-- Confidential access checks
  |-- Whitelist enforcement
  |-- Revenue accounting
  |-- Transfer, burn, and check-in rules
```

## Smart Contract Highlights

The latest `contracts/EventNestTicket.sol` includes:

- ERC721 ticket ownership.
- Event creation and updates.
- Ticket tier creation and updates.
- CoFHE encrypted invite credential storage.
- Confidential access request and mint flow.
- Wallet whitelist enforcement.
- Buyer-bound minting: the ticket recipient must be the caller.
- One active ticket per wallet per event.
- Paid mint revenue accrual.
- Organizer-only revenue withdrawal.
- Organizer-only ticket check-in.
- Transfer restrictions for protected events.
- Burn cleanup for unused tickets.
- Runtime bytecode guard against the EIP-170 contract size limit.

Invite-code events use the confidential CoFHE path. The app does not store plaintext invite credentials on-chain.

## Privacy Model

EventNest protects invite credentials, not all event data.

Encrypted or protected:

- Invite credentials are encrypted in the browser.
- The confidential access comparison uses CoFHE encrypted values.
- The contract verifies the final decrypt result before minting.

Public on-chain data:

- Event name and description.
- Event date, capacity, category, and location metadata.
- Ticket tier settings.
- Ticket ownership.
- Ticket transfers.
- Whitelist wallet addresses.
- Check-in state.
- Paid ticket amounts and withdrawals.

This is intentional: ticket settlement and event state should be auditable, while the invite secret itself should not be published as plaintext.

## Project Structure

```text
app/
  api/metadata/             Pinata/IPFS metadata route
  dashboard/                Organizer dashboard, editor, analytics, settings
  events/                   Public event browse and event detail pages
  organizers/               Organizer profile pages
  tickets/                  Attendee ticket wallet page
contracts/
  EventNestTicket.sol       Main Solidity contract
  abi.ts                    Generated ABI used by the app
hooks/
  use-events.ts             Contract reads, writes, tickets, revenue, whitelist hooks
lib/
  cofhe.ts                  CoFHE client helpers
  deployments.ts            Contract addresses and deploy blocks
  onchain.ts                Chain config, metadata helpers, date helpers
scripts/
  compile-contract.mjs      Solidity compile and ABI generation
  deploy-contract.mjs       Sepolia deploy script
  sepolia-e2e.mjs           Read/write on-chain E2E checks
  smoke-production.mjs      Production route smoke checks
  verify-contract.mjs       Etherscan V2 verification helper
```

## Environment

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required public app variables:

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia.publicnode.com
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0x8816edd9fc6a0e5b2605af22a0db5e9f76d58f0a
NEXT_PUBLIC_CONTRACT_DEPLOY_BLOCK=10960383
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs
NEXT_PUBLIC_EVENT_IMAGE_FALLBACK=https://res.cloudinary.com/dcaagefin/image/upload/f_auto,q_auto,c_fill,w_1200,h_675/v1780220361/eventnest/default-event-cover.png
```

Server-only upload and metadata variables:

```env
CLOUDINARY_CLOUD_NAME=dcaagefin
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=
PINATA_JWT=
PINATA_API_KEY=
PINATA_API_SECRET=
```

Deployment and verification variables, used only from a secure shell:

```env
PRIVATE_KEY=
DEPLOYER_PRIVATE_KEY=
ETHERSCAN_API_KEY=
```

Never commit private keys, OpenAI keys, Cloudinary secrets, Pinata secrets, or Etherscan keys. Vercel runtime needs the public chain variables plus server-only Cloudinary or Pinata values for image and metadata uploads.

## Local Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Verification

Run contract compile:

```bash
npm run build:contract
```

Run frontend checks:

```bash
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

Run dependency audit:

```bash
npm audit --omit=dev
```

Run read-only Sepolia E2E:

```bash
npm run test:sepolia
```

Run write E2E from a funded disposable Sepolia wallet:

```bash
RUN_SEPOLIA_WRITE_E2E=1 PRIVATE_KEY=0x... npm run test:sepolia
```

Run smoke checks:

```bash
npm run smoke:production
```

Or against a local server:

```bash
SMOKE_BASE_URL=http://localhost:3000 npm run smoke:production
```

## Deployment

Deploy a fresh Sepolia contract:

```bash
PRIVATE_KEY=0x... npm run deploy:sepolia
```

The deploy script:

- Compiles the contract.
- Deploys to Sepolia.
- Updates `.env.local`.
- Updates `.env.example`.
- Updates `lib/deployments.ts`.

Verify the contract source:

```bash
ETHERSCAN_API_KEY=... npm run verify:contract
```



```bash
v
```

After deployment, run:

```bash
npm run smoke:production
npm run test:sepolia
```

## Final Production Checklist

- Contract compiled under the 24 KB runtime bytecode limit.
- Fresh Sepolia contract deployed.
- Vercel production env updated.
- Pinata/IPFS metadata route configured.
- Local event image upload configured with Cloudinary support and Pinata fallback.
- Cloudinary event image fallback configured.
- Lint passed.
- TypeScript passed.
- Production build passed.
- `npm audit --omit=dev` passed with 0 vulnerabilities.
- Sepolia read E2E passed.
- Sepolia write E2E passed.
- Production route smoke test passed.
- Browser UI checked for core pages.
- Event creation, minting, paid tickets, revenue withdrawal, whitelist management, transfer restrictions, QR check-in, and organizer views are wired end to end.

## Known Operational Notes

- The current deployment is on Sepolia for WaveHack validation.
- Mainnet launch would require fresh deployment keys, final contract source verification, production RPC/provider hardening, monitoring, and a real refund/cancellation policy.
- Public blockchain data remains public by design.
- The confidential invite flow protects the credential, not event metadata or ownership.
- Use a fresh wallet for any future production redeploy.

## License

This project was built as a Fhenix WaveHack submission. Add a formal license before public reuse or commercial deployment.
