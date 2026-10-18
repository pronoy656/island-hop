import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export const seoConfig: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "IslandHop | Across the water, without the hassle",
    template: `%s | ${siteConfig.name}`
  },
  description:
    "Find your route, compare ferry schedules and reserve your seat—all in one simple booking experience.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "IslandHop | Across the water, without the hassle",
    description:
      "Find your route, compare ferry schedules and reserve your seat—all in one simple booking experience.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.social.twitter,
    creator: siteConfig.social.twitter,
    images: [siteConfig.ogImage]
  }
};
