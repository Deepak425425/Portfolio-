import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Image Renamer — Rename Multiple Files Online",
  description: "Rename hundreds of images at once with custom patterns, sequential numbering, and find-and-replace rules. A powerful online utility for photographers.",
  alternates: {
    canonical: "/tools/bulk-image-renamer",
  },
  openGraph: {
    title: "Bulk Image Renamer — Rename Multiple Files Online",
    description: "Rename hundreds of images at once with custom patterns, sequential numbering, and find-and-replace rules. A powerful online utility for photographers.",
    url: "https://groton.in/tools/bulk-image-renamer",
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
    title: "Bulk Image Renamer — Rename Multiple Files Online",
    description: "Rename hundreds of images at once with custom patterns, sequential numbering, and find-and-replace rules. A powerful online utility for photographers.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
