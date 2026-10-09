import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Quality Checker – Check DPI & Resolution | GROTON",
  },
  description: "Analyze image resolution, DPI metrics, dimensions, and compression artifacts to ensure print and web readiness directly in your browser with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/image-quality-checker",
  },
  openGraph: {
    title: "Free Image Quality Checker – Check DPI & Resolution | GROTON",
    description: "Analyze image resolution, DPI metrics, dimensions, and compression artifacts to ensure print and web readiness directly in your browser with GROTON.",
    url: "https://groton.in/tools/image-quality-checker",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Quality Checker – Check DPI & Resolution | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Quality Checker – Check DPI & Resolution | GROTON",
    description: "Analyze image resolution, DPI metrics, dimensions, and compression artifacts to ensure print and web readiness directly in your browser with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Quality Checker",
  "url": "https://groton.in/tools/image-quality-checker",
  "description": "Analyze image resolution, DPI, dimensions, and compression artifacts for print and web readiness online with GROTON.",
  "applicationCategory": "UtilitiesApplication",
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
