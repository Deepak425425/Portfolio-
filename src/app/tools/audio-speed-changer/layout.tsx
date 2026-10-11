import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Audio Speed Changer Online - Keep Original Pitch | GROTON",
  },
  description:
    "Speed up or slow down audio online without changing pitch. Set custom speeds or target durations with real-time in-browser pitch-preserving time stretching. 100% private & free.",
  alternates: {
    canonical: "https://groton.in/tools/audio-speed-changer",
  },
  openGraph: {
    title: "Free Audio Speed Changer Online - Keep Original Pitch | GROTON",
    description:
      "Speed up or slow down audio online without changing pitch. Set custom speeds or target durations with real-time in-browser pitch-preserving time stretching.",
    url: "https://groton.in/tools/audio-speed-changer",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Audio Speed Changer Online - Keep Original Pitch | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Audio Speed Changer Online - Keep Original Pitch | GROTON",
    description:
      "Speed up or slow down audio online without changing pitch. Set custom speeds or target durations with real-time in-browser pitch-preserving time stretching.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Audio Speed Changer",
  url: "https://groton.in/tools/audio-speed-changer",
  description:
    "Change audio playback speed or match target duration without altering pitch using browser-based DSP time stretching. Supports MP3, WAV, M4A, AAC, FLAC, and OGG.",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript. Requires HTML5 Audio.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function AudioSpeedChangerLayout({ children }: { children: React.ReactNode }) {
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
