import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Collage Maker Online – Photo Grid Layouts | GROTON",
  },
  description: "Combine multiple photos into beautiful grid collages online for free. Customizable spacing, aspect ratios, and high-resolution export with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/collage",
  },
  openGraph: {
    title: "Free Collage Maker Online – Photo Grid Layouts | GROTON",
    description: "Combine multiple photos into beautiful grid collages online for free. Customizable spacing, aspect ratios, and high-resolution export with GROTON.",
    url: "https://groton.in/tools/collage",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Collage Maker Online – Photo Grid Layouts | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Collage Maker Online – Photo Grid Layouts | GROTON",
    description: "Combine multiple photos into beautiful grid collages online for free. Customizable spacing, aspect ratios, and high-resolution export with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Collage Maker",
  "url": "https://groton.in/tools/collage",
  "description": "Combine multiple photos into beautiful grid collages online for free. Customizable spacing, aspect ratios, and high-resolution export with GROTON.",
  "applicationCategory": "DesignApplication",
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
