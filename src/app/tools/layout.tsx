import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Groton Image Tools — Free Online Image Editors",
  description: "Explore free online image tools by Groton. Resize, crop, compress, convert, add borders, extract colors, apply filters and prepare product images directly in your browser.",
  alternates: {
    canonical: "https://groton.in/tools",
  },
  openGraph: {
    title: "Groton Image Tools — Free Online Image Editors",
    description: "Explore free online image tools by Groton. Resize, crop, compress, convert, add borders, extract colors, apply filters and prepare product images directly in your browser.",
    url: "https://groton.in/tools",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Groton Image Tools — Free Online Image Editors",
      },
      {
        url: "/og-tools.jpg",
        width: 1200,
        height: 630,
        alt: "Groton Image Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Groton Image Tools — Free Online Image Editors",
    description: "Explore free online image tools by Groton. Resize, crop, compress, convert, add borders, extract colors, apply filters and prepare product images directly in your browser.",
    images: ["https://groton.in/og-tools.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
