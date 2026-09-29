import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Color Picker — Sample Exact Pixel Colors Online",
  description: "Upload an image and click anywhere to extract the exact HEX, RGB, and HSL color values. A fast and precise online image tool.",
  alternates: {
    canonical: "/tools/color-picker",
  },
  openGraph: {
    title: "Image Color Picker — Sample Exact Pixel Colors Online",
    description: "Upload an image and click anywhere to extract the exact HEX, RGB, and HSL color values. A fast and precise online image tool.",
    url: "https://groton.in/tools/color-picker",
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
    title: "Image Color Picker — Sample Exact Pixel Colors Online",
    description: "Upload an image and click anywhere to extract the exact HEX, RGB, and HSL color values. A fast and precise online image tool.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
