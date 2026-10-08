import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Grid Cutter — Slice Photos for Instagram",
  description: "Cut and slice a single image into multiple seamless grid tiles for Instagram and social media layouts. Free online image splitter.",
  alternates: {
    canonical: "/tools/grid-cutter",
  },
  openGraph: {
    title: "Image Grid Cutter — Slice Photos for Instagram",
    description: "Cut and slice a single image into multiple seamless grid tiles for Instagram and social media layouts. Free online image splitter.",
    url: "https://groton.in/tools/grid-cutter",
    siteName: "GROTON AI",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Grid Cutter — Slice Photos for Instagram",
    description: "Cut and slice a single image into multiple seamless grid tiles for Instagram and social media layouts. Free online image splitter.",
    images: ["https://groton.in/og-tools.jpg"],
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
