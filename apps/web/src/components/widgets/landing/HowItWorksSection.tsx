import Image from "next/image";
import {
  QrCode,
  Search,
  Smartphone,
  Ticket
} from "lucide-react";

import appMockup from "@/assets/landing-page/appMockup.png";

const STEPS = [
  {
    step: "01",
    title: "Search & Compare Departures",
    description:
      "Select your starting harbor, island destination, and travel date. Compare speedboat transfer speeds, departure times, and live ticket prices in one click.",
    icon: Search,
    highlight: "Live schedules & fares"
  },
  {
    step: "02",
    title: "Select Deck Seat & Extras",
    description:
      "Choose your preferred seat on the interactive ferry deck. Add extra luggage, surfboard passes, or hotel harbor pickup easily.",
    icon: Ticket,
    highlight: "Interactive seat matrix"
  },
  {
    step: "03",
    title: "Scan & Hop Aboard",
    description:
      "Receive instant digital QR tickets on your phone. Add directly to Apple Wallet or Google Wallet for smooth, offline terminal gate boarding.",
    icon: QrCode,
    highlight: "1-tap offline wallet pass"
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Steps Left Column */}
          <div className="space-y-8 lg:col-span-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-blue-600 uppercase shadow-xs dark:text-blue-400">
                <Smartphone className="h-3.5 w-3.5" />
                <span>SEAMLESS PASSENGER JOURNEY</span>
              </div>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.12]">
                From search to boarding in 60 seconds.
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-muted-foreground leading-relaxed">
                We eliminated paper ticket queues, confusion at the jetty, and schedule guesswork with our intuitive island booking experience.
              </p>
            </div>

            {/* Step Cards */}
            <div className="space-y-4">
              {STEPS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="group relative flex items-start gap-4 rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 font-mono text-base font-black text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white shadow-xs">
                      {item.step}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <h3 className="text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </h3>
                        </div>
                        <span className="hidden sm:inline-block rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {item.highlight}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-normal text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* App Store Download Badges */}
            <div className="pt-2 space-y-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Available on iOS & Android:
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://www.apple.com/app-store/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-card px-4 py-2.5 text-foreground shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-1.97.6-2.6 1.34-.56.64-.99 1.7-.87 2.73.99.08 2-.48 2.55-1.2" />
                  </svg>
                  <div className="leading-tight text-left">
                    <div className="text-[9px] text-muted-foreground font-medium">Download on the</div>
                    <div className="text-xs font-bold text-foreground">App Store</div>
                  </div>
                </a>

                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-2xl border border-border/80 bg-card px-4 py-2.5 text-foreground shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5"
                >
                  <svg className="h-5 w-5" viewBox="-9 0 274 274" preserveAspectRatio="xMidYMid">
                    <g>
                      <path
                        d="M188.81319,178.874645 C221.272218,161.051727 245.880297,147.470853 248.001319,146.415618 C254.78648,142.806714 261.79324,133.256838 248.001319,125.838536 C243.548228,123.506467 219.573289,110.347687 188.81319,93.3795092 L146.171146,136.443648 L188.81319,178.874645 Z"
                        fill="#FFD900"
                      />
                      <path
                        d="M146.171146,136.443648 L10.3940643,273.286517 C13.5808739,273.708611 17.1792251,272.864423 21.4212696,270.532353 C30.3274526,265.657168 124.739324,214.098388 188.81319,178.885198 L146.171146,136.443648 Z"
                        fill="#F43249"
                      />
                      <path
                        d="M146.171146,136.443648 L188.81319,93.5905562 C188.81319,93.5905562 30.9711459,7.45172685 21.4212696,2.36549437 C17.8229184,0.233919759 13.7919209,-0.399221214 10.1830173,0.233919759 L146.171146,136.443648 Z"
                        fill="#00EE76"
                      />
                      <path
                        d="M146.171146,136.443648 L10.1830173,0.233919759 C4.6641385,1.51075405 0,6.38593954 0,16.3579099 C0,32.270853 0,244.003747 0,257.162527 C0,266.290309 3.60890354,272.864423 10.3940643,273.497564 L146.171146,136.443648 Z"
                        fill="#00D3FF"
                      />
                    </g>
                  </svg>
                  <div className="leading-tight text-left">
                    <div className="text-[9px] text-muted-foreground font-medium">GET IT ON</div>
                    <div className="text-xs font-bold text-foreground">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Clean Phone Mockup Right Column */}
          <div className="flex justify-center lg:col-span-6 lg:justify-end">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <Image
                src={appMockup}
                alt="IslandHop mobile application preview"
                priority
                className="h-auto w-full object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_20px_45px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
