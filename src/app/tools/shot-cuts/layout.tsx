import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Hard Cuts Detector – Video Shot Cut Analysis | GROTON",
  },
  description: "Detect hard scene cuts in video clips, inspect boundary frames, and extract the first frame of every shot directly in your browser with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/shot-cuts",
  },
  openGraph: {
    title: "Free Hard Cuts Detector – Video Shot Cut Analysis | GROTON",
    description: "Detect hard scene cuts in video clips, inspect boundary frames, and extract the first frame of every shot directly in your browser with GROTON.",
    url: "https://groton.in/tools/shot-cuts",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Hard Cuts Detector – Video Shot Cut Analysis | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Hard Cuts Detector – Video Shot Cut Analysis | GROTON",
    description: "Detect hard scene cuts in video clips, inspect boundary frames, and extract the first frame of every shot directly in your browser with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Hard Cuts Detector",
  "url": "https://groton.in/tools/shot-cuts",
  "description": "Detect hard scene cuts in videos, inspect individual frames, and extract the first frame of every shot online in your browser with GROTON.",
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
