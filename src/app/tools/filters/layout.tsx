import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Filters & Colour Grading — Professional Photo Effects",
  description: "Apply cinematic image effects, film looks, editorial filters and professional colour grading directly in your browser with Groton's creative studio.",
  alternates: {
    canonical: "/tools/filters",
  },
  openGraph: {
    title: "Image Filters & Colour Grading — Professional Photo Effects",
    description: "Apply cinematic image effects, film looks, editorial filters and professional colour grading directly in your browser with Groton's creative studio.",
    url: "https://groton.in/tools/filters",
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
    title: "Image Filters & Colour Grading — Professional Photo Effects",
    description: "Apply cinematic image effects, film looks, editorial filters and professional colour grading directly in your browser with Groton's creative studio.",
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
