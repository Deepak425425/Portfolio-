import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watermark Creator — Protect Your Images Online",
  description: "Add repeating text or logo watermarks to your photos to protect your intellectual property. A free and secure online watermark tool.",
  alternates: {
    canonical: "/tools/watermark",
  },
  openGraph: {
    title: "Watermark Creator — Protect Your Images Online",
    description: "Add repeating text or logo watermarks to your photos to protect your intellectual property. A free and secure online watermark tool.",
    url: "https://groton.in/tools/watermark",
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
    title: "Watermark Creator — Protect Your Images Online",
    description: "Add repeating text or logo watermarks to your photos to protect your intellectual property. A free and secure online watermark tool.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
