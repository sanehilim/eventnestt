import fs from "node:fs"
import path from "node:path"
import { createPublicClient, createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"
import { compileContract } from "./compile-contract.mjs"

const rootDir = process.cwd()
const envFile = path.join(rootDir, ".env.local")
const artifact = compileContract()

const rawPrivateKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY
if (!rawPrivateKey) {
  throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY in the environment.")
}

const privateKey = rawPrivateKey.startsWith("0x") ? rawPrivateKey : `0x${rawPrivateKey}`
const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL ||
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
  process.env.SEPOLIA_RPC_URL ||
  "https://ethereum-sepolia.publicnode.com"

const account = privateKeyToAccount(privateKey)
const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(rpcUrl),
})
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
})

function updateEnvFile(entries) {
  const existing = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : ""
  const lines = existing
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !entries.some(([key]) => line.startsWith(`${key}=`)))

  const nextLines = [...lines, ...entries.map(([key, value]) => `${key}=${value}`)]
  fs.writeFileSync(envFile, `${nextLines.join("\n")}\n`)
}

const deploymentHash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
  args: [account.address],
})

const receipt = await publicClient.waitForTransactionReceipt({ hash: deploymentHash })
if (!receipt.contractAddress) {
  throw new Error("Deployment completed without a contract address.")
}

updateEnvFile([
  ["NEXT_PUBLIC_CHAIN_ID", String(sepolia.id)],
  ["NEXT_PUBLIC_RPC_URL", rpcUrl],
  ["NEXT_PUBLIC_SEPOLIA_RPC_URL", rpcUrl],
  ["NEXT_PUBLIC_CONTRACT_ADDRESS", receipt.contractAddress],
])

console.log(`Deployer: ${account.address}`)
console.log(`Transaction: ${deploymentHash}`)
console.log(`Contract: ${receipt.contractAddress}`)
console.log(`Explorer: https://sepolia.etherscan.io/address/${receipt.contractAddress}`)
