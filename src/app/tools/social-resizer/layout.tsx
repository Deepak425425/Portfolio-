import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Social Media Image Resizer — Format for All Platforms",
  description: "Instantly resize and format images for Instagram, Twitter, Facebook, YouTube, and LinkedIn. A free online image tool by Groton AI.",
  alternates: {
    canonical: "/tools/social-resizer",
  },
  openGraph: {
    title: "Social Media Image Resizer — Format for All Platforms",
    description: "Instantly resize and format images for Instagram, Twitter, Facebook, YouTube, and LinkedIn. A free online image tool by Groton AI.",
    url: "https://groton.in/tools/social-resizer",
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
    title: "Social Media Image Resizer — Format for All Platforms",
    description: "Instantly resize and format images for Instagram, Twitter, Facebook, YouTube, and LinkedIn. A free online image tool by Groton AI.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
