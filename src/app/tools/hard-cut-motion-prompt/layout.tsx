import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Hard Cut Motion Prompt – Video Shot Sheet Generator | GROTON",
  },
  description: "Split video footage into scene cuts and export 6-frame motion reference contact sheets for video-to-video AI animation prompts with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/hard-cut-motion-prompt",
  },
  openGraph: {
    title: "Hard Cut Motion Prompt – Video Shot Sheet Generator | GROTON",
    description: "Split video footage into scene cuts and export 6-frame motion reference contact sheets for video-to-video AI animation prompts with GROTON.",
    url: "https://groton.in/tools/hard-cut-motion-prompt",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Hard Cut Motion Prompt – Video Shot Sheet Generator | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hard Cut Motion Prompt – Video Shot Sheet Generator | GROTON",
    description: "Split video footage into scene cuts and export 6-frame motion reference contact sheets for video-to-video AI animation prompts with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Hard Cut Motion Prompt",
  "url": "https://groton.in/tools/hard-cut-motion-prompt",
  "description": "Split video footage into scene cuts and export 6-frame motion reference sheets for video-to-video AI animation prompts with GROTON.",
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
