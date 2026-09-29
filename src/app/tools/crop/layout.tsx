import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Cropper — Crop Photos Online for Free",
  description: "Crop images precisely with custom aspect ratios, freeform cropping, and high-resolution export. A fast and free online image cropper by Groton.",
  alternates: {
    canonical: "/tools/crop",
  },
  openGraph: {
    title: "Image Cropper — Crop Photos Online for Free",
    description: "Crop images precisely with custom aspect ratios, freeform cropping, and high-resolution export. A fast and free online image cropper by Groton.",
    url: "https://groton.in/tools/crop",
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
    title: "Image Cropper — Crop Photos Online for Free",
    description: "Crop images precisely with custom aspect ratios, freeform cropping, and high-resolution export. A fast and free online image cropper by Groton.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
