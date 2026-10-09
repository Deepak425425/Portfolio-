import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Video Metadata Remover – Remove MP4 EXIF & GPS | GROTON",
  },
  description: "Remove metadata from video files online. Strip EXIF timestamps, GPS location, and camera tags from MP4 and MOV videos before sharing with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/video-metadata-remover",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Free Video Metadata Remover – Remove MP4 EXIF & GPS | GROTON",
    description: "Remove metadata from video files online. Strip EXIF timestamps, GPS location, and camera tags from MP4 and MOV videos before sharing with GROTON.",
    url: "https://groton.in/tools/video-metadata-remover",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Video Metadata Remover – Remove MP4 EXIF & GPS | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video Metadata Remover – Remove MP4 EXIF & GPS | GROTON",
    description: "Remove metadata from video files online. Strip EXIF timestamps, GPS location, and camera tags from MP4 and MOV videos before sharing with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Video Metadata Remover",
  "url": "https://groton.in/tools/video-metadata-remover",
  "description": "Remove metadata from video files online. Strip EXIF timestamps, GPS location, and camera tags from MP4 and MOV videos before sharing with GROTON.",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "All",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Inspect MP4 and MOV video metadata",
    "Strip GPS location coordinates",
    "Remove creation and modification timestamps",
    "Remove camera, hardware, and encoder tags",
    "In-browser container cleaning with zero re-encoding"
  ]
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
