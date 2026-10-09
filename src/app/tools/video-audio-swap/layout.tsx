import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Video Audio Swap Online – Replace Video Audio | GROTON",
  },
  description: "Replace, mute, or mix audio tracks and background music in video clips directly in your browser without uploading files to servers with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/video-audio-swap",
  },
  openGraph: {
    title: "Free Video Audio Swap Online – Replace Video Audio | GROTON",
    description: "Replace, mute, or mix audio tracks and background music in video clips directly in your browser without uploading files to servers with GROTON.",
    url: "https://groton.in/tools/video-audio-swap",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Video Audio Swap Online – Replace Video Audio | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video Audio Swap Online – Replace Video Audio | GROTON",
    description: "Replace, mute, or mix audio tracks and background music in video clips directly in your browser without uploading files to servers with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Video Audio Swap",
  "url": "https://groton.in/tools/video-audio-swap",
  "description": "Replace, mute, or mix audio and background music into video clips directly in your browser without uploading files to servers with GROTON.",
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
