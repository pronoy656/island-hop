import Image from "next/image";

import appMockup from "@/assets/landing-page/appMockup.png";
import howItWorksBg from "@/assets/landing-page/how-it-works-bg.png";

export function HowItWorksSection() {
  return (
    <section className="border-border/60 relative overflow-hidden border-y py-16 md:py-44">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={howItWorksBg}
          alt="How it works background"
          fill
          className="object-cover object-center opacity-90"
        />
        <div className="absolute inset-0" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Steps Left Column */}
          <div className="space-y-8 lg:col-span-5">
            <div>
              <span className="text-primary text-xs font-bold tracking-wider uppercase">
                How It Works
              </span>
              <h2 className="text-foreground mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                From search to boarding.
              </h2>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold">
                  01
                </div>
                <div>
                  <h3 className="text-foreground text-base font-bold">Find your ferry</h3>
                  <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                    Choose your departure, destination and travel date.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold">
                  02
                </div>
                <div>
                  <h3 className="text-foreground text-base font-bold">Pick your trip & seat</h3>
                  <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                    Compare departure times, fares and available seats.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold">
                  03
                </div>
                <div>
                  <h3 className="text-foreground text-base font-bold">Book securely</h3>
                  <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
                    Enter passenger details and complete your payment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Mockups Right Column */}
          <div className="relative flex justify-center lg:col-span-7 lg:justify-end">
            <div className="relative w-full max-w-lg">
              <Image
                src={appMockup}
                alt="IslandHop mobile application preview"
                priority
                className="h-auto w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
