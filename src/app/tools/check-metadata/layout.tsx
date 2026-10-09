import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Metadata Viewer – Inspect EXIF Data | GROTON",
  },
  description: "Inspect hidden EXIF, IPTC, and XMP metadata, camera settings, and GPS location tags in photos directly in your browser. Free image inspector by GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/check-metadata",
  },
  openGraph: {
    title: "Free Image Metadata Viewer – Inspect EXIF Data | GROTON",
    description: "Inspect hidden EXIF, IPTC, and XMP metadata, camera settings, and GPS location tags in photos directly in your browser. Free image inspector by GROTON.",
    url: "https://groton.in/tools/check-metadata",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Metadata Viewer – Inspect EXIF Data | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Metadata Viewer – Inspect EXIF Data | GROTON",
    description: "Inspect hidden EXIF, IPTC, and XMP metadata, camera settings, and GPS location tags in photos directly in your browser. Free image inspector by GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Check Metadata",
  "url": "https://groton.in/tools/check-metadata",
  "description": "Inspect hidden EXIF, IPTC, XMP metadata, camera details, and GPS location tags in photos online. Free browser-side image inspector by GROTON.",
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
