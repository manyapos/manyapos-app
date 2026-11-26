// scripts/prepare-tauri.mjs
// Copies Next.js standalone output into src-tauri/server/ for Tauri bundling
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

const root = join(import.meta.dirname, "..")
const serverDir = join(root, "src-tauri", "server")
const configPath = join(root, "next.config.ts")

// Temporarily add output: "standalone" to next.config.ts
const original = readFileSync(configPath, "utf-8")
const patched = original.replace(
  `serverExternalPackages: ["svg-captcha"],`,
  `output: "standalone",\n  serverExternalPackages: ["svg-captcha"],`
)
writeFileSync(configPath, patched)

try {
  // Build Next.js with standalone output
  const { execSync } = await import("child_process")
  execSync("npx next build", { cwd: root, stdio: "inherit" })
} finally {
  // Restore original config
  writeFileSync(configPath, original)
}

// Clean
rmSync(serverDir, { recursive: true, force: true })
mkdirSync(serverDir, { recursive: true })

// Copy standalone server
cpSync(join(root, ".next", "standalone"), serverDir, { recursive: true })

// Copy static assets
cpSync(join(root, ".next", "static"), join(serverDir, ".next", "static"), { recursive: true })

// Copy public
cpSync(join(root, "public"), join(serverDir, "public"), { recursive: true })

// Copy prisma schema + migrations (needed at runtime)
cpSync(join(root, "prisma"), join(serverDir, "prisma"), { recursive: true })

// Copy .env
cpSync(join(root, ".env"), join(serverDir, ".env"))

console.log("✅ Tauri server bundle prepared at src-tauri/server/")
