import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Free Online Image Tools & Creative Utilities | GROTON",
  },
  description: "Explore free online image and media editing tools. Resize, compress, convert, crop, and enhance photos directly in your browser with GROTON.",
  alternates: {
    canonical: "https://groton.in/tools",
  },
  openGraph: {
    title: "Free Online Image Tools & Creative Utilities | GROTON",
    description: "Explore free online image and media editing tools. Resize, compress, convert, crop, and enhance photos directly in your browser with GROTON.",
    url: "https://groton.in/tools",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "Free Online Image Tools & Creative Utilities | GROTON",
      },
      {
        url: "/og-tools-v2.jpg",
        width: 1200,
        height: 630,
        alt: "GROTON Image Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Image Tools & Creative Utilities | GROTON",
    description: "Explore free online image and media editing tools. Resize, compress, convert, crop, and enhance photos directly in your browser with GROTON.",
    images: ["https://groton.in/og-tools-v2.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}


