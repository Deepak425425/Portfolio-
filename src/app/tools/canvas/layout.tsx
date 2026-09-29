import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Canvas Resizer — Add Padding & Margins Online",
  description: "Expand the canvas of your image, add colored padding, margins, or transparent space without cropping. Prepare images for Instagram and e-commerce.",
  alternates: {
    canonical: "/tools/canvas",
  },
  openGraph: {
    title: "Image Canvas Resizer — Add Padding & Margins Online",
    description: "Expand the canvas of your image, add colored padding, margins, or transparent space without cropping. Prepare images for Instagram and e-commerce.",
    url: "https://groton.in/tools/canvas",
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
    title: "Image Canvas Resizer — Add Padding & Margins Online",
    description: "Expand the canvas of your image, add colored padding, margins, or transparent space without cropping. Prepare images for Instagram and e-commerce.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
