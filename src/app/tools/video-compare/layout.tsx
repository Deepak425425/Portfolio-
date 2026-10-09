import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Video Comparison Tool – Side-by-Side & Slider | GROTON",
  },
  description: "Compare two video files side by side or with interactive split-screen sliders and synchronized playback directly in your browser with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/video-compare",
  },
  openGraph: {
    title: "Free Video Comparison Tool – Side-by-Side & Slider | GROTON",
    description: "Compare two video files side by side or with interactive split-screen sliders and synchronized playback directly in your browser with GROTON.",
    url: "https://groton.in/tools/video-compare",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Video Comparison Tool – Side-by-Side & Slider | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video Comparison Tool – Side-by-Side & Slider | GROTON",
    description: "Compare two video files side by side or with interactive split-screen sliders and synchronized playback directly in your browser with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Video Comparison Tool",
  "url": "https://groton.in/tools/video-compare",
  "description": "Visually compare two video files side-by-side or with interactive split-screen sliders and synchronized playback online with GROTON.",
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
