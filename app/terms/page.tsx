import Link from "next/link"
import { ArrowRight, Shield } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"

const sections = [
  {
    title: "On-Chain Transactions",
    body: "Event creation, ticket minting, whitelist updates, transfers, burns, and check-ins are blockchain transactions. They may be irreversible once confirmed.",
  },
  {
    title: "Organizer Responsibility",
    body: "Organizers are responsible for event details, access rules, pricing, attendee communications, and honoring tickets they create.",
  },
  {
    title: "No Refund Automation",
    body: "The current contract does not provide automated refunds, cancellation payouts, or chargebacks. Organizers should publish their own refund policy before selling tickets.",
  },
  {
    title: "Public Blockchain Data",
    body: "Event metadata, ticket ownership, transfers, allowlist addresses, capacity, pricing, and check-in state are public blockchain data. Confidential invite credentials use the CoFHE path described in the privacy page.",
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0f766e]/10 px-4 py-2 text-sm text-[#0f766e]">
              <Shield className="h-4 w-4" />
              EventNest Terms
            </div>
            <h1 className="text-4xl md:text-6xl text-[#1a1a1a] mb-4">Terms of Service</h1>
            <p className="text-lg text-[#666666]">
              These terms describe the current production behavior of EventNest as an on-chain ticketing app.
            </p>
          </div>

          <div className="grid gap-4">
            {sections.map((section) => (
              <section key={section.title} className="rounded-lg border border-[#e5e5e5] bg-[#f5f5f5] p-6">
                <h2 className="text-xl font-medium text-[#1a1a1a] mb-2">{section.title}</h2>
                <p className="text-[#666666] leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1a1a1a] px-6 py-3 text-sm font-medium text-white hover:bg-[#333]"
            >
              Privacy Details
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-6 py-3 text-sm font-medium text-[#1a1a1a] hover:bg-[#f5f5f5]"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
