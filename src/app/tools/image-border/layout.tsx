import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Border Maker — Add Frames to Images",
  description: "Add classic, vintage, Polaroid, double, film and custom borders to images. A premium online image border tool with high-resolution export.",
  alternates: {
    canonical: "/tools/image-border",
  },
  openGraph: {
    title: "Image Border Maker — Add Frames to Images",
    description: "Add classic, vintage, Polaroid, double, film and custom borders to images. A premium online image border tool with high-resolution export.",
    url: "https://groton.in/tools/image-border",
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
    title: "Image Border Maker — Add Frames to Images",
    description: "Add classic, vintage, Polaroid, double, film and custom borders to images. A premium online image border tool with high-resolution export.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
