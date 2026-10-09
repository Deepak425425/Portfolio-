import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Social Media Image Resizer – Format Post Sizes | GROTON",
  },
  description: "Quickly format and resize images for Instagram, YouTube, X (Twitter), LinkedIn, and Facebook with platform-accurate aspect ratios using GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/social-resizer",
  },
  openGraph: {
    title: "Free Social Media Image Resizer – Format Post Sizes | GROTON",
    description: "Quickly format and resize images for Instagram, YouTube, X (Twitter), LinkedIn, and Facebook with platform-accurate aspect ratios using GROTON.",
    url: "https://groton.in/tools/social-resizer",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Social Media Image Resizer – Format Post Sizes | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Social Media Image Resizer – Format Post Sizes | GROTON",
    description: "Quickly format and resize images for Instagram, YouTube, X (Twitter), LinkedIn, and Facebook with platform-accurate aspect ratios using GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Social Media Image Resizer",
  "url": "https://groton.in/tools/social-resizer",
  "description": "Quickly format and resize images for Instagram, YouTube, Twitter, LinkedIn, and Facebook without unwanted cropping using GROTON.",
  "applicationCategory": "PhotoEditor",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      {children}
    </>
  );
}
