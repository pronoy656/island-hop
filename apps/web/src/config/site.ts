import type { SiteConfig } from "@/types/site-config";
import { env } from "@/env";

export const siteConfig: SiteConfig = {
  name: "IslandHop",
  description: "Fast speedboat & ferry bookings, real-time sea timetables, and fleet management.",
  url: env.NEXT_PUBLIC_SITE_URL,
  author: "Shariar Sultan Fahim",
  locale: "en",
  themeColor: "#000000",
  keywords: ["islandhop", "ferry", "speedboat", "booking", "island transfer", "travel", "maritime"],
  social: {
    twitter: "",
    github: "https://github.com/shariarSultanFahim",
    linkedin: "https://www.linkedin.com/in/shariarsultan"
  },
  ogImage: "/og.jpg"
} as const;
