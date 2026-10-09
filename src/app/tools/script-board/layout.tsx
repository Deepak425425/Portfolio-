import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Script Board – Visual Storyboard Planner | GROTON",
  },
  description: "Organize visual scripts, attach scene reference images, structure creative prompts, and plan video production shot lists online with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools/script-board",
  },
  openGraph: {
    title: "Free Script Board – Visual Storyboard Planner | GROTON",
    description: "Organize visual scripts, attach scene reference images, structure creative prompts, and plan video production shot lists online with GROTON.",
    url: "https://groton.in/tools/script-board",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Script Board – Visual Storyboard Planner | GROTON",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Script Board – Visual Storyboard Planner | GROTON",
    description: "Organize visual scripts, attach scene reference images, structure creative prompts, and plan video production shot lists online with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Script Board",
  "url": "https://groton.in/tools/script-board",
  "description": "Organize visual scripts, attach scene images, and plan video production shot lists online with GROTON's interactive Script Board.",
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
