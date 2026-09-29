import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate & Flip Image — Mirror Photos Online",
  description: "Rotate images by degrees, flip horizontally, or mirror vertically online. Quick and free browser-based image adjustment tool.",
  alternates: {
    canonical: "/tools/rotate-flip",
  },
  openGraph: {
    title: "Rotate & Flip Image — Mirror Photos Online",
    description: "Rotate images by degrees, flip horizontally, or mirror vertically online. Quick and free browser-based image adjustment tool.",
    url: "https://groton.in/tools/rotate-flip",
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
    title: "Rotate & Flip Image — Mirror Photos Online",
    description: "Rotate images by degrees, flip horizontally, or mirror vertically online. Quick and free browser-based image adjustment tool.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
