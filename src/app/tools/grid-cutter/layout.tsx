import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Grid Cutter – Split Photos for Instagram | GROTON",
  },
  description: "Slice photos into seamless 3x1, 3x2, or 3x3 grid tiles for Instagram profiles, feed layouts, and carousel posts online for free with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/grid-cutter",
  },
  openGraph: {
    title: "Free Image Grid Cutter – Split Photos for Instagram | GROTON",
    description: "Slice photos into seamless 3x1, 3x2, or 3x3 grid tiles for Instagram profiles, feed layouts, and carousel posts online for free with GROTON.",
    url: "https://groton.in/tools/grid-cutter",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Grid Cutter – Split Photos for Instagram | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Grid Cutter – Split Photos for Instagram | GROTON",
    description: "Slice photos into seamless 3x1, 3x2, or 3x3 grid tiles for Instagram profiles, feed layouts, and carousel posts online for free with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Grid Cutter",
  "url": "https://groton.in/tools/grid-cutter",
  "description": "Slice photos into seamless 3x1, 3x2, or 3x3 grid tiles for Instagram and social media feeds online for free with GROTON.",
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
