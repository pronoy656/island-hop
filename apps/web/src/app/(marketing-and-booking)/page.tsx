import {
  FaqSupportBanner,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  ManageBookingSection,
  OperatorPlatformSection,
  PopularJourneysSection,
  ValuePropositionsSection
} from "@/components/widgets";
import { AnimatedSection } from "@/ui";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col space-y-10 overflow-x-hidden">
      {/* 1. Hero Section with booking search widget */}
      <AnimatedSection initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} delay={0}>
        <HeroSection />
      </AnimatedSection>

      {/* 2. Key Value Propositions Strip */}
      <AnimatedSection delay={0.05}>
        <ValuePropositionsSection />
      </AnimatedSection>

      {/* 3. Popular Journeys Grid */}
      <AnimatedSection delay={0.05}>
        <PopularJourneysSection />
      </AnimatedSection>

      {/* 4. How It Works (Step-by-step with mobile preview) */}
      <AnimatedSection delay={0.05}>
        <HowItWorksSection />
      </AnimatedSection>

      {/* 5. Manage Your Booking Widget */}
      <AnimatedSection delay={0.05}>
        <ManageBookingSection />
      </AnimatedSection>

      {/* 6. Ferry Operator Platform Section */}
      <AnimatedSection delay={0.05}>
        <OperatorPlatformSection />
      </AnimatedSection>

      {/* 7. Questions / Support Banner */}
      <AnimatedSection delay={0.05}>
        <FaqSupportBanner />
      </AnimatedSection>

      {/* 8. Ocean CTA Section */}
      <AnimatedSection delay={0.05}>
        <FinalCtaSection />
      </AnimatedSection>
    </div>
  );
}
