import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Passport Photo Maker – Crop ID & Visa Photos | GROTON",
  },
  description: "Format and crop photos to official passport, visa, and ID dimensions online. Generate print-ready multi-photo sheets accurately with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/passport-photo",
  },
  openGraph: {
    title: "Free Passport Photo Maker – Crop ID & Visa Photos | GROTON",
    description: "Format and crop photos to official passport, visa, and ID dimensions online. Generate print-ready multi-photo sheets accurately with GROTON.",
    url: "https://groton.in/tools/passport-photo",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Passport Photo Maker – Crop ID & Visa Photos | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Passport Photo Maker – Crop ID & Visa Photos | GROTON",
    description: "Format and crop photos to official passport, visa, and ID dimensions online. Generate print-ready multi-photo sheets accurately with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Passport Photo Maker",
  "url": "https://groton.in/tools/passport-photo",
  "description": "Format and crop photos to official passport, visa, and ID dimensions online. Generate print-ready photo sheets accurately with GROTON.",
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
