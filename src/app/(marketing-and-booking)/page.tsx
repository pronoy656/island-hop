import {
  FaqSupportBanner,
  FeaturesSection,
  FinalCtaSection,
  HeroSection,
  HowItWorksSection,
  ManageBookingSection,
  OperatorPlatformSection,
  PopularJourneysSection,
  TestimonialsSection
} from "@/components/widgets";
import { AnimatedSection } from "@/ui";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col space-y-12 overflow-x-hidden sm:space-y-16 lg:space-y-20">
      {/* 1. Hero Section with booking search widget */}
      <AnimatedSection initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} delay={0}>
        <HeroSection />
      </AnimatedSection>

      {/* 3. Popular Journeys Grid ("Where are you heading?") */}
      <AnimatedSection delay={0.05}>
        <PopularJourneysSection />
      </AnimatedSection>

      {/* 4. Why IslandHop / Passenger Experience Features */}
      <AnimatedSection delay={0.05}>
        <FeaturesSection />
      </AnimatedSection>

      {/* 5. How It Works (Step-by-step with mobile app preview) */}
      <AnimatedSection delay={0.05}>
        <HowItWorksSection />
      </AnimatedSection>

      {/* 6. Real Traveler Testimonials & Social Proof */}
      <AnimatedSection delay={0.05}>
        <TestimonialsSection />
      </AnimatedSection>

      {/* 7. Manage Your Booking Widget */}
      <AnimatedSection delay={0.05}>
        <ManageBookingSection />
      </AnimatedSection>

      {/* 8. Ferry Operator Platform Showcase */}
      <AnimatedSection delay={0.05}>
        <OperatorPlatformSection />
      </AnimatedSection>

      {/* 9. Interactive FAQ & 24/7 Harbor Support Banner */}
      <AnimatedSection delay={0.05}>
        <FaqSupportBanner />
      </AnimatedSection>

      {/* 10. Ocean Video / Image Call To Action */}
      <AnimatedSection delay={0.05}>
        <FinalCtaSection />
      </AnimatedSection>
    </div>
  );
}
