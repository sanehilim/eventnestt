🚀 EventNest — Privacy-First Event Ticketing on Fhenix
🧠 What is EventNest?

EventNest is a privacy-first decentralized event ticketing platform built on Fhenix.

It allows event organizers to:

create public or private events,
sell tickets securely,
control access rules,
and manage attendees,

👉 without exposing sensitive event data on-chain.

Unlike traditional Web3 apps, EventNest ensures that:

access conditions,
invite rules,
pricing logic,
and attendee eligibility

are encrypted and processed privately using Fhenix.

🎯 What does EventNest do?

EventNest solves a major problem in Web3:

👉 Everything is too transparent.

In normal blockchain apps:

anyone can see who bought tickets,
event rules are public,
private events are not truly private,
pricing strategies are exposed.
EventNest fixes this by enabling:
🔒 Private event access
🔑 Hidden invite systems
💸 Confidential payment conditions
👥 Encrypted attendee validation
🧾 Selective disclosure of event data
⚙️ How EventNest Works
🔹 Step 1: Event Creation

Organizer creates an event:

title, date, category (public)
private details (encrypted):
invite codes
PINs
whitelist
VIP access rules
hidden pricing

👉 These sensitive values are encrypted using Cofhe SDK

🔹 Step 2: Store on Blockchain
Public metadata → stored normally
Private rules → stored as encrypted data in Fhenix smart contracts

👉 No one can read them publicly

🔹 Step 3: Event Discovery

Users can:

browse public events
request access to private events
🔹 Step 4: Private Access Request

User provides:

PIN / secret code
eligibility proof
payment intent

👉 This data is encrypted before sending

🔹 Step 5: Encrypted Smart Contract Verification 🔥

Fhenix contract checks:

Is the user invited?
Is the code correct?
Is payment valid?
Is the user eligible for VIP?

👉 All checks happen on encrypted data

No sensitive information is revealed.

🔹 Step 6: Ticket Issuance

If valid:

NFT ticket is minted OR
access is granted
🔹 Step 7: Event Access

User:

views unlocked event details
attends event using NFT / QR / wallet verification
🔐 Core Features
1. 🔒 Confidential Events
Events can hide details like:
location
time
special instructions

Only authorized users can decrypt them.

2. 🔑 Encrypted Access Control
Private invite codes
PIN-based access
Wallet-based eligibility

👉 All verified privately on-chain

3. 👥 Hidden Allowlists
Attendee lists are NOT public
Only contract knows who is allowed
4. 💸 Confidential Payments
Hidden pricing logic
Private discounts / VIP tiers
Conditional payments
5. 🎟️ NFT Tickets
Each ticket is an NFT
Cannot be duplicated or faked
Can be transferred or stored
6. 🧾 Selective Disclosure
Different users see different data
No full transparency leak
7. 📊 Organizer Dashboard
Create events
Manage attendees
Track ticket usage
8. ☁️ Decentralized Storage
Event data/images stored on IPFS
No centralized server dependency
🧠 How We Use Fhenix (MOST IMPORTANT)

EventNest uses Fhenix to move from:

❌ Public logic
➡️ to
✅ Encrypted smart contract logic

🔹 1. Solidity Encrypted Types

We use Fhenix Solidity library to store:

encrypted PINs
encrypted invite codes
encrypted pricing
encrypted access conditions

👉 Example:
Instead of:

price = 10

We store:

encryptedPrice = encrypt(10)
🔹 2. Cofhe SDK

Used in frontend for:

encrypting user inputs
encrypting event rules
decrypting results
🔹 3. React Hooks

We use:

useEncrypt → encrypt user input
useWrite → send transactions
useDecrypt → get results
🔹 4. Hardhat Plugin
Local development of encrypted contracts
No need to rely on testnet initially
🔹 5. Privara SDK (Optional but Powerful)

Used for:

confidential payment flows
stablecoin interactions
private financial logic