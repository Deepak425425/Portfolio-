import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Splitter — Divide Photos Online",
  description: "Split an image into multiple equal pieces horizontally or vertically. Perfect for panoramas and grid posts on social media.",
  alternates: {
    canonical: "/tools/split",
  },
  openGraph: {
    title: "Image Splitter — Divide Photos Online",
    description: "Split an image into multiple equal pieces horizontally or vertically. Perfect for panoramas and grid posts on social media.",
    url: "https://groton.in/tools/split",
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
    title: "Image Splitter — Divide Photos Online",
    description: "Split an image into multiple equal pieces horizontally or vertically. Perfect for panoramas and grid posts on social media.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
