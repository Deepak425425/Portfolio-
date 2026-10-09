import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Rounded Image Tool – Add Curved Photo Corners | GROTON",
  },
  description: "Add smooth transparent rounded corners to photos online. Customize corner radius and export circular or rounded-corner PNG images with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/rounded-image",
  },
  openGraph: {
    title: "Free Rounded Image Tool – Add Curved Photo Corners | GROTON",
    description: "Add smooth transparent rounded corners to photos online. Customize corner radius and export circular or rounded-corner PNG images with GROTON.",
    url: "https://groton.in/tools/rounded-image",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Rounded Image Tool – Add Curved Photo Corners | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Rounded Image Tool – Add Curved Photo Corners | GROTON",
    description: "Add smooth transparent rounded corners to photos online. Customize corner radius and export circular or rounded-corner PNG images with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Rounded Image Tool",
  "url": "https://groton.in/tools/rounded-image",
  "description": "Add transparent rounded corners to photos online. Adjust corner radius and export smooth rounded PNG images with GROTON.",
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
