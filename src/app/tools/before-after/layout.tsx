import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Before & After Image Tool — Create Comparison Sliders Online",
  description: "Generate interactive before and after image comparison sliders. Perfect for showcasing retouching, editing, and transformations. Free online image tool by Groton AI.",
  alternates: {
    canonical: "/tools/before-after",
  },
  openGraph: {
    title: "Before & After Image Tool — Create Comparison Sliders Online",
    description: "Generate interactive before and after image comparison sliders. Perfect for showcasing retouching, editing, and transformations. Free online image tool by Groton AI.",
    url: "https://groton.in/tools/before-after",
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
    title: "Before & After Image Tool — Create Comparison Sliders Online",
    description: "Generate interactive before and after image comparison sliders. Perfect for showcasing retouching, editing, and transformations. Free online image tool by Groton AI.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
