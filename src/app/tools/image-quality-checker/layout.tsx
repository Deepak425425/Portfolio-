import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Quality Checker — Analyze Resolution & DPI",
  description: "Analyze images for print and web suitability. Check resolution, DPI, dimensions, and compression artifacts with Groton's free online image tool.",
  alternates: {
    canonical: "/tools/image-quality-checker",
  },
  openGraph: {
    title: "Image Quality Checker — Analyze Resolution & DPI",
    description: "Analyze images for print and web suitability. Check resolution, DPI, dimensions, and compression artifacts with Groton's free online image tool.",
    url: "https://groton.in/tools/image-quality-checker",
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
    title: "Image Quality Checker — Analyze Resolution & DPI",
    description: "Analyze images for print and web suitability. Check resolution, DPI, dimensions, and compression artifacts with Groton's free online image tool.",
    images: ["https://groton.in/og-tools.jpg"],
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
