import { Header } from "@/components/boty/header"
import { Hero } from "@/components/boty/hero"
import { TrustBadges } from "@/components/boty/trust-badges"
import { ShowcaseGrid } from "@/components/boty/showcase-grid"
import { FeatureSection } from "@/components/boty/feature-section"
import { CTABanner } from "@/components/boty/cta-banner"
import { Newsletter } from "@/components/boty/newsletter"
import { Footer } from "@/components/boty/footer"

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <TrustBadges />
      <ShowcaseGrid />
      <FeatureSection />
      <CTABanner />
      <Newsletter />
      <Footer />
    </main>
  )
}
