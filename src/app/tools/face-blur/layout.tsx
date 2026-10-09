import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Face Blur Tool Online – Anonymize Photos Fast | GROTON",
  },
  description: "Detect and blur faces in photos automatically or manually censor sensitive visual details for privacy directly in your browser with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/face-blur",
  },
  openGraph: {
    title: "Free Face Blur Tool Online – Anonymize Photos Fast | GROTON",
    description: "Detect and blur faces in photos automatically or manually censor sensitive visual details for privacy directly in your browser with GROTON.",
    url: "https://groton.in/tools/face-blur",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Face Blur Tool Online – Anonymize Photos Fast | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Face Blur Tool Online – Anonymize Photos Fast | GROTON",
    description: "Detect and blur faces in photos automatically or manually censor sensitive visual details for privacy directly in your browser with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Face Blur Tool",
  "url": "https://groton.in/tools/face-blur",
  "description": "Automatically detect and blur faces in photos or manually censor sensitive information for privacy directly in your browser with GROTON.",
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
