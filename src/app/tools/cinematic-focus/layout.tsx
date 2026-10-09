import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Cinematic Focus & Depth of Field Photo Editor | GROTON",
  },
  description: "Add cinematic lens focus, depth of field blur, tilt-shift looks, and analog film color grading to photos directly in your browser with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/cinematic-focus",
  },
  openGraph: {
    title: "Free Cinematic Focus & Depth of Field Photo Editor | GROTON",
    description: "Add cinematic lens focus, depth of field blur, tilt-shift looks, and analog film color grading to photos directly in your browser with GROTON.",
    url: "https://groton.in/tools/cinematic-focus",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Cinematic Focus & Depth of Field Photo Editor | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Cinematic Focus & Depth of Field Photo Editor | GROTON",
    description: "Add cinematic lens focus, depth of field blur, tilt-shift looks, and analog film color grading to photos directly in your browser with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Cinematic Focus Engine",
  "url": "https://groton.in/tools/cinematic-focus",
  "description": "Add cinematic lens focus, tilt-shift effects, optical blur, and film color grading to photos online directly in your browser with GROTON.",
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
