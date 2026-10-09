import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Rotate & Flip Image Online – Mirror Photos | GROTON",
  },
  description: "Rotate photos 90, 180, or 270 degrees, flip horizontally, or mirror vertically with zero quality loss directly in your browser with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/rotate-flip",
  },
  openGraph: {
    title: "Free Rotate & Flip Image Online – Mirror Photos | GROTON",
    description: "Rotate photos 90, 180, or 270 degrees, flip horizontally, or mirror vertically with zero quality loss directly in your browser with GROTON.",
    url: "https://groton.in/tools/rotate-flip",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Rotate & Flip Image Online – Mirror Photos | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Rotate & Flip Image Online – Mirror Photos | GROTON",
    description: "Rotate photos 90, 180, or 270 degrees, flip horizontally, or mirror vertically with zero quality loss directly in your browser with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Rotate & Flip Image",
  "url": "https://groton.in/tools/rotate-flip",
  "description": "Rotate photos 90, 180, or 270 degrees, flip horizontally, or mirror vertically online in your browser with GROTON.",
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
