import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Bulk Image Renamer – Rename Photos Online | GROTON",
  },
  description: "Rename multiple images at once with custom patterns, sequential numbering, and find-and-replace rules. Fast, private batch photo renaming with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/bulk-image-renamer",
  },
  openGraph: {
    title: "Free Bulk Image Renamer – Rename Photos Online | GROTON",
    description: "Rename multiple images at once with custom patterns, sequential numbering, and find-and-replace rules. Fast, private batch photo renaming with GROTON.",
    url: "https://groton.in/tools/bulk-image-renamer",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Bulk Image Renamer – Rename Photos Online | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Bulk Image Renamer – Rename Photos Online | GROTON",
    description: "Rename multiple images at once with custom patterns, sequential numbering, and find-and-replace rules. Fast, private batch photo renaming with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Bulk Image Renamer",
  "url": "https://groton.in/tools/bulk-image-renamer",
  "description": "Rename multiple images at once with custom patterns, sequential numbering, and find-and-replace rules. Fast batch photo renaming by GROTON.",
  "applicationCategory": "UtilitiesApplication",
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
