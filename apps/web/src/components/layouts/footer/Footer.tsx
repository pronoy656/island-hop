import Link from "next/link";

import { Facebook, Instagram, Linkedin, Ship, Twitter } from "lucide-react";

const PLATFORM_LINKS = [
  { name: "Book a Ferry", href: "/#book" },
  { name: "Manage Booking", href: "/#manage-booking" },
  { name: "Schedules", href: "/#schedules" },
  { name: "Ferry Routes", href: "/routes" },
  { name: "Offers", href: "/routes" }
];

const COMPANY_LINKS = [
  { name: "About Us", href: "/help" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Blog", href: "/help" },
  { name: "Careers", href: "/help" },
  { name: "Newsroom", href: "/help" }
];

const SUPPORT_LINKS = [
  { name: "Help Center", href: "/help" },
  { name: "Contact Us", href: "/help" },
  { name: "Terms of Service", href: "/help" },
  { name: "Privacy Policy", href: "/help" },
  { name: "FAQs", href: "/help" }
];

const SOCIAL_LINKS = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
  { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" }
];

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-[#071328] text-slate-300">
      {/* Decorative Ferry Watermark in Background matching design */}
      <div className="pointer-events-none absolute right-0 bottom-0 z-0 hidden translate-x-8 translate-y-6 opacity-10 lg:block">
        <Ship className="h-96 w-96 text-white" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-12 lg:gap-8">
          {/* Column 1: Brand Info & Socials (4 Cols) */}
          <div className="space-y-6 lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl shadow-md">
                <Ship className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Island<span className="text-primary">Hop</span>
              </span>
            </Link>

            <p className="max-w-sm text-xs leading-relaxed text-slate-400 sm:text-sm">
              A comprehensive Ferry Booking & Management Platform for seamless journeys across
              waters.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.name}
                    className="hover:border-primary hover:bg-primary/20 flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-slate-400 transition-all hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Platform Links (2 Cols) */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="text-sm font-bold text-white">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company Links (2 Cols) */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="text-sm font-bold text-white">Company</h4>
            <ul className="space-y-2.5 text-xs">
              {COMPANY_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Support Links (2 Cols) */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="text-sm font-bold text-white">Support</h4>
            <ul className="space-y-2.5 text-xs">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Download the App (2 Cols) */}
          <div className="space-y-4 lg:col-span-2">
            <h4 className="text-sm font-bold text-white">Download the App</h4>
            <p className="text-xs text-slate-400">Book and manage your trips on the go.</p>

            <div className="space-y-2.5 pt-1">
              {/* App Store Button */}
              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download IslandHop on the App Store"
                className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-left text-white shadow-sm transition-all hover:border-slate-500 hover:bg-slate-800"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-1.97.6-2.6 1.34-.56.64-.99 1.7-.87 2.73.99.08 2-.48 2.55-1.2" />
                </svg>
                <div className="leading-tight">
                  <div className="text-[9px] text-slate-400">Download on the</div>
                  <div className="text-xs font-bold text-white">App Store</div>
                </div>
              </a>

              {/* Google Play Button */}
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Download IslandHop on Google Play"
                className="flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2 text-left shadow-sm transition-all hover:border-slate-500 hover:bg-slate-800"
              >
                <svg className="h-5 w-5" viewBox="-9 0 274 274" preserveAspectRatio="xMidYMid">
                  <g>
                    <path
                      d="M188.81319,178.874645 C221.272218,161.051727 245.880297,147.470853 248.001319,146.415618 C254.78648,142.806714 261.79324,133.256838 248.001319,125.838536 C243.548228,123.506467 219.573289,110.347687 188.81319,93.3795092 L146.171146,136.443648 L188.81319,178.874645 Z"
                      fill="#FFD900"
                    ></path>
                    <path
                      d="M146.171146,136.443648 L10.3940643,273.286517 C13.5808739,273.708611 17.1792251,272.864423 21.4212696,270.532353 C30.3274526,265.657168 124.739324,214.098388 188.81319,178.885198 L146.171146,136.443648 Z"
                      fill="#F43249"
                    ></path>
                    <path
                      d="M146.171146,136.443648 L188.81319,93.5905562 C188.81319,93.5905562 30.9711459,7.45172685 21.4212696,2.36549437 C17.8229184,0.233919759 13.7919209,-0.399221214 10.1830173,0.233919759 L146.171146,136.443648 Z"
                      fill="#00EE76"
                    ></path>
                    <path
                      d="M146.171146,136.443648 L10.1830173,0.233919759 C4.6641385,1.51075405 0,6.38593954 0,16.3579099 C0,32.270853 0,244.003747 0,257.162527 C0,266.290309 3.60890354,272.864423 10.3940643,273.497564 L146.171146,136.443648 Z"
                      fill="#00D3FF"
                    ></path>
                  </g>
                </svg>
                <div className="leading-tight">
                  <div className="text-[9px] text-slate-400">GET IT ON</div>
                  <div className="text-xs font-bold text-white">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Strip: Copyright & Tagline */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} IslandHop Maritime. All rights reserved.</p>
          <p className="font-medium text-slate-400">Safe Journeys. Every Time.</p>
        </div>
      </div>
    </footer>
  );
}
