import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Splitter Online – Cut Photos into Pieces | GROTON",
  },
  description: "Split images into multiple equal vertical or horizontal slices for social media carousel posts, panoramas, and multi-part feeds with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/split",
  },
  openGraph: {
    title: "Free Image Splitter Online – Cut Photos into Pieces | GROTON",
    description: "Split images into multiple equal vertical or horizontal slices for social media carousel posts, panoramas, and multi-part feeds with GROTON.",
    url: "https://groton.in/tools/split",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Splitter Online – Cut Photos into Pieces | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Splitter Online – Cut Photos into Pieces | GROTON",
    description: "Split images into multiple equal vertical or horizontal slices for social media carousel posts, panoramas, and multi-part feeds with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Splitter",
  "url": "https://groton.in/tools/split",
  "description": "Split images into multiple equal vertical or horizontal parts online for carousel posts, panoramas, and social media with GROTON.",
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
