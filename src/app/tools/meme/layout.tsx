import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Meme Generator Online – Add Top & Bottom Text | GROTON",
  },
  description: "Create custom memes online in seconds. Add classic impact captions, customizable typography, and graphic stickers to any photo with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/meme",
  },
  openGraph: {
    title: "Free Meme Generator Online – Add Top & Bottom Text | GROTON",
    description: "Create custom memes online in seconds. Add classic impact captions, customizable typography, and graphic stickers to any photo with GROTON.",
    url: "https://groton.in/tools/meme",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Meme Generator Online – Add Top & Bottom Text | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Meme Generator Online – Add Top & Bottom Text | GROTON",
    description: "Create custom memes online in seconds. Add classic impact captions, customizable typography, and graphic stickers to any photo with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Meme Generator",
  "url": "https://groton.in/tools/meme",
  "description": "Create custom memes online in seconds. Add impact captions, custom text styling, and stickers to any image for free with GROTON.",
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
