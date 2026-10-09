import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Color Palette Generator – Extract Image Colors | GROTON",
  },
  description: "Extract dominant color palettes and HEX codes from any photo online. Generate cohesive color schemes and export custom swatches with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/color-palette",
  },
  openGraph: {
    title: "Free Color Palette Generator – Extract Image Colors | GROTON",
    description: "Extract dominant color palettes and HEX codes from any photo online. Generate cohesive color schemes and export custom swatches with GROTON.",
    url: "https://groton.in/tools/color-palette",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Color Palette Generator – Extract Image Colors | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Color Palette Generator – Extract Image Colors | GROTON",
    description: "Extract dominant color palettes and HEX codes from any photo online. Generate cohesive color schemes and export custom swatches with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Color Palette Generator",
  "url": "https://groton.in/tools/color-palette",
  "description": "Extract dominant color palettes and HEX codes from any photo online. Generate aesthetic mood boards and export color swatches with GROTON.",
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
