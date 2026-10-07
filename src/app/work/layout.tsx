import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Selected Work — Premium Campaign Visuals | GROTON AI",
  description: "Explore the GROTON AI portfolio of premium AI-powered product imagery, campaign visuals, and creative direction for modern brands.",
  alternates: {
    canonical: "https://groton.in/work",
  },
  openGraph: {
    title: "Selected Work — Premium Campaign Visuals | GROTON AI",
    description: "Explore the GROTON AI portfolio of premium AI-powered product imagery, campaign visuals, and creative direction for modern brands.",
    url: "https://groton.in/work",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/work/groton-20.jpg",
        width: 1200,
        height: 800,
        alt: "Selected Work — GROTON AI STUDIO",
      },
      {
        url: "/work/groton-20.jpg",
        width: 1200,
        height: 800,
        alt: "Selected Work — GROTON AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selected Work — Premium Campaign Visuals | GROTON AI",
    description: "Explore the GROTON AI portfolio of premium AI-powered product imagery, campaign visuals, and creative direction for modern brands.",
    images: ["https://groton.in/work/groton-20.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
