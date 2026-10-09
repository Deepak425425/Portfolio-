import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Image Upscaler Online – Increase Resolution | GROTON",
  },
  description: "Upscale and enhance image resolution without losing sharpness. Improve low-resolution product photos and graphics directly in your browser with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/image-upscaler",
  },
  openGraph: {
    title: "Free Image Upscaler Online – Increase Resolution | GROTON",
    description: "Upscale and enhance image resolution without losing sharpness. Improve low-resolution product photos and graphics directly in your browser with GROTON.",
    url: "https://groton.in/tools/image-upscaler",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Image Upscaler Online – Increase Resolution | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Upscaler Online – Increase Resolution | GROTON",
    description: "Upscale and enhance image resolution without losing sharpness. Improve low-resolution product photos and graphics directly in your browser with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Image Upscaler",
  "url": "https://groton.in/tools/image-upscaler",
  "description": "Upscale and enhance image resolution without losing sharpness. Improve low-resolution product photos and graphics online with GROTON.",
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
