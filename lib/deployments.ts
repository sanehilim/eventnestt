import { arbitrumSepolia, baseSepolia, mainnet, sepolia } from "wagmi/chains"

export type DeploymentInfo = {
  chainId: number
  chainName: string
  contractAddress: `0x${string}`
  deployBlock: bigint
  explorerUrl: string
  rpcUrl: string
  supportsCofhe: boolean
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const

export const DEPLOYMENT_REGISTRY: Record<number, DeploymentInfo> = {
  [sepolia.id]: {
    chainId: sepolia.id,
    chainName: sepolia.name,
    contractAddress: "0x8816edd9fc6a0e5b2605af22a0db5e9f76d58f0a",
    deployBlock: 10960383n,
    explorerUrl: "https://sepolia.etherscan.io",
    rpcUrl: "https://ethereum-sepolia.publicnode.com",
    supportsCofhe: true,
  },
  [arbitrumSepolia.id]: {
    chainId: arbitrumSepolia.id,
    chainName: arbitrumSepolia.name,
    contractAddress: ZERO_ADDRESS,
    deployBlock: 0n,
    explorerUrl: "https://sepolia.arbiscan.io",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    supportsCofhe: true,
  },
  [baseSepolia.id]: {
    chainId: baseSepolia.id,
    chainName: baseSepolia.name,
    contractAddress: ZERO_ADDRESS,
    deployBlock: 0n,
    explorerUrl: "https://sepolia.basescan.org",
    rpcUrl: "https://sepolia.base.org",
    supportsCofhe: true,
  },
  [mainnet.id]: {
    chainId: mainnet.id,
    chainName: mainnet.name,
    contractAddress: ZERO_ADDRESS,
    deployBlock: 0n,
    explorerUrl: "https://etherscan.io",
    rpcUrl: "https://ethereum.publicnode.com",
    supportsCofhe: false,
  },
}

export function getDeploymentInfo(chainId: number): DeploymentInfo {
  const registryEntry = DEPLOYMENT_REGISTRY[chainId] ?? DEPLOYMENT_REGISTRY[sepolia.id]
  const contractAddress = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || registryEntry.contractAddress) as `0x${string}`
  const deployBlock = BigInt(process.env.NEXT_PUBLIC_CONTRACT_DEPLOY_BLOCK || registryEntry.deployBlock)
  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL ||
    process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
    registryEntry.rpcUrl

  return {
    ...registryEntry,
    contractAddress,
    deployBlock,
    rpcUrl,
  }
}
