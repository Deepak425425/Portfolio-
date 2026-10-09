import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Compressor Online – Reduce File Size | GROTON",
  },
  description: "Compress JPG, PNG, and WebP images online without losing visible quality. Shrink photo file sizes to custom target limits quickly with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/compressor",
  },
  openGraph: {
    title: "Free Image Compressor Online – Reduce File Size | GROTON",
    description: "Compress JPG, PNG, and WebP images online without losing visible quality. Shrink photo file sizes to custom target limits quickly with GROTON.",
    url: "https://groton.in/tools/compressor",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Compressor Online – Reduce File Size | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Compressor Online – Reduce File Size | GROTON",
    description: "Compress JPG, PNG, and WebP images online without losing visible quality. Shrink photo file sizes to custom target limits quickly with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Compressor",
  "url": "https://groton.in/tools/compressor",
  "description": "Compress JPG, PNG, and WebP images online without losing visible quality. Shrink image file sizes to custom MB or KB targets with GROTON.",
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
