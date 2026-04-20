import fs from "node:fs"
import path from "node:path"
import solc from "solc"

const rootDir = process.cwd()
const contractFile = path.join(rootDir, "contracts", "EventNestTicket.sol")
const outFile = path.join(rootDir, "out", "EventNestTicket.sol", "EventNestTicket.json")
const abiFile = path.join(rootDir, "contracts", "abi.ts")

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

  const localCandidates = [
    path.join(rootDir, importPath),
    path.join(rootDir, "contracts", importPath),
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
      optimizer: {
        enabled: true,
        runs: 200,
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
  }
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  const result = compileContract()
  console.log(`Compiled EventNestTicket (${result.bytecode.length / 2} bytes of bytecode).`)
}
