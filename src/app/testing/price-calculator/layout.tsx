import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GROTON Price Calculator — Estimate Your Visual Production Cost",
  description: "Estimate your GROTON product imagery and creative production cost with the online price calculator.",
  alternates: {
    canonical: "/price-calculator",
  },
  openGraph: {
    title: "GROTON Price Calculator — Estimate Your Visual Production Cost",
    description: "Estimate your GROTON product imagery and creative production cost with the online price calculator.",
    url: "https://groton.in/price-calculator",
    siteName: "GROTON AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GROTON AI",
      },
    ],
    type: "website",
  },
};

export default function PriceCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
