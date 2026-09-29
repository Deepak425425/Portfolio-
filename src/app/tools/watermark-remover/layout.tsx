import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark Remover — Content-Aware Object Removal",
  description: "Remove unwanted marks, objects, text and watermarks from images using intelligent browser-side inpainting by Groton AI.",
  alternates: {
    canonical: "/tools/watermark-remover",
  },
  openGraph: {
    title: "Watermark Remover — Content-Aware Object Removal",
    description: "Remove unwanted marks, objects, text and watermarks from images using intelligent browser-side inpainting by Groton AI.",
    url: "https://groton.in/tools/watermark-remover",
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
    title: "Watermark Remover — Content-Aware Object Removal",
    description: "Remove unwanted marks, objects, text and watermarks from images using intelligent browser-side inpainting by Groton AI.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
