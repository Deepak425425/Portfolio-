import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free HEX to Color Converter – RGB & HSL Color Tool | GROTON",
  },
  description: "Convert HEX color codes to RGB and HSL values instantly with real-time preview, synchronized color picker, and one-click copying with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/hex-to-color",
  },
  openGraph: {
    title: "Free HEX to Color Converter – RGB & HSL Color Tool | GROTON",
    description: "Convert HEX color codes to RGB and HSL values instantly with real-time preview, synchronized color picker, and one-click copying with GROTON.",
    url: "https://groton.in/tools/hex-to-color",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free HEX to Color Converter – RGB & HSL Color Tool | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free HEX to Color Converter – RGB & HSL Color Tool | GROTON",
    description: "Convert HEX color codes to RGB and HSL values instantly with real-time preview, synchronized color picker, and one-click copying with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "HEX to Color Converter",
  "url": "https://groton.in/tools/hex-to-color",
  "description": "Convert HEX color codes to RGB and HSL values instantly with real-time preview, synchronized color picker, and one-click copying with GROTON.",
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
