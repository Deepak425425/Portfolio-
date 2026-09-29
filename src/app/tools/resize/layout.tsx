import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Resizer — Change Image Dimensions Online",
  description: "Resize images online with precise pixel dimensions, percentage scaling, and aspect ratio locks. Perfect for e-commerce and social media.",
  alternates: {
    canonical: "/tools/resize",
  },
  openGraph: {
    title: "Image Resizer — Change Image Dimensions Online",
    description: "Resize images online with precise pixel dimensions, percentage scaling, and aspect ratio locks. Perfect for e-commerce and social media.",
    url: "https://groton.in/tools/resize",
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
    title: "Image Resizer — Change Image Dimensions Online",
    description: "Resize images online with precise pixel dimensions, percentage scaling, and aspect ratio locks. Perfect for e-commerce and social media.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
