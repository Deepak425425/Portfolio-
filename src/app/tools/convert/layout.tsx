import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Online Image Converter – JPG, PNG & WebP | GROTON",
  },
  description: "Convert images between JPG, PNG, WebP, and other popular formats directly in your browser. Fast, private batch photo conversion with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/convert",
  },
  openGraph: {
    title: "Free Online Image Converter – JPG, PNG & WebP | GROTON",
    description: "Convert images between JPG, PNG, WebP, and other popular formats directly in your browser. Fast, private batch photo conversion with GROTON.",
    url: "https://groton.in/tools/convert",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Online Image Converter – JPG, PNG & WebP | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Image Converter – JPG, PNG & WebP | GROTON",
    description: "Convert images between JPG, PNG, WebP, and other popular formats directly in your browser. Fast, private batch photo conversion with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Converter",
  "url": "https://groton.in/tools/convert",
  "description": "Convert image files between JPG, PNG, WebP, and other formats instantly in your browser. Fast, private batch image conversion with GROTON.",
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
