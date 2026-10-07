import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HEX → Color Converter — Real-time RGB & HSL Utility | GROTON AI",
  description: "Convert HEX color codes to RGB and HSL values with instant live preview, format copying, and synchronized color picking.",
  alternates: {
    canonical: "/tools/hex-to-color",
  },
  openGraph: {
    title: "HEX → Color Converter — Real-time RGB & HSL Utility | GROTON AI",
    description: "Convert HEX color codes to RGB and HSL values with instant live preview, format copying, and synchronized color picking.",
    url: "https://groton.in/tools/hex-to-color",
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
    title: "HEX → Color Converter — Real-time RGB & HSL Utility | GROTON AI",
    description: "Convert HEX color codes to RGB and HSL values with instant live preview, format copying, and synchronized color picking.",
    images: ["https://groton.in/og-tools.jpg"],
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
