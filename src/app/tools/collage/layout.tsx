import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collage Maker — Create Photo Grids & Layouts Online",
  description: "Combine multiple photos into beautiful grids and collages. Customizable layouts, spacing, and dimensions. A free online image collage maker by Groton.",
  alternates: {
    canonical: "/tools/collage",
  },
  openGraph: {
    title: "Collage Maker — Create Photo Grids & Layouts Online",
    description: "Combine multiple photos into beautiful grids and collages. Customizable layouts, spacing, and dimensions. A free online image collage maker by Groton.",
    url: "https://groton.in/tools/collage",
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
    title: "Collage Maker — Create Photo Grids & Layouts Online",
    description: "Combine multiple photos into beautiful grids and collages. Customizable layouts, spacing, and dimensions. A free online image collage maker by Groton.",
    images: ["https://groton.in/og-tools.jpg"],
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
