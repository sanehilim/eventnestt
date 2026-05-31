# EventNest - Production Architecture Notes

EventNest is a privacy-aware on-chain event ticketing app for Ethereum Sepolia. The current Wave 5 production release focuses on reliable on-chain event creation, CoFHE-backed confidential invite checks, tiered NFT tickets, paid registration, transfers, and organizer check-in.

## Current Shipped Architecture

- Event metadata is pinned through Pinata/IPFS for new events; access flags, ticket tiers, sales counts, check-ins, and ticket ownership are stored in the deployed EventNest ticket contract.
- Current Sepolia contract: `0xc19a7f4636d8320afcb1d19e79cab1747793a380` from block `10959329`.
- Production app: https://event-nest-rho.vercel.app
- Invite credentials are encrypted in the browser with `@cofhe/sdk` and stored as CoFHE encrypted handles.
- Confidential invite checks compare encrypted attendee credentials with the encrypted organizer credential in `FHE.sol`.
- The final encrypted access result is decrypted with a proof and verified by the contract before confidential ticket minting.
- Ticket tiers support per-tier capacity, price, transferability, active/inactive status, and hidden encrypted condition handles.
- Wallet allowlists are enforced by the contract at mint time.
- Ticket price, capacity, one-ticket-per-wallet, transfers, check-in, and burn cleanup are enforced on-chain.
- The app uses wagmi, viem, the CoFHE SDK, and a server-only Pinata metadata route against the configured Sepolia contract.
- Empty states are real empty states; event lists do not fall back to demo event data.

## Privacy Reality

The current release uses CoFHE for confidential invite credentials. Event names, descriptions, dates, prices, metadata, public tier settings, wallet allowlists, and ERC721 ownership remain public because they are ordinary public blockchain state.

The confidential path protects the invite credential itself:

- Organizers encrypt the invite credential in the browser.
- The contract stores encrypted credential handles, not the plaintext credential or a new public hash.
- Attendees submit encrypted credentials for comparison.
- Only the final access decision is revealed for the mint transaction.

Legacy public invite-code hash support remains in the contract for backward compatibility with older events, but the Wave 5 app flow uses the confidential credential path.

## CoFHE/Fhenix Integration

The Wave 5 contract and app use:

- `@fhenixprotocol/cofhe-contracts` and `FHE.sol` encrypted types for confidential access data.
- `@cofhe/sdk` for browser-side input encryption and decrypt-result requests.
- `FHE.allowThis` and `FHE.allowSender` permissions for encrypted state access.
- `FHE.verifyDecryptResult` before confidential ticket minting.
- Ethereum Sepolia validation before any future mainnet launch.

Useful docs:

- https://cofhe-docs.fhenix.zone/fhe-library/introduction/quick-start
- https://cofhe-docs.fhenix.zone/client-sdk/quick-start/javascript
- https://cofhe-docs.fhenix.zone/fhe-library/reference/fhe-sol/overview

## Production Readiness Criteria

- Use a fresh deployment wallet for each production deployment.
- Never use a private key that has been shared in chat, committed, or exposed in logs.
- Keep Vercel environment variables in sync with the deployed contract address and deploy block.
- Re-run contract compile, app lint, TypeScript, production build, audit, browser smoke, and on-chain E2E after every contract redeploy.
