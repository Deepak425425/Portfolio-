import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Watermark Remover Online – Remove Photo Stamps | GROTON",
  },
  description: "Remove watermarks, logos, date stamps, and unwanted markings from photos using content-aware inpainting directly in your browser with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/watermark-remover",
  },
  openGraph: {
    title: "Free Watermark Remover Online – Remove Photo Stamps | GROTON",
    description: "Remove watermarks, logos, date stamps, and unwanted markings from photos using content-aware inpainting directly in your browser with GROTON.",
    url: "https://groton.in/tools/watermark-remover",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Watermark Remover Online – Remove Photo Stamps | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Watermark Remover Online – Remove Photo Stamps | GROTON",
    description: "Remove watermarks, logos, date stamps, and unwanted markings from photos using content-aware inpainting directly in your browser with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Watermark Remover",
  "url": "https://groton.in/tools/watermark-remover",
  "description": "Remove watermarks, logos, stamps, and unwanted markings from photos using content-aware browser-side processing with GROTON.",
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
