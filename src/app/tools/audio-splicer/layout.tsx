import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Audio Splicer Online – Cut, Trim & Mix Audio | GROTON",
  },
  description: "Cut, trim, splice, and combine audio clips directly in your browser. Fast, private multi-track audio editing with volume and crossfade controls by GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/audio-splicer",
  },
  openGraph: {
    title: "Free Audio Splicer Online – Cut, Trim & Mix Audio | GROTON",
    description: "Cut, trim, splice, and combine audio clips directly in your browser. Fast, private multi-track audio editing with volume and crossfade controls by GROTON.",
    url: "https://groton.in/tools/audio-splicer",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Audio Splicer Online – Cut, Trim & Mix Audio | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Audio Splicer Online – Cut, Trim & Mix Audio | GROTON",
    description: "Cut, trim, splice, and combine audio clips directly in your browser. Fast, private multi-track audio editing with volume and crossfade controls by GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Audio Splicer",
  "url": "https://groton.in/tools/audio-splicer",
  "description": "Cut, trim, splice, and combine audio clips directly in your browser. Fast, private multi-track audio editing with volume and crossfade controls by GROTON.",
  "applicationCategory": "MultimediaApplication",
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
