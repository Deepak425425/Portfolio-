import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Converter — Change Format to JPG, PNG, WebP",
  description: "Convert images between JPG, PNG, WebP, and other formats instantly in your browser. Free online image converter by Groton AI.",
  alternates: {
    canonical: "/tools/convert",
  },
  openGraph: {
    title: "Image Converter — Change Format to JPG, PNG, WebP",
    description: "Convert images between JPG, PNG, WebP, and other formats instantly in your browser. Free online image converter by Groton AI.",
    url: "https://groton.in/tools/convert",
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
    title: "Image Converter — Change Format to JPG, PNG, WebP",
    description: "Convert images between JPG, PNG, WebP, and other formats instantly in your browser. Free online image converter by Groton AI.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
