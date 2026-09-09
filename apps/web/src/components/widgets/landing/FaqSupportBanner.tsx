import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Headphones,
  HelpCircle,
  MessageCircle,
  Radio,
  ShieldCheck,
  Ship,
  Sparkles,
  Users
} from "lucide-react";

import maldivesImg from "@/assets/landing-page/maldives.png";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button
} from "@/ui";

const FAQS = [
  {
    id: "faq-1",
    question: "How do I receive and present my ferry boarding pass?",
    answer:
      "Upon completing your reservation, your digital QR boarding pass is generated instantly on screen, emailed immediately, and available for 1-tap download into Apple Wallet or Google Wallet. At the harbor gate, simply show the QR code on your phone for instant scanning."
  },
  {
    id: "faq-2",
    question: "What is the luggage allowance on speedboats and ferries?",
    answer:
      "Standard ferry and speedboat bookings include 1 large check-in suitcase (up to 20kg) and 1 hand luggage bag per passenger free of charge. You can easily add extra luggage, surfboards, or scuba gear during checkout."
  },
  {
    id: "faq-3",
    question: "What happens if sea conditions cause a trip cancellation?",
    answer:
      "IslandHop monitors official maritime weather advisories 24/7. In the rare event an operator cancels a departure due to rough seas, you receive an immediate text notification and your choice of a free reschedule to the next safe departure or a 100% instant refund."
  },
  {
    id: "faq-4",
    question: "Can I change my travel date or passenger name after booking?",
    answer:
      "Yes! You can manage and update your booking details up to 2 hours prior to departure via our 'Manage Booking' portal without calling support. Changing passenger names is always 100% free."
  },
  {
    id: "faq-5",
    question: "How early should I arrive at the departure jetty or harbor?",
    answer:
      "We recommend arriving 15 to 20 minutes before your scheduled departure time. Harbor terminal gates begin passenger boarding 10 minutes prior to departure."
  }
];

export function FaqSupportBanner() {
  return (
    <section id="faqs" className="relative py-20 md:py-28 overflow-hidden">
      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute -top-20 left-1/4 h-[450px] w-[450px] rounded-full bg-blue-500/10 blur-[130px] -z-10" />
      <div className="pointer-events-none absolute -bottom-20 right-1/4 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[130px] -z-10" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          
          {/* Left Column: Heading & Luxury Island Card with Integrated Concierge */}
          <div className="space-y-6 lg:col-span-5 lg:sticky lg:top-24">
            {/* Header */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-blue-600 uppercase shadow-xs backdrop-blur-md dark:text-blue-400">
                <HelpCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>FREQUENTLY ASKED QUESTIONS</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.12]">
                Everything you need <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-sky-300">
                  to know
                </span>
                .
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Got questions before hopping across the islands? Here are quick answers from our 24/7 maritime operations team.
              </p>
            </div>

            {/* Luxury Showcase Card */}
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-blue-500/40 hover:shadow-2xl">
              {/* Image Container with Gradient Overlay */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={maldivesImg}
                  alt="Maldives island turquoise waters"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 ease-out hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                {/* Floating Top Left Badge */}
                <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-md">
                  <Ship className="h-3.5 w-3.5 text-sky-400" />
                  <span>12+ Island Harbors</span>
                </div>

                {/* Floating Top Right Badge */}
                <div className="absolute top-3.5 right-3.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-emerald-600/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md shadow-md">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>100% Guaranteed</span>
                </div>

                {/* Overlay Text Inside Image */}
                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-sky-300">
                    <Radio className="h-3 w-3 animate-pulse" />
                    <span>Maldives Maritime Network</span>
                  </div>
                  <div className="text-sm font-bold text-white/95 mt-0.5">
                    Fast & Safe Speedboats across South & North Atolls
                  </div>
                </div>
              </div>

              {/* Bottom Concierge Helper Area */}
              <div className="p-5 sm:p-6 bg-gradient-to-b from-card to-muted/20 border-t border-border/60 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30">
                    <Headphones className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="text-sm font-bold text-foreground">Have a specific question?</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Our live harbor concierge is online 24/7 to assist with departures, routes, and bookings.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <Button
                    size="default"
                    className="group relative h-10 w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-bold text-white shadow-md shadow-blue-600/25 hover:shadow-lg transition-all active:scale-[0.98]"
                    asChild
                  >
                    <Link href="/help" className="flex items-center justify-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Chat with Concierge</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="default"
                    className="h-10 w-full sm:w-auto shrink-0 rounded-xl border-border/80 bg-background/80 px-4 text-xs font-bold text-foreground hover:bg-muted shadow-2xs"
                    asChild
                  >
                    <Link href="/help">Help Center</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Accordion Cards */}
          <div className="lg:col-span-7">
            <Accordion type="single" collapsible defaultValue="faq-1" className="w-full space-y-3.5">
              {FAQS.map((faq, index) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="group overflow-hidden rounded-3xl border border-border/80 bg-card/90 px-6 py-1 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:bg-card hover:shadow-lg data-[state=open]:border-blue-500/50 data-[state=open]:bg-gradient-to-r data-[state=open]:from-blue-500/[0.04] data-[state=open]:via-card data-[state=open]:to-indigo-500/[0.03] data-[state=open]:shadow-md"
                >
                  <AccordionTrigger className="text-left text-sm sm:text-base font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 py-4 [&[data-state=open]>div>.faq-num]:bg-blue-600 [&[data-state=open]>div>.faq-num]:text-white [&[data-state=open]>div>.faq-num]:shadow-md [&[data-state=open]>div>.faq-num]:shadow-blue-600/30">
                    <div className="flex items-center gap-3.5 pr-2">
                      <span className="faq-num flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-xs font-black text-blue-600 dark:text-blue-400 transition-all duration-300">
                        {index + 1}
                      </span>
                      <span className="tracking-tight">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-10 pr-2 pb-4">
                    <p className="border-t border-border/50 pt-3">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

        </div>
      </div>
    </section>
  );
}
