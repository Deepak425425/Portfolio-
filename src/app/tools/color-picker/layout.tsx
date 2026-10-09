import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Color Picker – Sample HEX & RGB Colors | GROTON",
  },
  description: "Sample exact pixel colors from any image with an interactive eyedropper tool. Inspect and copy HEX, RGB, and HSL values instantly with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/color-picker",
  },
  openGraph: {
    title: "Free Image Color Picker – Sample HEX & RGB Colors | GROTON",
    description: "Sample exact pixel colors from any image with an interactive eyedropper tool. Inspect and copy HEX, RGB, and HSL values instantly with GROTON.",
    url: "https://groton.in/tools/color-picker",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Color Picker – Sample HEX & RGB Colors | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Color Picker – Sample HEX & RGB Colors | GROTON",
    description: "Sample exact pixel colors from any image with an interactive eyedropper tool. Inspect and copy HEX, RGB, and HSL values instantly with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Color Picker",
  "url": "https://groton.in/tools/color-picker",
  "description": "Upload any photo and click anywhere to sample exact pixel colors. Copy HEX, RGB, and HSL values instantly with GROTON's online color picker.",
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
