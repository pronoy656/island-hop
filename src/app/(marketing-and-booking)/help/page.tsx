"use client";

import * as React from "react";
import { Clock, FileText, Mail, Phone } from "lucide-react";

import { FAQ_DATA, type FAQItem } from "@/data/faqs";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  AnimatedSection,
  Button,
  Card,
  CardContent
} from "@/ui";

const STORAGE_KEY = "islandhop_admin_faqs_v1";

export default function HelpPage() {
  const [faqs, setFaqs] = React.useState<FAQItem[]>(FAQ_DATA);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as (FAQItem & { isPublished?: boolean })[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const published = parsed.filter((item) => item.isPublished !== false);
          if (published.length > 0) {
            setFaqs(published);
          }
        }
      }
    } catch {
      // fallback to initial static data
    }
  }, []);
  return (
    <div className="dark:bg-background min-h-screen bg-[#F8FAFC]">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 pb-20">
        {/* Top Header */}
        <AnimatedSection
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-10 space-y-1"
        >
          <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">FAQ</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Here are some frequently asked questions.
          </p>
          <div className="h-[3px] w-12 rounded-full bg-[#003B95] dark:bg-blue-500" />
        </AnimatedSection>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: FAQ Accordion List */}
          <AnimatedSection delay={0.05} className="lg:col-span-8">
            <Card className="border-border/80 dark:bg-card rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
              <CardContent className="p-0">
                <Accordion type="single" collapsible defaultValue={faqs[0]?.id || "faq-1"} className="w-full">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3.5 pr-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#003B95]/10 text-[#003B95] dark:bg-blue-950/40 dark:text-blue-400">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="space-y-0.5 text-left">
                            <div className="text-foreground text-sm font-bold">{faq.question}</div>
                            <div className="text-primary text-[11px] font-semibold">
                              {faq.category}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pl-[52px] text-xs leading-relaxed sm:text-sm">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Right Column: "Still need help?" Support Cards */}
          <AnimatedSection delay={0.1} className="space-y-6 lg:col-span-4">
            <Card className="border-border/80 dark:bg-card rounded-3xl border bg-white p-6 shadow-sm sm:p-7">
              <CardContent className="space-y-5 p-0">
                <div className="space-y-1">
                  <h3 className="text-foreground text-lg font-bold tracking-tight">
                    Still need help?
                  </h3>
                  <p className="text-muted-foreground text-xs">Our support team is here for you.</p>
                </div>

                {/* 1. Email Support Card */}
                <div className="rounded-2xl border border-blue-100 bg-[#F0F7FF] p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003B95]/10 text-[#003B95] dark:bg-blue-900/50 dark:text-blue-300">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-foreground text-xs font-bold">Email Support</h4>
                      <p className="text-muted-foreground text-[11px]">
                        Send us an email and we&apos;ll get back to you.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="dark:bg-card dark:hover:bg-card/80 mt-3.5 h-9 w-full rounded-xl border-[#003B95]/30 bg-white text-xs font-bold text-[#003B95] hover:bg-blue-50 dark:text-blue-300"
                    asChild
                  >
                    <a href="mailto:support@islandhop.com">Send an Email</a>
                  </Button>
                </div>

                {/* 2. Phone Support Card */}
                <div className="border-border/80 bg-muted/30 rounded-2xl border p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-foreground text-xs font-bold">Phone Support</h4>
                      <p className="text-muted-foreground text-[11px]">
                        Call us during our support hours.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1">
                    <a
                      href="tel:+9603331234"
                      className="text-base font-black text-[#003B95] hover:underline dark:text-blue-400"
                    >
                      +960 333 1234
                    </a>
                    <div className="text-muted-foreground text-[10px] font-medium">
                      Daily, 08:00 AM &ndash; 10:00 PM (MVT)
                    </div>
                  </div>
                </div>

                {/* 3. Support Center Hours Card */}
                <div className="border-border/80 bg-muted/30 rounded-2xl border p-4">
                  <div className="flex items-start gap-2.5">
                    <div className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-foreground text-xs font-bold">Support Center Hours</h4>
                      <p className="text-muted-foreground text-[11px]">
                        We are available every day
                      </p>
                      <div className="text-foreground pt-0.5 text-xs font-bold">
                        08:00 AM &ndash; 10:00 PM (MVT)
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
