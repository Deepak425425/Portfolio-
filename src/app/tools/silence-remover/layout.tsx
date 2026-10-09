import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Silence Remover Online – Cut Pauses from Audio | GROTON",
  },
  description: "Automatically detect and remove dead air, silent gaps, and pauses from voice recordings, podcasts, and audio files in your browser with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/silence-remover",
  },
  openGraph: {
    title: "Free Silence Remover Online – Cut Pauses from Audio | GROTON",
    description: "Automatically detect and remove dead air, silent gaps, and pauses from voice recordings, podcasts, and audio files in your browser with GROTON.",
    url: "https://groton.in/tools/silence-remover",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Free Silence Remover Online – Cut Pauses from Audio | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Silence Remover Online – Cut Pauses from Audio | GROTON",
    description: "Automatically detect and remove dead air, silent gaps, and pauses from voice recordings, podcasts, and audio files in your browser with GROTON.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Silence Remover",
  "url": "https://groton.in/tools/silence-remover",
  "description": "Automatically detect and remove dead air and silent pauses from voice recordings and audio files in your browser with GROTON.",
  "applicationCategory": "MultimediaApplication",
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
