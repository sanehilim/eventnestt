# EventNest - Production Architecture Notes

EventNest is a privacy-aware on-chain event ticketing app for Ethereum Sepolia. The current production release focuses on reliable on-chain event creation, gated registration, paid NFT tickets, transfers, and organizer check-in.

## Current Shipped Architecture

- Event metadata and access flags are stored in the deployed EventNest ticket contract.
- Current Sepolia contract: `0x1f9ec1bcf266c8779b128a3962d07bb0ee7379ce` from block `10849892`.
- Invite codes are hashed client-side and the hash is stored on-chain.
- Wallet allowlists are enforced by the contract at mint time.
- Ticket price, capacity, one-ticket-per-wallet, transfers, check-in, and burn cleanup are enforced on-chain.
- The app uses wagmi and viem against the configured Sepolia contract.
- Empty states are real empty states; event lists do not fall back to demo event data.

## Privacy Reality

The current release is not a confidential FHE contract yet. Event names, descriptions, dates, prices, and metadata are readable from the public Sepolia contract. Invite codes are not stored in plaintext, but a hash is still public and should be treated as a gated-access mechanism rather than full secrecy.

## CoFHE/Fhenix Roadmap

Fhenix CoFHE documentation shows Sepolia support for real FHE operations and the JavaScript SDK flow for encrypting inputs before sending them to an FHE-enabled contract. A future EventNest privacy upgrade should migrate sensitive rules into a CoFHE contract stack using:

- `cofhe-contracts` and `FHE.sol` encrypted types for encrypted access data.
- `@cofhe/sdk` for browser-side input encryption.
- `FHE.allowThis` and `FHE.allowSender` permissions for encrypted state access.
- Testnet validation on a supported Sepolia network before any mainnet rollout.

Useful docs:

- https://cofhe-docs.fhenix.zone/fhe-library/introduction/quick-start
- https://cofhe-docs.fhenix.zone/client-sdk/quick-start/javascript
- https://cofhe-docs.fhenix.zone/fhe-library/reference/fhe-sol/overview

## Production Readiness Criteria

- Use a fresh deployment wallet for each production deployment.
- Never use a private key that has been shared in chat, committed, or exposed in logs.
- Keep Vercel environment variables in sync with the deployed contract address and deploy block.
- Re-run contract compile, app lint, TypeScript, production build, audit, browser smoke, and on-chain E2E after every contract redeploy.
