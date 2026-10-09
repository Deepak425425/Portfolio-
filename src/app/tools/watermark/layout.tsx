import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Watermark Creator – Add Text & Logo Watermarks | GROTON",
  },
  description: "Protect images with custom repeating text, tiled stamps, or logo watermarks online. Adjust opacity, angle, and density in batch mode with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/watermark",
  },
  openGraph: {
    title: "Free Watermark Creator – Add Text & Logo Watermarks | GROTON",
    description: "Protect images with custom repeating text, tiled stamps, or logo watermarks online. Adjust opacity, angle, and density in batch mode with GROTON.",
    url: "https://groton.in/tools/watermark",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Watermark Creator – Add Text & Logo Watermarks | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Watermark Creator – Add Text & Logo Watermarks | GROTON",
    description: "Protect images with custom repeating text, tiled stamps, or logo watermarks online. Adjust opacity, angle, and density in batch mode with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Watermark Creator",
  "url": "https://groton.in/tools/watermark",
  "description": "Protect images with custom repeating text or logo watermarks online. Adjust opacity, angle, and density in batch with GROTON.",
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
