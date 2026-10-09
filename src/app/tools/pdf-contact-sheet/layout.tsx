import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free PDF Contact Sheet Generator – Photo Layouts | GROTON",
  },
  description: "Generate printable multi-image PDF contact sheets and photo proofs online. Customize grid rows, columns, margins, and paper sizes with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/pdf-contact-sheet",
  },
  openGraph: {
    title: "Free PDF Contact Sheet Generator – Photo Layouts | GROTON",
    description: "Generate printable multi-image PDF contact sheets and photo proofs online. Customize grid rows, columns, margins, and paper sizes with GROTON.",
    url: "https://groton.in/tools/pdf-contact-sheet",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free PDF Contact Sheet Generator – Photo Layouts | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free PDF Contact Sheet Generator – Photo Layouts | GROTON",
    description: "Generate printable multi-image PDF contact sheets and photo proofs online. Customize grid rows, columns, margins, and paper sizes with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "PDF Contact Sheet Generator",
  "url": "https://groton.in/tools/pdf-contact-sheet",
  "description": "Generate printable multi-image PDF contact sheets and photo proofs online. Customize grid rows, columns, and margins easily with GROTON.",
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
