import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Pixelator – Censor Photos & Pixel Art | GROTON",
  },
  description: "Pixelate sensitive details in photos or turn pictures into retro 8-bit pixel art with adjustable block sizes directly in your browser with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/pixelate",
  },
  openGraph: {
    title: "Free Image Pixelator – Censor Photos & Pixel Art | GROTON",
    description: "Pixelate sensitive details in photos or turn pictures into retro 8-bit pixel art with adjustable block sizes directly in your browser with GROTON.",
    url: "https://groton.in/tools/pixelate",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Pixelator – Censor Photos & Pixel Art | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Pixelator – Censor Photos & Pixel Art | GROTON",
    description: "Pixelate sensitive details in photos or turn pictures into retro 8-bit pixel art with adjustable block sizes directly in your browser with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Pixelator",
  "url": "https://groton.in/tools/pixelate",
  "description": "Pixelate sensitive details in photos or turn images into retro 8-bit pixel art online directly in your browser with GROTON.",
  "applicationCategory": "PhotoEditor",
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
