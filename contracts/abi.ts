export const abi = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "initialOwner", "type": "address", "internalType": "address" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createEvent",
    "inputs": [
      { "name": "name", "type": "string", "internalType": "string" },
      { "name": "description", "type": "string", "internalType": "string" },
      { "name": "metadataURI", "type": "string", "internalType": "string" },
      { "name": "eventDate", "type": "uint256", "internalType": "uint256" },
      { "name": "maxAttendees", "type": "uint256", "internalType": "uint256" },
      { "name": "isPrivate", "type": "bool", "internalType": "bool" },
      { "name": "requiresInviteCode", "type": "bool", "internalType": "bool" },
      { "name": "requiresWhitelist", "type": "bool", "internalType": "bool" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "mintTicket",
    "inputs": [
      { "name": "eventId", "type": "uint256", "internalType": "uint256" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "isVIP", "type": "bool", "internalType": "bool" },
      { "name": "encryptedProof", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getEvent",
    "inputs": [{ "name": "eventId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [
      {
        "components": [
          { "name": "name", "type": "string", "internalType": "string" },
          { "name": "description", "type": "string", "internalType": "string" },
          { "name": "metadataURI", "type": "string", "internalType": "string" },
          { "name": "eventDate", "type": "uint256", "internalType": "uint256" },
          { "name": "maxAttendees", "type": "uint256", "internalType": "uint256" },
          { "name": "isPrivate", "type": "bool", "internalType": "bool" },
          { "name": "requiresInviteCode", "type": "bool", "internalType": "bool" },
          { "name": "requiresWhitelist", "type": "bool", "internalType": "bool" },
          { "name": "totalTicketsSold", "type": "uint256", "internalType": "uint256" }
        ],
        "name": "",
        "type": "tuple",
        "internalType": "struct EventNestTicket.Event"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getEventCount",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAttendeeCount",
    "inputs": [{ "name": "eventId", "type": "uint256", "internalType": "uint256" }],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setInviteCode",
    "inputs": [
      { "name": "eventId", "type": "uint256", "internalType": "uint256" },
      { "name": "encryptedCode", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "addToWhitelist",
    "inputs": [
      { "name": "eventId", "type": "uint256", "internalType": "uint256" },
      { "name": "wallet", "type": "address", "internalType": "address" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "verifyAccess",
    "inputs": [
      { "name": "eventId", "type": "uint256", "internalType": "uint256" },
      { "name": "encryptedWallet", "type": "bytes32", "internalType": "bytes32" },
      { "name": "encryptedCode", "type": "bytes32", "internalType": "bytes32" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "eventWhitelist",
    "inputs": [
      { "name": "", "type": "uint256", "internalType": "uint256" },
      { "name": "", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "EventCreated",
    "inputs": [
      { "name": "eventId", "type": "uint256", "indexed": true, "internalType": "uint256" },
      { "name": "name", "type": "string", "indexed": false, "internalType": "string" },
      { "name": "isPrivate", "type": "bool", "indexed": false, "internalType": "bool" }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TicketMinted",
    "inputs": [
      { "name": "ticketId", "type": "uint256", "indexed": true, "internalType": "uint256" },
      { "name": "eventId", "type": "uint256", "indexed": true, "internalType": "uint256" },
      { "name": "holder", "type": "address", "indexed": true, "internalType": "address" }
    ],
    "anonymous": false
  }
] as const
