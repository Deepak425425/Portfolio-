import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Video Compressor Online – Reduce MP4 File Size | GROTON",
  },
  description: "Compress video files directly in your browser without quality loss. Reduce MP4 video size with resolution and bitrate controls using GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/video-compress",
  },
  openGraph: {
    title: "Free Video Compressor Online – Reduce MP4 File Size | GROTON",
    description: "Compress video files directly in your browser without quality loss. Reduce MP4 video size with resolution and bitrate controls using GROTON.",
    url: "https://groton.in/tools/video-compress",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Video Compressor Online – Reduce MP4 File Size | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video Compressor Online – Reduce MP4 File Size | GROTON",
    description: "Compress video files directly in your browser without quality loss. Reduce MP4 video size with resolution and bitrate controls using GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Video Compressor",
  "url": "https://groton.in/tools/video-compress",
  "description": "Compress video files directly in your browser without quality loss. Reduce MP4 video size with resolution and bitrate controls using GROTON.",
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
