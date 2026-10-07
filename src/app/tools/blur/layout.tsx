import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Blur Tool — Blur Photos & Hide Information Online",
  description: "Apply gaussian blur, obscure sensitive information, or create soft depth-of-field effects online. A free and fast image editor by Groton AI.",
  alternates: {
    canonical: "/tools/blur",
  },
  openGraph: {
    title: "Image Blur Tool — Blur Photos & Hide Information Online",
    description: "Apply gaussian blur, obscure sensitive information, or create soft depth-of-field effects online. A free and fast image editor by Groton AI.",
    url: "https://groton.in/tools/blur",
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
    title: "Image Blur Tool — Blur Photos & Hide Information Online",
    description: "Apply gaussian blur, obscure sensitive information, or create soft depth-of-field effects online. A free and fast image editor by Groton AI.",
    images: ["https://groton.in/og-tools.jpg"],
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
