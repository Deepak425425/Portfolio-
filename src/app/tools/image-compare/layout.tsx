import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Comparison Tool — Compare Two Images Online",
  description: "Visually compare two images with interactive sliders, side-by-side views, and difference highlighting. The best before after image comparison tool.",
  alternates: {
    canonical: "/tools/image-compare",
  },
  openGraph: {
    title: "Image Comparison Tool — Compare Two Images Online",
    description: "Visually compare two images with interactive sliders, side-by-side views, and difference highlighting. The best before after image comparison tool.",
    url: "https://groton.in/tools/image-compare",
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
    title: "Image Comparison Tool — Compare Two Images Online",
    description: "Visually compare two images with interactive sliders, side-by-side views, and difference highlighting. The best before after image comparison tool.",
    images: ["https://groton.in/og-tools.jpg"],
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
