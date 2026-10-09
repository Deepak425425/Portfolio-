import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Background Remover Online – Isolate Subjects | GROTON",
  },
  description: "Remove backgrounds from images online for free. Isolate subjects, create clean transparent PNGs, and prepare professional product cutouts with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/background-remover",
  },
  openGraph: {
    title: "Free Background Remover Online – Isolate Subjects | GROTON",
    description: "Remove backgrounds from images online for free. Isolate subjects, create clean transparent PNGs, and prepare professional product cutouts with GROTON.",
    url: "https://groton.in/tools/background-remover",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Background Remover Online – Isolate Subjects | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Background Remover Online – Isolate Subjects | GROTON",
    description: "Remove backgrounds from images online for free. Isolate subjects, create clean transparent PNGs, and prepare professional product cutouts with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Background Remover",
  "url": "https://groton.in/tools/background-remover",
  "description": "Remove backgrounds from images online for free. Isolate subjects, generate clean transparent PNGs, and prepare product photos with GROTON.",
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
