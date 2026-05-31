import fs from "node:fs"
import path from "node:path"
import { createPublicClient, createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"
import { compileContract } from "./compile-contract.mjs"
import { loadLocalEnv } from "./env.mjs"

loadLocalEnv()

const rootDir = process.cwd()
const envFile = path.join(rootDir, ".env.local")
const envExampleFile = path.join(rootDir, ".env.example")
const deploymentRegistryFile = path.join(rootDir, "lib", "deployments.ts")
const artifact = compileContract()
const bytecode = artifact.bytecode.startsWith("0x") ? artifact.bytecode : `0x${artifact.bytecode}`

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

function updateEnvFile(filePath, entries) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : ""
  const lines = existing
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !entries.some(([key]) => line.startsWith(`${key}=`)))

  const nextLines = [...lines, ...entries.map(([key, value]) => `${key}=${value}`)]
  fs.writeFileSync(filePath, `${nextLines.join("\n")}\n`)
}

function updateDeploymentRegistry(contractAddress, deployBlock) {
  if (!fs.existsSync(deploymentRegistryFile)) {
    return
  }

  const source = fs.readFileSync(deploymentRegistryFile, "utf8")
  const nextSource = source
    .replace(
      /(\[sepolia\.id\]: \{[\s\S]*?contractAddress: )"0x[a-fA-F0-9]{40}"/,
      `$1"${contractAddress}"`,
    )
    .replace(
      /(\[sepolia\.id\]: \{[\s\S]*?deployBlock: )\d+n/,
      `$1${deployBlock}n`,
    )

  fs.writeFileSync(deploymentRegistryFile, nextSource)
}

const deploymentHash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode,
})

const receipt = await publicClient.waitForTransactionReceipt({ hash: deploymentHash })
if (!receipt.contractAddress) {
  throw new Error("Deployment completed without a contract address.")
}

const envEntries = [
  ["NEXT_PUBLIC_CHAIN_ID", String(sepolia.id)],
  ["NEXT_PUBLIC_RPC_URL", rpcUrl],
  ["NEXT_PUBLIC_SEPOLIA_RPC_URL", rpcUrl],
  ["NEXT_PUBLIC_CONTRACT_ADDRESS", receipt.contractAddress],
  ["NEXT_PUBLIC_CONTRACT_DEPLOY_BLOCK", String(receipt.blockNumber)],
]
const exampleEnvEntries = [
  ["NEXT_PUBLIC_CHAIN_ID", String(sepolia.id)],
  ["NEXT_PUBLIC_RPC_URL", "https://ethereum-sepolia.publicnode.com"],
  ["NEXT_PUBLIC_SEPOLIA_RPC_URL", "https://ethereum-sepolia.publicnode.com"],
  ["NEXT_PUBLIC_CONTRACT_ADDRESS", receipt.contractAddress],
  ["NEXT_PUBLIC_CONTRACT_DEPLOY_BLOCK", String(receipt.blockNumber)],
]

updateEnvFile(envFile, envEntries)
updateEnvFile(envExampleFile, exampleEnvEntries)
updateDeploymentRegistry(receipt.contractAddress, receipt.blockNumber)

console.log(`Deployer: ${account.address}`)
console.log(`Transaction: ${deploymentHash}`)
console.log(`Contract: ${receipt.contractAddress}`)
console.log(`Explorer: https://sepolia.etherscan.io/address/${receipt.contractAddress}`)
