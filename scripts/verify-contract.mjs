import fs from "node:fs"
import path from "node:path"
import solc from "solc"
import { loadLocalEnv } from "./env.mjs"

loadLocalEnv()

const rootDir = process.cwd()
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID || "11155111"
const apiKey = process.env.ETHERSCAN_API_KEY
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
const entrySourceName = "contracts/EventNestTicket.sol"

if (!apiKey) {
  throw new Error("Missing ETHERSCAN_API_KEY. Set it in the shell before running verification.")
}

if (!contractAddress) {
  throw new Error("Missing NEXT_PUBLIC_CONTRACT_ADDRESS. Deploy the contract first.")
}

function resolveImport(importPath, importerSourceName) {
  if (importPath.startsWith("@openzeppelin/contracts/")) {
    return {
      sourceName: importPath,
      filePath: path.join(rootDir, "lib", "openzeppelin-contracts", "contracts", importPath.replace("@openzeppelin/contracts/", "")),
    }
  }

  if (importPath.startsWith("@fhenixprotocol/cofhe-contracts/")) {
    return {
      sourceName: importPath,
      filePath: path.join(rootDir, "node_modules", ...importPath.split("/")),
    }
  }

  if (importPath.startsWith(".")) {
    const importerDir = path.posix.dirname(importerSourceName)
    const sourceName = path.posix.normalize(path.posix.join(importerDir, importPath))
    const basePath = importerSourceName.startsWith("@openzeppelin/contracts/")
      ? path.join(
          rootDir,
          "lib",
          "openzeppelin-contracts",
          "contracts",
          sourceName.replace("@openzeppelin/contracts/", ""),
        )
      : importerSourceName.startsWith("@fhenixprotocol/")
        ? path.join(rootDir, "node_modules", ...sourceName.split("/"))
        : path.join(rootDir, sourceName)

    return { sourceName, filePath: basePath }
  }

  return {
    sourceName: importPath,
    filePath: path.join(rootDir, importPath),
  }
}

function collectSources(sourceName, filePath, sources = {}) {
  if (sources[sourceName]) {
    return sources
  }

  const content = fs.readFileSync(filePath, "utf8")
  sources[sourceName] = { content }

  const importRegex = /import\s+(?:[^"']*from\s+)?["']([^"']+)["'];/g
  let match
  while ((match = importRegex.exec(content)) !== null) {
    const resolved = resolveImport(match[1], sourceName)
    collectSources(resolved.sourceName, resolved.filePath, sources)
  }

  return sources
}

const sourceInput = {
  language: "Solidity",
  sources: collectSources(entrySourceName, path.join(rootDir, entrySourceName)),
  settings: {
    evmVersion: "cancun",
    optimizer: { enabled: true, runs: 0 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
      },
    },
  },
}

const explorerApi =
  process.env.EXPLORER_API_URL ||
  `https://api.etherscan.io/v2/api?chainid=${chainId}`

const body = new URLSearchParams({
  apikey: apiKey,
  chainid: chainId,
  module: "contract",
  action: "verifysourcecode",
  contractaddress: contractAddress,
  sourceCode: JSON.stringify(sourceInput),
  codeformat: "solidity-standard-json-input",
  contractname: `${entrySourceName}:EventNestTicket`,
  compilerversion: `v${solc.version().replace(/\.Emscripten\.clang$/, "")}`,
  optimizationUsed: "1",
  runs: "0",
  evmversion: "cancun",
  licenseType: "3",
})

const response = await fetch(explorerApi, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body,
})

const result = await response.json()
if (result.status !== "1") {
  throw new Error(`Explorer verification failed: ${JSON.stringify(result)}`)
}

console.log(`Verification submitted for ${contractAddress}: ${result.result}`)
