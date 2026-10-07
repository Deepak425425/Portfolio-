import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Cleanup Tool — Remove Unwanted Elements",
  description: "Clean up photos, remove dust, scratches, and minor imperfections online using advanced browser-based tools by Groton AI.",
  alternates: {
    canonical: "/tools/image-cleanup",
  },
  openGraph: {
    title: "Image Cleanup Tool — Remove Unwanted Elements",
    description: "Clean up photos, remove dust, scratches, and minor imperfections online using advanced browser-based tools by Groton AI.",
    url: "https://groton.in/tools/image-cleanup",
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
    title: "Image Cleanup Tool — Remove Unwanted Elements",
    description: "Clean up photos, remove dust, scratches, and minor imperfections online using advanced browser-based tools by Groton AI.",
    images: ["https://groton.in/og-tools.jpg"],
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
