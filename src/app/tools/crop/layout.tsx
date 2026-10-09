import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Cropper Online – Crop Photos Precisely | GROTON",
  },
  description: "Crop images online with preset aspect ratios, custom pixel dimensions, and freeform framing. Fast, high-resolution photo cropping with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/crop",
  },
  openGraph: {
    title: "Free Image Cropper Online – Crop Photos Precisely | GROTON",
    description: "Crop images online with preset aspect ratios, custom pixel dimensions, and freeform framing. Fast, high-resolution photo cropping with GROTON.",
    url: "https://groton.in/tools/crop",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Cropper Online – Crop Photos Precisely | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Cropper Online – Crop Photos Precisely | GROTON",
    description: "Crop images online with preset aspect ratios, custom pixel dimensions, and freeform framing. Fast, high-resolution photo cropping with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Cropper",
  "url": "https://groton.in/tools/crop",
  "description": "Crop images online with preset aspect ratios, custom pixel dimensions, and freeform framing. Fast, high-resolution photo cropping with GROTON.",
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
