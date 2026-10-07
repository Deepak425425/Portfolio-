import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meme Generator — Add Text to Images Online",
  description: "Create memes online quickly. Add classic impact font, custom text, and captions to any image. Free browser-based image editor.",
  alternates: {
    canonical: "/tools/meme",
  },
  openGraph: {
    title: "Meme Generator — Add Text to Images Online",
    description: "Create memes online quickly. Add classic impact font, custom text, and captions to any image. Free browser-based image editor.",
    url: "https://groton.in/tools/meme",
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
    title: "Meme Generator — Add Text to Images Online",
    description: "Create memes online quickly. Add classic impact font, custom text, and captions to any image. Free browser-based image editor.",
    images: ["https://groton.in/og-tools.jpg"],
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
