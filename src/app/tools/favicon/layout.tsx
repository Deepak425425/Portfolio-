import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Favicon Generator – Create .ICO & App Icons | GROTON",
  },
  description: "Convert any logo or image into standard favicon.ico files, Apple touch icons, and responsive web app icon packages for your site with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/favicon",
  },
  openGraph: {
    title: "Free Favicon Generator – Create .ICO & App Icons | GROTON",
    description: "Convert any logo or image into standard favicon.ico files, Apple touch icons, and responsive web app icon packages for your site with GROTON.",
    url: "https://groton.in/tools/favicon",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Favicon Generator – Create .ICO & App Icons | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Favicon Generator – Create .ICO & App Icons | GROTON",
    description: "Convert any logo or image into standard favicon.ico files, Apple touch icons, and responsive web app icon packages for your site with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Favicon Generator",
  "url": "https://groton.in/tools/favicon",
  "description": "Convert any image into a standard favicon.ico, Apple touch icon, and multi-size web app icon package online for free with GROTON.",
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
