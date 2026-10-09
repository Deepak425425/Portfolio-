import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Cleanup Tool – Remove Unwanted Objects | GROTON",
  },
  description: "Erase unwanted objects, dust, blemishes, and text from photos online. Fast, private browser-side photo retouching and object cleanup with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/image-cleanup",
  },
  openGraph: {
    title: "Free Image Cleanup Tool – Remove Unwanted Objects | GROTON",
    description: "Erase unwanted objects, dust, blemishes, and text from photos online. Fast, private browser-side photo retouching and object cleanup with GROTON.",
    url: "https://groton.in/tools/image-cleanup",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Cleanup Tool – Remove Unwanted Objects | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Cleanup Tool – Remove Unwanted Objects | GROTON",
    description: "Erase unwanted objects, dust, blemishes, and text from photos online. Fast, private browser-side photo retouching and object cleanup with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Cleanup Tool",
  "url": "https://groton.in/tools/image-cleanup",
  "description": "Erase unwanted objects, dust, blemishes, and text from photos online. Fast, private browser-side image retouching and cleanup with GROTON.",
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
