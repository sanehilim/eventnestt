import fs from "node:fs"
import path from "node:path"
import { spawn } from "node:child_process"

const rootDir = process.cwd()
const nextDir = path.join(rootDir, ".next")
const nextCli = path.join(rootDir, "node_modules", "next", "dist", "bin", "next")

if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true })
}

const child = spawn(process.execPath, [nextCli, "build"], {
  cwd: rootDir,
  stdio: "inherit",
  shell: false,
})

child.on("exit", (code) => {
  process.exit(code ?? 1)
})
