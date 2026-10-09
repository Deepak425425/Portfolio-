import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Blur Tool Online – Gaussian Photo Blur | GROTON",
  },
  description: "Apply smooth gaussian blur or obscure sensitive details in photos directly in your browser. Fast, private image blurring with adjustable radius at GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/blur",
  },
  openGraph: {
    title: "Free Image Blur Tool Online – Gaussian Photo Blur | GROTON",
    description: "Apply smooth gaussian blur or obscure sensitive details in photos directly in your browser. Fast, private image blurring with adjustable radius at GROTON.",
    url: "https://groton.in/tools/blur",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Blur Tool Online – Gaussian Photo Blur | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Blur Tool Online – Gaussian Photo Blur | GROTON",
    description: "Apply smooth gaussian blur or obscure sensitive details in photos directly in your browser. Fast, private image blurring with adjustable radius at GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Blur Tool",
  "url": "https://groton.in/tools/blur",
  "description": "Apply smooth gaussian blur or obscure sensitive details in photos online. Fast, browser-based image blurring with GROTON.",
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
