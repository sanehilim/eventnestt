# EventNest

EventNest is an on-chain event ticketing app for organizers who want wallet-based event creation, gated registration, tiered NFT tickets, transfers, and organizer check-in without a centralized backend.

## Current Deployment

- App: [https://event-nest-rho.vercel.app](https://event-nest-rho.vercel.app)
- Configured Sepolia contract: [0xc19a7f4636d8320afcb1d19e79cab1747793a380](https://sepolia.etherscan.io/address/0xc19a7f4636d8320afcb1d19e79cab1747793a380)
- Deploy block: `10959329`
- Chain: Ethereum Sepolia (`11155111`)

Important: the current app deployment is configured to the hardened Sepolia contract above. Source verification still requires an `ETHERSCAN_API_KEY` from a secured operator environment.

## What Works

Organizers can:

- Create Sepolia events with Pinata/IPFS metadata, capacity, pricing, and ticket tiers.
- Configure public, whitelist-gated, and confidential invite-gated events.
- Encrypt invite credentials in the browser with CoFHE.
- Rotate confidential invite credentials before an event starts.
- Add and remove whitelisted wallets.
- Edit event metadata and ticket tiers before an event starts.
- Check in tickets on-chain.
- View organizer events and released revenue from contract logs.

Attendees can:

- Browse live on-chain events.
- Connect an injected browser wallet.
- Mint free or paid NFT tickets.
- Submit confidential invite credentials for protected events.
- View wallet-owned tickets and QR payloads.
- Transfer eligible unused tickets before the event starts.
- Burn eligible tickets before the event starts.

## Contract Hardening

The latest `contracts/EventNestTicket.sol` source includes:

- Buyer-bound minting: the mint recipient must be the caller.
- One active ticket per wallet per event.
- Organizer-only check-in.
- No mint, transfer, burn, invite rotation, tier condition update, or tier edit after event start.
- Future-date validation with seconds/milliseconds compatibility.
- Protected transfer checks so gated tickets cannot be transferred to unapproved wallets.
- Tier capacity, pricing, transferability, and active-state checks.
- Runtime bytecode guard against the EIP-170 contract size limit.

Legacy public invite-code hash paths were removed from the hardened source to keep the contract deployable under the 24 KB runtime bytecode limit. Invite-code events now use the confidential CoFHE path.

## Verification

Run the local checks:

```bash
npm run build:contract
npm run lint
npx tsc --noEmit --incremental false
npm audit --omit=dev
npm run build
```

Run read-only Sepolia checks:

```bash
npm run test:sepolia
```

Run write E2E only from a funded, disposable Sepolia wallet:

```bash
RUN_SEPOLIA_WRITE_E2E=1 PRIVATE_KEY=0x... npm run test:sepolia
```

Run page smoke checks against a local or deployed URL:

```bash
SMOKE_BASE_URL=http://localhost:3000 npm run smoke:production
```

## Deployment

Create local env:

```bash
cp .env.example .env.local
```

Deploy a fresh Sepolia contract:

```bash
PRIVATE_KEY=0x... npm run deploy:sepolia
```

The deploy script compiles the contract, deploys it, updates `.env.local`, `.env.example`, and `lib/deployments.ts` with the new address and deploy block.

Verify the deployed source:

```bash
ETHERSCAN_API_KEY=... npm run verify:contract
```

After deployment, update the Vercel production environment variables and redeploy the app.

## Environment

```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://ethereum-sepolia.publicnode.com
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia.publicnode.com
NEXT_PUBLIC_CONTRACT_ADDRESS=0xc19a7f4636d8320afcb1d19e79cab1747793a380
NEXT_PUBLIC_CONTRACT_DEPLOY_BLOCK=10959329
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs
PINATA_JWT=
PINATA_API_KEY=
PINATA_API_SECRET=
```

The Pinata values are server-only and are used by `/api/metadata` to pin future event metadata to IPFS. Do not expose deployer private keys or OpenAI keys to the Vercel runtime unless a runtime feature explicitly needs them.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run build:contract
npm run deploy:sepolia
npm run verify:contract
npm run test:sepolia
npm run smoke:production
```

## Production Checklist

- Use a fresh deployer wallet and never commit private keys.
- Run `npm run build:contract` and confirm the runtime bytecode is below 24,576 bytes.
- Deploy the hardened contract.
- Verify the source on Etherscan.
- Update `.env.local`, `.env.example`, Vercel env, and `lib/deployments.ts`.
- Run lint, TypeScript, audit, production build, Sepolia read E2E, optional write E2E, and smoke tests.
- Confirm event creation, confidential invite setup, minting, transfer restrictions, and organizer check-in on the newly deployed contract.
