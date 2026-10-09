import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free EXIF Metadata Remover – Protect Photo Privacy | GROTON",
  },
  description: "Remove EXIF data, GPS location tags, camera metadata, and timestamps from photos to protect personal privacy before sharing online with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/metadata-remover",
  },
  openGraph: {
    title: "Free EXIF Metadata Remover – Protect Photo Privacy | GROTON",
    description: "Remove EXIF data, GPS location tags, camera metadata, and timestamps from photos to protect personal privacy before sharing online with GROTON.",
    url: "https://groton.in/tools/metadata-remover",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free EXIF Metadata Remover – Protect Photo Privacy | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free EXIF Metadata Remover – Protect Photo Privacy | GROTON",
    description: "Remove EXIF data, GPS location tags, camera metadata, and timestamps from photos to protect personal privacy before sharing online with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "EXIF Metadata Remover",
  "url": "https://groton.in/tools/metadata-remover",
  "description": "Remove EXIF data, GPS location tags, camera metadata, and timestamps from photos online to protect your privacy before sharing with GROTON.",
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
