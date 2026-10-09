import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Video to GIF Maker Online – Make Animated GIFs | GROTON",
  },
  description: "Convert video clips to high-quality animated GIFs directly in your browser. Trim scenes, adjust framerate, and customize loop speed with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/video-to-gif",
  },
  openGraph: {
    title: "Free Video to GIF Maker Online – Make Animated GIFs | GROTON",
    description: "Convert video clips to high-quality animated GIFs directly in your browser. Trim scenes, adjust framerate, and customize loop speed with GROTON.",
    url: "https://groton.in/tools/video-to-gif",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Video to GIF Maker Online – Make Animated GIFs | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video to GIF Maker Online – Make Animated GIFs | GROTON",
    description: "Convert video clips to high-quality animated GIFs directly in your browser. Trim scenes, adjust framerate, and customize loop speed with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Video to GIF Maker",
  "url": "https://groton.in/tools/video-to-gif",
  "description": "Convert video clips to high-quality animated GIFs online. Trim clips and customize framerate, resolution, and speed with GROTON.",
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
