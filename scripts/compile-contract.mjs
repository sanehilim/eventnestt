import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import solc from "solc"

const rootDir = process.cwd()
const contractFile = path.join(rootDir, "contracts", "EventNestTicket.sol")
const outFile = path.join(rootDir, "out", "EventNestTicket.sol", "EventNestTicket.json")
const abiFile = path.join(rootDir, "contracts", "abi.ts")
const maxRuntimeBytes = 24_576

function readSource(candidate) {
  if (!fs.existsSync(candidate)) {
    return null
  }

  return {
    contents: fs.readFileSync(candidate, "utf8"),
  }
}

function findImports(importPath) {
  if (importPath.startsWith("@openzeppelin/contracts/")) {
    const resolved = path.join(
      rootDir,
      "lib",
      "openzeppelin-contracts",
      "contracts",
      importPath.replace("@openzeppelin/contracts/", ""),
    )
    return readSource(resolved) ?? { error: `Import not found: ${importPath}` }
  }

  if (importPath.startsWith("@fhenixprotocol/cofhe-contracts/")) {
    const resolved = path.join(rootDir, "node_modules", ...importPath.split("/"))
    return readSource(resolved) ?? { error: `Import not found: ${importPath}` }
  }

  if (importPath === "./ICofhe.sol" || importPath === "ICofhe.sol") {
    const resolved = path.join(rootDir, "node_modules", "@fhenixprotocol", "cofhe-contracts", "ICofhe.sol")
    return readSource(resolved) ?? { error: `Import not found: ${importPath}` }
  }

  const localCandidates = [
    path.join(rootDir, importPath),
    path.join(rootDir, "contracts", importPath),
    path.join(rootDir, "node_modules", importPath),
  ]

  for (const candidate of localCandidates) {
    const found = readSource(candidate)
    if (found) {
      return found
    }
  }

  return { error: `Import not found: ${importPath}` }
}

export function compileContract() {
  const source = fs.readFileSync(contractFile, "utf8")
  const input = {
    language: "Solidity",
    sources: {
      "contracts/EventNestTicket.sol": {
        content: source,
      },
    },
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 0,
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
        },
      },
    },
  }

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }))
  const errors = output.errors ?? []
  const fatalErrors = errors.filter((entry) => entry.severity === "error")

  if (fatalErrors.length > 0) {
    throw new Error(fatalErrors.map((entry) => entry.formattedMessage).join("\n\n"))
  }

  const artifact = output.contracts["contracts/EventNestTicket.sol"]?.EventNestTicket
  if (!artifact) {
    throw new Error("EventNestTicket artifact was not generated.")
  }

  const runtimeBytes = artifact.evm.deployedBytecode.object.length / 2
  if (runtimeBytes > maxRuntimeBytes) {
    throw new Error(`EventNestTicket runtime is ${runtimeBytes} bytes, above the ${maxRuntimeBytes} byte deployment limit.`)
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true })
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        abi: artifact.abi,
        bytecode: {
          object: artifact.evm.bytecode.object,
        },
        deployedBytecode: {
          object: artifact.evm.deployedBytecode.object,
        },
      },
      null,
      2,
    ),
  )

  fs.writeFileSync(abiFile, `export const abi = ${JSON.stringify(artifact.abi, null, 2)} as const\n`)

  return {
    abi: artifact.abi,
    bytecode: artifact.evm.bytecode.object,
    deployedBytecode: artifact.evm.deployedBytecode.object,
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = compileContract()
  console.log(
    `Compiled EventNestTicket (creation ${result.bytecode.length / 2} bytes, runtime ${result.deployedBytecode.length / 2} bytes).`,
  )
}
