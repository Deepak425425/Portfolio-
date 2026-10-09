import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: {
    absolute: "GROTON AI Studio | AI Product Photography & Commercial Visuals",
  },
  description:
    "GROTON is an AI-powered creative studio producing high-end product photography, product-on-model imagery, and campaign visuals for modern e-commerce brands.",
  alternates: {
    canonical: "https://groton.in",
  },
  openGraph: {
    title: "GROTON AI Studio | AI Product Photography & Commercial Visuals",
    description:
      "GROTON is an AI-powered creative studio producing high-end product photography, product-on-model imagery, and campaign visuals for modern e-commerce brands.",
    url: "https://groton.in",
    siteName: "GROTON AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://groton.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GROTON AI Studio | AI Product Photography & Commercial Visuals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GROTON AI Studio | AI Product Photography & Commercial Visuals",
    description:
      "GROTON is an AI-powered creative studio producing high-end product photography, product-on-model imagery, and campaign visuals for modern e-commerce brands.",
    images: ["https://groton.in/og-image.jpg"],
  },
};

export default function Home() {
  return <HomePageClient />;
}
