import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rounded Image Tool — Add Curved Corners to Photos",
  description: "Add smooth rounded corners to your images and export as transparent PNGs online. A modern and free image formatting tool.",
  alternates: {
    canonical: "/tools/rounded-image",
  },
  openGraph: {
    title: "Rounded Image Tool — Add Curved Corners to Photos",
    description: "Add smooth rounded corners to your images and export as transparent PNGs online. A modern and free image formatting tool.",
    url: "https://groton.in/tools/rounded-image",
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
    title: "Rounded Image Tool — Add Curved Corners to Photos",
    description: "Add smooth rounded corners to your images and export as transparent PNGs online. A modern and free image formatting tool.",
    images: ["https://groton.in/og-tools.jpg"],
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
