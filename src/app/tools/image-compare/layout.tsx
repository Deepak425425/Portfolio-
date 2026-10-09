import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Comparison Tool – Side-by-Side & Slider | GROTON",
  },
  description: "Compare two images visually with interactive split sliders, side-by-side inspection, and difference highlighting online for free with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/image-compare",
  },
  openGraph: {
    title: "Free Image Comparison Tool – Side-by-Side & Slider | GROTON",
    description: "Compare two images visually with interactive split sliders, side-by-side inspection, and difference highlighting online for free with GROTON.",
    url: "https://groton.in/tools/image-compare",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Comparison Tool – Side-by-Side & Slider | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Comparison Tool – Side-by-Side & Slider | GROTON",
    description: "Compare two images visually with interactive split sliders, side-by-side inspection, and difference highlighting online for free with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Compare",
  "url": "https://groton.in/tools/image-compare",
  "description": "Visually compare two images with interactive sliders, side-by-side view, and difference highlighting online for free with GROTON.",
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
