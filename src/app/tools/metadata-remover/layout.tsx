import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EXIF Metadata Remover — Strip Image Data for Privacy",
  description: "Remove EXIF data, GPS location, and camera metadata from photos online. Protect your privacy before sharing images with Groton's free tool.",
  alternates: {
    canonical: "/tools/metadata-remover",
  },
  openGraph: {
    title: "EXIF Metadata Remover — Strip Image Data for Privacy",
    description: "Remove EXIF data, GPS location, and camera metadata from photos online. Protect your privacy before sharing images with Groton's free tool.",
    url: "https://groton.in/tools/metadata-remover",
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
    title: "EXIF Metadata Remover — Strip Image Data for Privacy",
    description: "Remove EXIF data, GPS location, and camera metadata from photos online. Protect your privacy before sharing images with Groton's free tool.",
    images: ["https://groton.in/og-tools.jpg"],
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
