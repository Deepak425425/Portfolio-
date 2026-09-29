import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Compressor — Reduce File Size Online",
  description: "Compress JPG, PNG, and WebP images online without losing visible quality. Optimize web performance and reduce file sizes easily with Groton.",
  alternates: {
    canonical: "/tools/compressor",
  },
  openGraph: {
    title: "Image Compressor — Reduce File Size Online",
    description: "Compress JPG, PNG, and WebP images online without losing visible quality. Optimize web performance and reduce file sizes easily with Groton.",
    url: "https://groton.in/tools/compressor",
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
    title: "Image Compressor — Reduce File Size Online",
    description: "Compress JPG, PNG, and WebP images online without losing visible quality. Optimize web performance and reduce file sizes easily with Groton.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
