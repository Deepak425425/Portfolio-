import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Before and After Image Comparison Slider | GROTON",
  },
  description: "Create interactive before and after image comparison sliders online. Compare retouching, edits, and visual transformations side by side with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/before-after",
  },
  openGraph: {
    title: "Free Before and After Image Comparison Slider | GROTON",
    description: "Create interactive before and after image comparison sliders online. Compare retouching, edits, and visual transformations side by side with GROTON.",
    url: "https://groton.in/tools/before-after",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Before and After Image Comparison Slider | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Before and After Image Comparison Slider | GROTON",
    description: "Create interactive before and after image comparison sliders online. Compare retouching, edits, and visual transformations side by side with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Before & After Comparison Slider",
  "url": "https://groton.in/tools/before-after",
  "description": "Create interactive before and after image comparison sliders online. Compare retouching, edits, and visual transformations side by side with GROTON.",
  "applicationCategory": "MultimediaApplication",
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
