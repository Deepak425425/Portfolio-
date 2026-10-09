import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Canvas Resizer – Add Border & Padding | GROTON",
  },
  description: "Expand image canvas size and add custom borders, colored margins, or framing padding without cropping your original photo online with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/canvas",
  },
  openGraph: {
    title: "Free Image Canvas Resizer – Add Border & Padding | GROTON",
    description: "Expand image canvas size and add custom borders, colored margins, or framing padding without cropping your original photo online with GROTON.",
    url: "https://groton.in/tools/canvas",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Canvas Resizer – Add Border & Padding | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Canvas Resizer – Add Border & Padding | GROTON",
    description: "Expand image canvas size and add custom borders, colored margins, or framing padding without cropping your original photo online with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Canvas Resizer",
  "url": "https://groton.in/tools/canvas",
  "description": "Expand image canvas size and add custom padding, borders, or background margins without cropping your photo online with GROTON.",
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
