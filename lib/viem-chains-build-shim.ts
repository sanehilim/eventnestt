const ethCurrency = {
  decimals: 18,
  name: "Ether",
  symbol: "ETH",
} as const

export const mainnet = {
  id: 1,
  name: "Ethereum",
  nativeCurrency: ethCurrency,
  rpcUrls: { default: { http: ["https://cloudflare-eth.com"] } },
} as const

export const sepolia = {
  id: 11155111,
  name: "Sepolia",
  nativeCurrency: ethCurrency,
  rpcUrls: { default: { http: ["https://ethereum-sepolia-rpc.publicnode.com"] } },
  testnet: true,
} as const

export const hardhat = {
  id: 31337,
  name: "Hardhat",
  nativeCurrency: ethCurrency,
  rpcUrls: { default: { http: ["http://127.0.0.1:8545"] } },
} as const

export const arbitrum = {
  id: 42161,
  name: "Arbitrum One",
  nativeCurrency: ethCurrency,
  rpcUrls: { default: { http: ["https://arb1.arbitrum.io/rpc"] } },
} as const

export const arbitrumSepolia = {
  id: 421614,
  name: "Arbitrum Sepolia",
  nativeCurrency: ethCurrency,
  rpcUrls: { default: { http: ["https://sepolia-rollup.arbitrum.io/rpc"] } },
  testnet: true,
} as const

export const base = {
  id: 8453,
  name: "Base",
  nativeCurrency: ethCurrency,
  rpcUrls: { default: { http: ["https://mainnet.base.org"] } },
} as const

export const baseSepolia = {
  id: 84532,
  name: "Base Sepolia",
  nativeCurrency: ethCurrency,
  rpcUrls: { default: { http: ["https://sepolia.base.org"] } },
  testnet: true,
} as const

export const optimism = {
  id: 10,
  name: "OP Mainnet",
  nativeCurrency: ethCurrency,
  rpcUrls: { default: { http: ["https://mainnet.optimism.io"] } },
} as const

export const polygon = {
  id: 137,
  name: "Polygon",
  nativeCurrency: {
    decimals: 18,
    name: "POL",
    symbol: "POL",
  },
  rpcUrls: { default: { http: ["https://polygon-rpc.com"] } },
} as const

export const polygonMumbai = {
  id: 80001,
  name: "Polygon Mumbai",
  nativeCurrency: {
    decimals: 18,
    name: "MATIC",
    symbol: "MATIC",
  },
  rpcUrls: { default: { http: ["https://rpc-mumbai.maticvigil.com"] } },
  testnet: true,
} as const

export const avalanche = {
  id: 43114,
  name: "Avalanche",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "AVAX",
  },
  rpcUrls: { default: { http: ["https://api.avax.network/ext/bc/C/rpc"] } },
} as const

export const bsc = {
  id: 56,
  name: "BNB Smart Chain",
  nativeCurrency: {
    decimals: 18,
    name: "BNB",
    symbol: "BNB",
  },
  rpcUrls: { default: { http: ["https://bsc-dataseed.binance.org"] } },
} as const

export const optimismSepolia = {
  id: 11155420,
  name: "OP Sepolia",
  nativeCurrency: ethCurrency,
  rpcUrls: { default: { http: ["https://sepolia.optimism.io"] } },
  testnet: true,
} as const

export const zora = {
  id: 7777777,
  name: "Zora",
  nativeCurrency: ethCurrency,
  rpcUrls: { default: { http: ["https://rpc.zora.energy"] } },
} as const
