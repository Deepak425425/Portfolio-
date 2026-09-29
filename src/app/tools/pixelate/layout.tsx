import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Pixelator — Censor Photos & Create 8-Bit Art",
  description: "Pixelate faces, censor sensitive information, or create retro 8-bit aesthetic art online. A fast and free image editor by Groton AI.",
  alternates: {
    canonical: "/tools/pixelate",
  },
  openGraph: {
    title: "Image Pixelator — Censor Photos & Create 8-Bit Art",
    description: "Pixelate faces, censor sensitive information, or create retro 8-bit aesthetic art online. A fast and free image editor by Groton AI.",
    url: "https://groton.in/tools/pixelate",
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
    title: "Image Pixelator — Censor Photos & Create 8-Bit Art",
    description: "Pixelate faces, censor sensitive information, or create retro 8-bit aesthetic art online. A fast and free image editor by Groton AI.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
