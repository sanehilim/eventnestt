import { loadLocalEnv } from "./env.mjs"

loadLocalEnv()

const baseUrl = process.env.SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://event-nest-rho.vercel.app"
const routes = ["/", "/events", "/dashboard/create", "/tickets", "/privacy", "/terms"]

for (const route of routes) {
  const url = new URL(route, baseUrl).toString()
  const response = await fetch(url, { redirect: "follow" })
  if (!response.ok) {
    throw new Error(`Smoke check failed for ${url}: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  if (!html.includes("EventNest")) {
    throw new Error(`Smoke check failed for ${url}: expected EventNest content`)
  }

  console.log(`OK ${url}`)
}
