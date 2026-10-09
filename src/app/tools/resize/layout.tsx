import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Resizer Online – Scale Photos Precisely | GROTON",
  },
  description: "Resize images online with exact pixel dimensions, percentage scaling, and aspect ratio lock. Fast photo resizing for web and social media by GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/resize",
  },
  openGraph: {
    title: "Free Image Resizer Online – Scale Photos Precisely | GROTON",
    description: "Resize images online with exact pixel dimensions, percentage scaling, and aspect ratio lock. Fast photo resizing for web and social media by GROTON.",
    url: "https://groton.in/tools/resize",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Resizer Online – Scale Photos Precisely | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Resizer Online – Scale Photos Precisely | GROTON",
    description: "Resize images online with exact pixel dimensions, percentage scaling, and aspect ratio lock. Fast photo resizing for web and social media by GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Resizer",
  "url": "https://groton.in/tools/resize",
  "description": "Resize images online with exact pixel dimensions, percentage scaling, and aspect ratio lock. Fast photo resizing for web and social media by GROTON.",
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
