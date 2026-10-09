import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Photo Filters & Color Grading Studio Online | GROTON",
  },
  description: "Apply aesthetic photo filters, vintage film looks, LUT presets, and fine-tuned color grading adjustments to images in your browser with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/filters",
  },
  openGraph: {
    title: "Free Photo Filters & Color Grading Studio Online | GROTON",
    description: "Apply aesthetic photo filters, vintage film looks, LUT presets, and fine-tuned color grading adjustments to images in your browser with GROTON.",
    url: "https://groton.in/tools/filters",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Photo Filters & Color Grading Studio Online | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Photo Filters & Color Grading Studio Online | GROTON",
    description: "Apply aesthetic photo filters, vintage film looks, LUT presets, and fine-tuned color grading adjustments to images in your browser with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Filters & Grade",
  "url": "https://groton.in/tools/filters",
  "description": "Apply aesthetic photo filters, vintage film looks, LUTs, and professional color adjustments to images online in your browser with GROTON.",
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
