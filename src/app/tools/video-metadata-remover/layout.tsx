import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Video Metadata Remover – Remove MP4 EXIF & GPS | GROTON",
  },
  description: "Remove metadata and tags from video files online. Strip EXIF timestamps, GPS location, and camera information from MP4 and MOV videos with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/video-metadata-remover",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Free Video Metadata Remover – Remove MP4 EXIF & GPS | GROTON",
    description: "Remove metadata and tags from video files online. Strip EXIF timestamps, GPS location, and camera information from MP4 and MOV videos with GROTON.",
    url: "https://groton.in/tools/video-metadata-remover",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Video Metadata Remover – Remove MP4 EXIF & GPS | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video Metadata Remover – Remove MP4 EXIF & GPS | GROTON",
    description: "Remove metadata and tags from video files online. Strip EXIF timestamps, GPS location, and camera information from MP4 and MOV videos with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Video Metadata Remover",
  "url": "https://groton.in/tools/video-metadata-remover",
  "description": "Remove metadata and tags from video files online. Strip EXIF timestamps, GPS location, and camera information from MP4 and MOV videos with GROTON.",
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
    "Remove metadata and container tags from video",
    "Strip GPS location coordinates and geotags",
    "Erase creation timestamps and camera information",
    "In-browser video metadata cleaner with zero re-encoding",
    "Lossless export without adding watermarks"
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
